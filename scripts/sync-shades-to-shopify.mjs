/**
 * Sync nail polish shades → Shopify via Admin GraphQL `productSet`.
 *
 * Aggregates all color_mapping_*.json files + shade_colors.json into
 * a unified shade catalog, de-duplicates by shade name, and creates one
 * Shopify product per shade with a single variant: 5ml mini ($9.95).
 *
 * Images per shade (same product media gallery — up to 3 product photos first):
 *   1–3. Local 01 / 02 / 03 from image-manifest → public/images/shades/ (stage-uploaded).
 *       01 is the bottle/hero; CDN swatch from color_mapping is NOT used as primary.
 *   If fewer than 3 locals exist, optional HTTPS swatch is appended last as filler only.
 *   If no local files, falls back to CDN only.
 *
 * Usage:
 *   node scripts/sync-shades-to-shopify.mjs                # full sync with all images
 *   node scripts/sync-shades-to-shopify.mjs --dry-run      # parse only, no API calls
 *   node scripts/sync-shades-to-shopify.mjs --limit 5      # first 5 shades
 *   node scripts/sync-shades-to-shopify.mjs --skip-publish  # create but don't publish
 *   node scripts/sync-shades-to-shopify.mjs --delay 500    # 500ms between calls (default 300)
 */
import dotenv from 'dotenv';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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

// ── GraphQL operations ─────────────────────────────────────────────────────
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
            title
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
 * Uses stagedUploadsCreate + multipart POST to Shopify's cloud storage.
 */
async function stageUploadFiles(absolutePaths) {
  if (absolutePaths.length === 0) return [];

  const fileMeta = absolutePaths.map((p) => {
    const ext = extname(p).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
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

// ── Shade name normalizer ──────────────────────────────────────────────────
function normalizeShade(name) {
  return name.replace(/\*+$/, '').trim();
}

/** Extract the leading shade number (e.g. "14" from "14 ST-TROPEZ"). */
function shadeNumber(name) {
  const m = name.match(/^(\d+)/);
  return m ? m[1] : name;
}

// ── Handle generator ───────────────────────────────────────────────────────
function shadeToHandle(shadeName) {
  const norm = normalizeShade(shadeName);
  return (
    'mavala-shade-' +
    norm
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  );
}

// ── Title generator ────────────────────────────────────────────────────────
function shadeToTitle(shadeName) {
  const norm = normalizeShade(shadeName);
  const parts = norm.split(/\s+/);
  const number = parts[0];
  const city = parts
    .slice(1)
    .map(
      (w) =>
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(' ');
  return `Mavala ${number} ${city}`.trim();
}

// ── Aggregate shades from all color_mapping files ──────────────────────────
function aggregateShades() {
  const dataDir = join(__dirname, '..', 'app', 'data');

  // Load shade_colors.json for hex/rgb enrichment
  const shadeColorsPath = join(dataDir, 'shade_colors.json');
  let shadeColorsMap = {};
  try {
    shadeColorsMap = JSON.parse(readFileSync(shadeColorsPath, 'utf8'));
  } catch {
    console.log('Warning: shade_colors.json not found, hex data unavailable');
  }

  // Unified shade map: normalized name → { image, hex, rgb, colors: Set, collections: Set }
  const shadesMap = new Map();

  const files = readdirSync(dataDir).filter(
    (f) => f.startsWith('color_mapping_') && f.endsWith('.json'),
  );

  for (const file of files) {
    const filePath = join(dataDir, file);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    const collectionSlug = data.product_slug || file.replace('color_mapping_', '').replace('.json', '');
    const shadeDetails = data.shade_details || [];

    for (const detail of shadeDetails) {
      const key = normalizeShade(detail.name);
      if (!shadesMap.has(key)) {
        shadesMap.set(key, {
          name: key,
          image: null,
          hex: null,
          rgb: null,
          colors: new Set(),
          collections: new Set(),
        });
      }
      const entry = shadesMap.get(key);

      if (
        detail.image &&
        detail.image.startsWith('https://') &&
        !entry.image
      ) {
        entry.image = detail.image;
      }

      if (detail.color) {
        entry.colors.add(detail.color);
      }

      entry.collections.add(collectionSlug);
    }
  }

  // Enrich with hex/rgb from shade_colors.json
  for (const [key, entry] of shadesMap) {
    const colorData = shadeColorsMap[key];
    if (colorData) {
      entry.hex = colorData.hex || null;
      entry.rgb = colorData.rgb || null;
    }
  }

  // Also add any shades from shade_colors.json not already covered
  for (const [shadeName, colorData] of Object.entries(shadeColorsMap)) {
    const key = normalizeShade(shadeName);
    if (!shadesMap.has(key)) {
      shadesMap.set(key, {
        name: key,
        image: null,
        hex: colorData.hex || null,
        rgb: colorData.rgb || null,
        colors: new Set(),
        collections: new Set(),
      });
    }
  }

  // De-duplicate by shade number: same number (e.g. "14") with different
  // spellings ("ST-TROPEZ" vs "ST TROPEZ") should be merged into one entry.
  // Prefer the variant that has an image and more collections.
  const byNumber = new Map();
  for (const entry of shadesMap.values()) {
    const num = shadeNumber(entry.name);
    if (!byNumber.has(num)) {
      byNumber.set(num, entry);
    } else {
      const existing = byNumber.get(num);
      // Merge: keep the one with an image; merge colors + collections
      for (const c of entry.colors) existing.colors.add(c);
      for (const c of entry.collections) existing.collections.add(c);
      if (!existing.image && entry.image) existing.image = entry.image;
      if (!existing.hex && entry.hex) existing.hex = entry.hex;
      if (!existing.rgb && entry.rgb) existing.rgb = entry.rgb;
    }
  }

  // Load image-manifest.json for local shade images
  const manifestPath = join(dataDir, 'image-manifest.json');
  let manifestShades = {};
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifestShades = manifest.shades || {};
  } catch {
    console.log('Warning: image-manifest.json not found, local images unavailable');
  }

  // Build shade number → manifest local images lookup
  const manifestByNumber = {};
  for (const [shadeName, images] of Object.entries(manifestShades)) {
    const num = shadeNumber(shadeName);
    if (!manifestByNumber[num]) {
      manifestByNumber[num] = images;
    }
  }

  // Convert to sorted array
  const shades = [...byNumber.values()].sort((a, b) => {
    const numA = parseInt(a.name.match(/^\d+/)?.[0] || '9999', 10);
    const numB = parseInt(b.name.match(/^\d+/)?.[0] || '9999', 10);
    return numA - numB;
  });

  // Stage local 01–03 in order (hero bottle first — matches manifest / site UX)
  for (const shade of shades) {
    const num = shadeNumber(shade.name);
    const allLocal = manifestByNumber[num] || [];
    const resolved = allLocal
      .map((relPath) => {
        const abs = join(PROJECT_ROOT, 'public', relPath);
        return existsSync(abs) ? abs : null;
      })
      .filter(Boolean);

    shade.localImages = resolved.slice(0, 3);
  }

  return shades;
}

// ── Build productSet input for a shade ─────────────────────────────────────
/** Single sellable size: 5ml mini only (no 10ml in this catalog). */
const PRICE_5ML = 9.95;

/** Collection slugs from color_mapping that imply 10ml only — we sell 5ml mini, not those kits. */
const EXCLUDED_SHADE_TAGS = new Set(['10ml-bottles']);

function buildShadeProductInput(shade, stagedResourceUrls = []) {
  const handle = shadeToHandle(shade.name);
  const title = shadeToTitle(shade.name);
  const collectionTags = [...shade.collections].filter((t) => !EXCLUDED_SHADE_TAGS.has(t));
  const tags = [
    'nail-polish',
    'shade',
    '5ml-mini',
    ...[...shade.colors],
    ...collectionTags,
  ];
  const productType = 'Nail Polish';

  const hexInfo = shade.hex ? ` Color: ${shade.hex}.` : '';
  const descriptionHtml = `<p>${title} — Mavala nail polish.${hexInfo}</p><p>5ml mini. 13-Free, toxic-free, cruelty-free formula.</p>`;

  // Gallery: product photos first (01 → 02 → 03), then CDN swatch only to pad missing slots
  const files = [];
  for (let i = 0; i < stagedResourceUrls.length; i++) {
    files.push({
      originalSource: stagedResourceUrls[i],
      contentType: 'IMAGE',
      alt: `${title} — ${i === 0 ? 'main' : `image ${i + 1}`}`,
    });
  }
  if (shade.image && files.length < 3) {
    files.push({
      originalSource: shade.image,
      contentType: 'IMAGE',
      alt: `${title} — color swatch`,
    });
  }

  return {
    identifier: { handle },
    input: {
      title,
      handle,
      descriptionHtml,
      status: 'ACTIVE',
      productType,
      tags,
      productOptions: [
        { name: 'Title', values: [{ name: 'Default Title' }] },
      ],
      variants: [
        {
          optionValues: [{ optionName: 'Title', name: 'Default Title' }],
          price: PRICE_5ML,
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
  console.log('=== Shopify Shade Sync ===');
  console.log(`Store: ${shop}.myshopify.com`);
  console.log(`Admin API version: ${adminVersion}`);
  console.log(
    `Flags: dry-run=${DRY_RUN} limit=${LIMIT || 'all'} skip-publish=${SKIP_PUBLISH} delay=${DELAY_MS}ms`,
  );
  console.log('');

  // Aggregate all shades
  const allShades = aggregateShades();
  const shades = LIMIT > 0 ? allShades.slice(0, LIMIT) : allShades;

  const withImage = allShades.filter((s) => s.image).length;
  const withHex = allShades.filter((s) => s.hex).length;
  const withLocalExtra = allShades.filter((s) => s.localImages.length > 0).length;
  const totalLocalImages = allShades.reduce((sum, s) => sum + s.localImages.length, 0);
  console.log(
    `Aggregated ${allShades.length} unique shades (${withImage} with CDN image, ${withHex} with hex), processing ${shades.length}`,
  );
  console.log(
    `Local extra images: ${totalLocalImages} files across ${withLocalExtra} shades (will be staged-uploaded)`,
  );

  if (DRY_RUN) {
    console.log('\n--- DRY RUN (no API calls) ---\n');
    for (const s of shades) {
      const { identifier, input } = buildShadeProductInput(s);
      console.log(
        `[${identifier.handle}] "${input.title}" $${PRICE_5ML} (5ml) | CDN: ${s.image ? 'yes' : 'NO'} | stage local: ${s.localImages.length} | hex: ${s.hex || '?'} | colors: ${[...s.colors].join(',')}`,
      );
    }
    console.log(`\nDone. ${shades.length} shades would be synced (${totalLocalImages} extra images to stage-upload).`);
    return;
  }

  // Get admin token early to fail fast
  await getToken();
  console.log('Admin token OK\n');

  // Discover publications
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
            '  Products will be created with ACTIVE status.',
          );
          console.log(
            '  Bulk-publish manually in Shopify Admin afterwards.\n',
          );
        } else {
          console.log(
            'Publications query errors:',
            pubResult.errors.map((e) => e.message).join('; '),
          );
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
      console.log(
        'Publications query failed:',
        err.message,
        '— skipping publish.',
      );
    }
    console.log('');
  }

  // Sync loop
  let created = 0;
  let failed = 0;
  let published = 0;

  let imagesUploaded = 0;

  for (let i = 0; i < shades.length; i++) {
    const shade = shades[i];
    const label = `[${i + 1}/${shades.length}] ${shadeToHandle(shade.name)}`;

    // Stage-upload extra local images (02.png, 03.png, …)
    let stagedUrls = [];
    if (shade.localImages.length > 0) {
      try {
        stagedUrls = await stageUploadFiles(shade.localImages);
        if (stagedUrls.length > 0) {
          console.log(`${label} staged ${stagedUrls.length} extra image(s)`);
          imagesUploaded += stagedUrls.length;
        }
      } catch (uploadErr) {
        console.log(`${label} staged upload error: ${uploadErr.message} — continuing with CDN image only`);
      }
    }

    const { identifier, input } = buildShadeProductInput(shade, stagedUrls);

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
        const varCount = p?.variants?.nodes?.length ?? 0;
        console.log(
          `${label} OK → ${p?.id} | ${varCount} variants | ${p?.status}`,
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

    if (i < shades.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total processed: ${shades.length}`);
  console.log(`Created/updated: ${created}`);
  console.log(`Extra images staged+uploaded: ${imagesUploaded}`);
  console.log(`Published: ${published}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
