/**
 * Sync all-products.json → Shopify via Admin GraphQL `productSet` (idempotent upsert by handle).
 *
 * Images per product:
 *   - Primary CDN images from all-products.json (included on first create)
 *   - Extra product photos from public/images/{slug}/ via image-manifest.json
 *     (stage-uploaded via stagedUploadsCreate; the first manifest image is
 *     skipped to avoid duplicating the CDN primary)
 *
 * Usage:
 *   node scripts/sync-catalog-to-shopify.mjs                # full sync with all images
 *   node scripts/sync-catalog-to-shopify.mjs --dry-run      # parse only, no API calls
 *   node scripts/sync-catalog-to-shopify.mjs --limit 5      # first 5 products
 *   node scripts/sync-catalog-to-shopify.mjs --skip-publish  # create but don't publish
 *   node scripts/sync-catalog-to-shopify.mjs --delay 500    # 500ms between calls (default 300)
 */
import dotenv from 'dotenv';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// ── CLI flags ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const flagVal = (name, fallback) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};

const DRY_RUN = flag('dry-run');
const LIMIT = parseInt(flagVal('limit', '0'), 10) || 0;
const SKIP_PUBLISH = flag('skip-publish');
const DELAY_MS = parseInt(flagVal('delay', '300'), 10) || 300;

// ── Shopify Admin credentials ──────────────────────────────────────────────
const domain =
  process.env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, '').trim() || '';
const shop = domain.replace(/\.myshopify\.com$/i, '');
const clientId = process.env.SHOPIFY_CLIENT_ID?.trim() || '';
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim() || '';
const adminVersion =
  process.env.SHOPIFY_API_VERSION?.trim() ||
  process.env.PUBLIC_STOREFRONT_API_VERSION?.trim() ||
  '2026-01';

if (!shop || !clientId || !clientSecret) {
  console.error(
    'Missing SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET / PUBLIC_STORE_DOMAIN in .env.local',
  );
  process.exit(1);
}

// ── Admin token ────────────────────────────────────────────────────────────
let adminToken = null;

async function getToken() {
  if (adminToken) return adminToken;
  const res = await fetch(
    `https://${shop}.myshopify.com/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Admin token exchange failed: HTTP ${res.status}`);
  }
  adminToken = json.access_token;
  return adminToken;
}

// ── Admin GraphQL helper ───────────────────────────────────────────────────
async function adminGQL(query, variables) {
  const token = await getToken();
  const url = `https://${shop}.myshopify.com/admin/api/${adminVersion}/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Admin API HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

// ── GraphQL operations (validated via Shopify MCP) ─────────────────────────
const PRODUCT_SET_MUTATION = `#graphql
  mutation ProductSetSync($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
    productSet(synchronous: true, input: $input, identifier: $identifier) {
      product {
        id
        handle
        title
        status
        variants(first: 5) {
          nodes {
            id
            price
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const LIST_PUBLICATIONS_QUERY = `#graphql
  query ListPublications {
    publications(first: 20) {
      edges {
        node {
          id
          autoPublish
        }
      }
    }
  }
`;

const PUBLISH_PRODUCT_MUTATION = `#graphql
  mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product {
          id
          handle
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const STAGED_UPLOADS_CREATE = `#graphql
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PROJECT_ROOT = join(__dirname, '..');

/**
 * Stage-upload local files to Shopify and return their resource URLs.
 */
async function stageUploadFiles(absolutePaths) {
  if (absolutePaths.length === 0) return [];

  const fileMeta = absolutePaths.map((p) => {
    const ext = extname(p).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const size = statSync(p).size;
    return { path: p, filename: basename(p), mimeType: mime, fileSize: String(size) };
  });

  const input = fileMeta.map((f) => ({
    filename: f.filename,
    mimeType: f.mimeType,
    resource: 'IMAGE',
    fileSize: f.fileSize,
    httpMethod: 'POST',
  }));

  const result = await adminGQL(STAGED_UPLOADS_CREATE, { input });
  const targets = result.data?.stagedUploadsCreate?.stagedTargets || [];
  const errors = result.data?.stagedUploadsCreate?.userErrors || [];
  if (errors.length > 0) {
    throw new Error(`stagedUploadsCreate errors: ${errors.map((e) => e.message).join('; ')}`);
  }
  if (targets.length !== fileMeta.length) {
    throw new Error(`Expected ${fileMeta.length} staged targets, got ${targets.length}`);
  }

  const resourceUrls = [];
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const meta = fileMeta[i];

    const formData = new FormData();
    for (const param of target.parameters) {
      formData.append(param.name, param.value);
    }
    const fileBuffer = readFileSync(meta.path);
    formData.append('file', new Blob([fileBuffer], { type: meta.mimeType }), meta.filename);

    const uploadRes = await fetch(target.url, { method: 'POST', body: formData });
    if (!uploadRes.ok && uploadRes.status >= 400) {
      console.log(`  staged upload HTTP ${uploadRes.status} for ${meta.filename} — skipping`);
      continue;
    }
    resourceUrls.push(target.resourceUrl);
  }

  return resourceUrls;
}

// ── Price parser ───────────────────────────────────────────────────────────
function parsePrice(product) {
  const raw = product.price_from || product.price || '';
  const match = raw.match(/[\d]+(?:\.[\d]+)?/);
  if (match) return match[0];
  return '0.00';
}

// ── Title cleaner ──────────────────────────────────────────────────────────
function cleanTitle(raw) {
  if (!raw || !raw.trim()) return 'Untitled';
  const t = raw.trim();
  if (t === t.toUpperCase() && /[A-Z]/.test(t)) {
    return t
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase());
  }
  return t;
}

// ── Build productSet input from a JSON product ─────────────────────────────
function buildProductSetInput(product, stagedResourceUrls = []) {
  const handle = product.slug;
  const title = cleanTitle(product.title);
  const price = parsePrice(product);
  const descriptionHtml =
    product.main_description || product.tagline || '';
  const categories = Array.isArray(product.categories) ? product.categories : [];
  const productType = categories[0] || '';
  const tags = [...categories];

  const files = [];

  // Only include CDN images when there are no staged extras — avoids
  // duplicating media if the product already exists from a previous run.
  if (stagedResourceUrls.length === 0) {
    const httpsImages = (product.images || [])
      .filter((u) => typeof u === 'string' && u.startsWith('https://'))
      .slice(0, 5);

    for (let i = 0; i < httpsImages.length; i++) {
      files.push({
        originalSource: httpsImages[i],
        contentType: 'IMAGE',
        alt: `${title} - image ${i + 1}`,
      });
    }
  }

  for (let i = 0; i < stagedResourceUrls.length; i++) {
    files.push({
      originalSource: stagedResourceUrls[i],
      contentType: 'IMAGE',
      alt: `${title} - image ${i + 2}`,
    });
  }

  return {
    identifier: { handle },
    input: {
      title,
      handle,
      descriptionHtml: descriptionHtml.slice(0, 5000),
      status: 'ACTIVE',
      productType,
      tags,
      productOptions: [
        { name: 'Title', values: [{ name: 'Default Title' }] },
      ],
      variants: [
        {
          optionValues: [{ optionName: 'Title', name: 'Default Title' }],
          price: parseFloat(price) || 0,
        },
      ],
      ...(files.length > 0 ? { files } : {}),
    },
  };
}

// ── Sleep helper ───────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Shopify Catalog Sync ===');
  console.log(`Store: ${shop}.myshopify.com`);
  console.log(`Admin API version: ${adminVersion}`);
  console.log(
    `Flags: dry-run=${DRY_RUN} limit=${LIMIT || 'all'} skip-publish=${SKIP_PUBLISH} delay=${DELAY_MS}ms`,
  );
  console.log('');

  // Load catalog
  const dataDir = join(__dirname, '..', 'app', 'data');
  const jsonPath = join(dataDir, 'all-products.json');
  const allProducts = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const products = LIMIT > 0 ? allProducts.slice(0, LIMIT) : allProducts;

  // Load image manifest for extra local images
  let manifestProducts = {};
  try {
    const manifest = JSON.parse(readFileSync(join(dataDir, 'image-manifest.json'), 'utf8'));
    manifestProducts = manifest.products || {};
  } catch {
    console.log('Warning: image-manifest.json not found, local images unavailable');
  }

  // Attach resolved local image paths to each product (skip first = CDN primary)
  const MAX_EXTRA_IMAGES = 4;
  for (const p of allProducts) {
    const allLocal = manifestProducts[p.slug] || [];
    p._localExtraImages = allLocal
      .slice(1, 1 + MAX_EXTRA_IMAGES)
      .map((relPath) => {
        const abs = join(PROJECT_ROOT, 'public', relPath);
        return existsSync(abs) ? abs : null;
      })
      .filter(Boolean);
  }

  const totalLocalImages = products.reduce((sum, p) => sum + p._localExtraImages.length, 0);
  const withLocalExtra = products.filter((p) => p._localExtraImages.length > 0).length;
  console.log(
    `Loaded ${allProducts.length} products, processing ${products.length}`,
  );
  console.log(
    `Local extra images: ${totalLocalImages} files across ${withLocalExtra} products (will be staged-uploaded)`,
  );

  if (DRY_RUN) {
    console.log('\n--- DRY RUN (no API calls) ---\n');
    for (const p of products) {
      const { identifier, input } = buildProductSetInput(p);
      console.log(
        `[${identifier.handle}] "${input.title}" $${input.variants[0].price} | CDN: ${input.files?.length ?? 0} | local+: ${p._localExtraImages.length} | type: ${input.productType || '(none)'}`,
      );
    }
    console.log(`\nDone. ${products.length} products would be synced (${totalLocalImages} extra images to stage-upload).`);
    return;
  }

  // Get admin token early to fail fast
  await getToken();
  console.log('Admin token OK\n');

  // Discover publications for publishing step
  let publicationIds = [];
  if (!SKIP_PUBLISH) {
    try {
      const pubResult = await adminGQL(LIST_PUBLICATIONS_QUERY);
      if (pubResult.errors?.length) {
        const accessDenied = pubResult.errors.some(
          (e) => e.extensions?.code === 'ACCESS_DENIED',
        );
        if (accessDenied) {
          console.log(
            'WARNING: read_publications scope not granted — skipping publish step.',
          );
          console.log(
            '  Products will be created with ACTIVE status. To make them visible on Storefront API,',
          );
          console.log(
            '  add read_publications + write_publications scopes in Dev Dashboard, OR',
          );
          console.log(
            '  manually publish products in Shopify Admin → Products → select all → Make available.\n',
          );
        } else {
          console.log('Publications query errors:', pubResult.errors.map((e) => e.message).join('; '));
        }
      } else {
        const pubEdges = pubResult.data?.publications?.edges || [];
        publicationIds = pubEdges.map((e) => e.node.id);
        console.log(`Found ${publicationIds.length} publication(s) to publish to`);
        if (publicationIds.length === 0) {
          console.log(
            '  WARNING: No publications found. Products will be created but may not be visible on any channel.',
          );
        }
      }
    } catch (err) {
      console.log('Publications query failed:', err.message, '— skipping publish.');
    }
    console.log('');
  }

  // Sync loop
  let created = 0;
  let failed = 0;
  let published = 0;
  let imagesUploaded = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const label = `[${i + 1}/${products.length}] ${product.slug}`;

    // Stage-upload extra local images
    let stagedUrls = [];
    if (product._localExtraImages.length > 0) {
      try {
        stagedUrls = await stageUploadFiles(product._localExtraImages);
        if (stagedUrls.length > 0) {
          console.log(`${label} staged ${stagedUrls.length} extra image(s)`);
          imagesUploaded += stagedUrls.length;
        }
      } catch (uploadErr) {
        console.log(`${label} staged upload error: ${uploadErr.message} — continuing with CDN images only`);
      }
    }

    const { identifier, input } = buildProductSetInput(product, stagedUrls);

    try {
      const result = await adminGQL(PRODUCT_SET_MUTATION, {
        input,
        identifier,
      });

      const payload = result.data?.productSet;
      const userErrors = payload?.userErrors || [];

      if (userErrors.length > 0) {
        console.log(`${label} ERRORS:`);
        for (const e of userErrors) {
          console.log(`  - ${e.field?.join('.')}: ${e.message}`);
        }
        failed++;
      } else {
        const p = payload?.product;
        const variantPrice = p?.variants?.nodes?.[0]?.price ?? '?';
        console.log(
          `${label} OK → ${p?.id} | $${variantPrice} | ${p?.status}`,
        );
        created++;

        // Publish
        if (!SKIP_PUBLISH && publicationIds.length > 0 && p?.id) {
          try {
            const pubInput = publicationIds.map((pid) => ({
              publicationId: pid,
            }));
            const pubRes = await adminGQL(PUBLISH_PRODUCT_MUTATION, {
              id: p.id,
              input: pubInput,
            });
            const pubErrors =
              pubRes.data?.publishablePublish?.userErrors || [];
            if (pubErrors.length > 0) {
              console.log(`  publish warnings:`);
              for (const e of pubErrors) {
                console.log(`    - ${e.message}`);
              }
            } else {
              published++;
            }
          } catch (pubErr) {
            console.log(`  publish error: ${pubErr.message}`);
          }
        }
      }
    } catch (err) {
      console.log(`${label} FAILED: ${err.message}`);
      failed++;
    }

    if (i < products.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total processed: ${products.length}`);
  console.log(`Created/updated: ${created}`);
  console.log(`Extra images staged+uploaded: ${imagesUploaded}`);
  console.log(`Published: ${published}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
