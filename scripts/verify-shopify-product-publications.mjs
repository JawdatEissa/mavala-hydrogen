/**
 * Verifies products vs sales-channel publications (Admin API) and compares
 * visibility to the Storefront API token (same token as the custom storefront).
 *
 * Docs (Admin): publications query, Product.resourcePublications, ResourcePublication
 * https://shopify.dev/docs/api/admin-graphql/latest/queries/publications
 * https://shopify.dev/docs/api/admin-graphql/latest/objects/ResourcePublication
 *
 * Required Admin scopes: read_products, read_publications (Dev Dashboard app config)
 *
 * Does not print tokens or secrets.
 */
import dotenv from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const domain =
  process.env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, '').trim() || '';
const sfVersion = process.env.PUBLIC_STOREFRONT_API_VERSION?.trim() || '2026-01';
const sfToken =
  process.env.PRIVATE_STOREFRONT_API_TOKEN?.trim() ||
  process.env.PUBLIC_STOREFRONT_API_TOKEN?.trim() ||
  '';
const clientId = process.env.SHOPIFY_CLIENT_ID?.trim() || '';
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim() || '';
const adminVersion = process.env.SHOPIFY_API_VERSION?.trim() || sfVersion;

const PUBLICATIONS_ONLY_QUERY = `#graphql
  query ListPublications {
    publications(first: 25) {
      nodes {
        id
        catalog {
          title
        }
      }
    }
  }
`;

const PRODUCTS_AND_PUBLICATIONS_QUERY = `#graphql
  query ProductsAndPublications($firstProducts: Int!, $firstPubs: Int!) {
    products(first: $firstProducts) {
      nodes {
        id
        title
        status
        handle
        resourcePublications(first: $firstPubs) {
          nodes {
            isPublished
            publication {
              id
              catalog {
                title
              }
            }
          }
        }
      }
    }
    productsCount {
      count
    }
  }
`;

const PRODUCTS_LITE_QUERY = `#graphql
  query ProductsLite($firstProducts: Int!) {
    products(first: $firstProducts) {
      nodes {
        id
        title
        status
        handle
      }
    }
    productsCount {
      count
    }
  }
`;

function pubTitle(pub) {
  return pub?.catalog?.title?.trim() || pub?.id || '(unknown publication)';
}

async function getAdminToken(shop) {
  const tokenRes = await fetch(
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
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error('[Admin] Token exchange failed:', tokenRes.status);
    console.error(JSON.stringify(tokenJson, null, 2));
    return null;
  }
  return tokenJson.access_token;
}

async function storefrontProductCount() {
  if (!domain || !sfToken) return { ok: false, count: 0, sample: [] };

  const url = `https://${domain}/api/${sfVersion}/graphql.json`;
  const query = `#graphql
    query SfProducts {
      products(first: 50) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  `;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': sfToken,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!res.ok || json.errors?.length) {
    console.log(
      '[Storefront] Could not list products:',
      json.errors || res.status,
    );
    return { ok: false, count: 0, sample: [] };
  }
  const edges = json.data?.products?.edges || [];
  return {
    ok: true,
    count: edges.length,
    sample: edges.map((e) => ({
      handle: e.node.handle,
      title: e.node.title,
    })),
  };
}

async function main() {
  if (!domain) {
    console.error('Set PUBLIC_STORE_DOMAIN in .env.local');
    process.exit(1);
  }
  if (!clientId || !clientSecret) {
    console.error(
      'Set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET for Admin verification.',
    );
    process.exit(1);
  }

  const shop = domain.replace(/\.myshopify\.com$/i, '');
  const adminToken = await getAdminToken(shop);
  if (!adminToken) process.exit(1);

  const gqlUrl = `https://${shop}.myshopify.com/admin/api/${adminVersion}/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': adminToken,
  };

  async function adminPost(body) {
    const res = await fetch(gqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return { res, json: await res.json() };
  }

  let pubs = [];
  let publicationsSkipped = false;
  const pubRes = await adminPost({ query: PUBLICATIONS_ONLY_QUERY });
  if (!pubRes.res.ok) {
    console.error('[Admin] HTTP', pubRes.res.status);
    console.error(JSON.stringify(pubRes.json, null, 2));
    process.exit(1);
  }
  if (pubRes.json.errors?.length) {
    const denied = pubRes.json.errors.some(
      (e) =>
        /read_publications|publications field/i.test(e.message || '') ||
        e.extensions?.requiredAccess?.includes?.('read_publications'),
    );
    if (denied) {
      publicationsSkipped = true;
    } else {
      console.error(
        '[Admin] publications query errors:',
        JSON.stringify(pubRes.json.errors, null, 2),
      );
      process.exit(1);
    }
  } else {
    pubs = pubRes.json.data?.publications?.nodes || [];
  }

  let data;
  let fullPublicationDetails = true;
  const pr = await adminPost({
    query: PRODUCTS_AND_PUBLICATIONS_QUERY,
    variables: { firstProducts: 50, firstPubs: 20 },
  });
  if (!pr.res.ok) {
    console.error('[Admin] HTTP', pr.res.status);
    console.error(JSON.stringify(pr.json, null, 2));
    process.exit(1);
  }
  if (pr.json.errors?.length) {
    const denied = pr.json.errors.some((e) =>
      /read_publications|resourcePublications/i.test(e.message || ''),
    );
    if (denied) {
      console.log(
        '\n(resourcePublications skipped — same read_publications scope)\n',
      );
      const lite = await adminPost({
        query: PRODUCTS_LITE_QUERY,
        variables: { firstProducts: 50 },
      });
      if (lite.json.errors?.length) {
        console.error(
          '[Admin] products query errors:',
          JSON.stringify(lite.json.errors, null, 2),
        );
        process.exit(1);
      }
      data = lite.json.data;
      fullPublicationDetails = false;
    } else {
      console.error(
        '[Admin] GraphQL errors:',
        JSON.stringify(pr.json.errors, null, 2),
      );
      process.exit(1);
    }
  } else {
    data = pr.json.data;
  }

  const totalInCatalog = data?.productsCount?.count ?? null;

  console.log('=== Sales channels / publications (Admin) ===\n');
  if (publicationsSkipped) {
    console.log(
      '(skipped — add read_publications scope in Dev Dashboard → app → Configuration → Admin API)',
    );
  } else if (pubs.length === 0) {
    console.log('(none returned)');
  } else {
    for (const p of pubs) {
      console.log(' -', pubTitle(p), '|', p.id);
    }
  }

  console.log('\n=== Products vs channel publication (first 50 products) ===\n');
  if (!fullPublicationDetails) {
    console.log(
      '(Per-channel publish flags require read_publications — showing status + handle only.)\n',
    );
  }
  if (totalInCatalog != null) {
    console.log('Total products in catalog (Admin):', totalInCatalog);
  }

  const products = data?.products?.nodes || [];
  if (products.length === 0) {
    console.log('No product nodes returned (empty store or no read_products).');
  }

  let activeCount = 0;
  let publishedToAnyChannel = 0;
  const issues = [];

  for (const p of products) {
    if (p.status === 'ACTIVE') activeCount++;
    const line = `[${p.status}] ${p.handle} — ${(p.title || '').slice(0, 55)}`;

    if (!fullPublicationDetails) {
      console.log(line);
      continue;
    }

    const rps = p.resourcePublications?.nodes || [];
    const published = rps.filter((r) => r.isPublished);
    if (published.length > 0) publishedToAnyChannel++;

    if (rps.length === 0) {
      console.log(line);
      console.log('    (no resourcePublications — often normal for very new imports)');
      if (p.status === 'ACTIVE') {
        issues.push(
          `${p.handle}: ACTIVE but no publication rows; confirm Sales channel checkboxes in Admin → Product.`,
        );
      }
    } else {
      console.log(line);
      for (const r of rps) {
        const t = pubTitle(r.publication);
        console.log(`    • ${t}: ${r.isPublished ? 'PUBLISHED' : 'not published'}`);
      }
      const nonePublished = !published.length;
      if (p.status === 'ACTIVE' && nonePublished) {
        issues.push(
          `${p.handle}: ACTIVE but not published to any listed channel — enable the Headless / storefront channel in the product’s Sales channels section.`,
        );
      }
    }
  }

  console.log('\n=== Summary (sample of 50) ===');
  console.log('  ACTIVE in sample:', activeCount);
  if (fullPublicationDetails) {
    console.log('  Published to ≥1 channel (in sample):', publishedToAnyChannel);
  }

  if (!fullPublicationDetails) {
    console.log(
      '\n→ For per-channel verification: Dev Dashboard → your app → Configuration → Admin API scopes → add read_publications, then run this script again.',
    );
  }

  if (issues.length) {
    console.log('\n⚠ Things to fix (sample only):');
    for (const i of issues.slice(0, 15)) {
      console.log('  -', i);
    }
    if (issues.length > 15) {
      console.log(`  … and ${issues.length - 15} more`);
    }
  } else if (products.length && fullPublicationDetails) {
    console.log('\n✓ No obvious publication gaps in this sample (still confirm in Admin).');
  } else if (products.length && !fullPublicationDetails) {
    console.log(
      '\n✓ Sample products are ACTIVE in Admin; add read_publications for per-channel publish flags.',
    );
  }

  console.log('\n=== Storefront API (your storefront token) ===');
  const sf = await storefrontProductCount();
  if (sf.ok) {
    console.log(
      `Products returned by Storefront API (first 50): ${sf.count}`,
    );
    if (sf.sample.length) {
      console.log('Sample handles:');
      for (const s of sf.sample.slice(0, 10)) {
        console.log('  -', s.handle);
      }
    }
    if (totalInCatalog > 0 && sf.count === 0) {
      console.log(
        '\n⚠ Admin shows products but Storefront returned none — publish products to the channel tied to this Storefront token (Headless / custom storefront), or regenerate the token for the correct channel.',
      );
    }
  }

  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
