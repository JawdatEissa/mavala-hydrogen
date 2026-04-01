/**
 * Loads mavala-hydrogen/.env.local and tests Shopify APIs.
 * Does not print any tokens or secrets.
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

function mask(s) {
  if (!s || s.length < 8) return '(unset)';
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

async function storefrontTest() {
  if (!domain || !sfToken) {
    console.log('[Storefront API] SKIP — PUBLIC_STORE_DOMAIN or storefront token missing');
    return false;
  }

  const url = `https://${domain}/api/${sfVersion}/graphql.json`;
  const query = `#graphql
    query TestConnection {
      shop {
        name
        primaryDomain { host }
      }
      products(first: 5) {
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
  if (!res.ok) {
    console.log('[Storefront API] HTTP', res.status);
    console.log(JSON.stringify(json, null, 2));
    return false;
  }
  if (json.errors?.length) {
    console.log('[Storefront API] GraphQL errors:', JSON.stringify(json.errors, null, 2));
    return false;
  }

  const shop = json.data?.shop;
  const edges = json.data?.products?.edges || [];
  console.log('[Storefront API] OK');
  console.log('  Shop name:', shop?.name ?? '(null)');
  console.log('  Primary domain:', shop?.primaryDomain?.host ?? '(null)');
  console.log('  Sample products (' + edges.length + '):');
  for (const e of edges) {
    const n = e.node;
    console.log('   -', n.handle, '|', n.title?.slice(0, 60) + (n.title?.length > 60 ? '…' : ''));
  }
  return true;
}

async function adminTest() {
  if (!domain || !clientId || !clientSecret) {
    console.log(
      '[Admin API] SKIP — set SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET in .env.local to test',
    );
    return false;
  }

  const shop = domain.replace(/\.myshopify\.com$/i, '');
  const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;
  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    console.log('[Admin API] Token exchange failed:', tokenRes.status);
    console.log(JSON.stringify(tokenJson, null, 2));
    return false;
  }
  const adminToken = tokenJson.access_token;
  if (!adminToken) {
    console.log('[Admin API] No access_token in response');
    return false;
  }

  const gqlUrl = `https://${shop}.myshopify.com/admin/api/${adminVersion}/graphql.json`;
  const query = `#graphql
    query TestAdmin {
      shop { name myshopifyDomain }
      productsCount { count }
    }
  `;
  const res = await fetch(gqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.log('[Admin API] HTTP', res.status);
    console.log(JSON.stringify(json, null, 2));
    return false;
  }
  if (json.errors?.length) {
    console.log('[Admin API] GraphQL errors:', JSON.stringify(json.errors, null, 2));
    return false;
  }

  const s = json.data?.shop;
  const count = json.data?.productsCount?.count;
  console.log('[Admin API] OK (client credentials)');
  console.log('  Shop:', s?.name, '|', s?.myshopifyDomain);
  console.log('  productsCount:', count ?? '(unavailable)');
  return true;
}

console.log('--- Shopify connection test ---');
console.log('Store:', domain || '(missing)');
console.log('Storefront API version:', sfVersion);
console.log('Storefront token:', mask(sfToken));
console.log('Admin client id:', mask(clientId));
console.log('');

let ok = true;
try {
  const a = await storefrontTest();
  const b = await adminTest();
  ok = a || b;
} catch (e) {
  console.error('Error:', e.message);
  ok = false;
}

console.log('');
process.exit(ok ? 0 : 1);
