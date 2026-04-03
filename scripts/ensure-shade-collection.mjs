/**
 * Create (or verify) a Shopify **smart collection** that contains all Mavala shade
 * products synced by `sync-shades-to-shopify.mjs`.
 *
 * Matching rules (AND — both must be true):
 *   - Product tag equals `shade`  (every shade product gets this tag from the sync script)
 *   - Product type equals `Nail Polish`  (shade products only; main catalog uses other types)
 *
 * Optionally publishes the collection to all publications (same pattern as product sync).
 *
 * Usage:
 *   node scripts/ensure-shade-collection.mjs
 *   node scripts/ensure-shade-collection.mjs --skip-publish
 */
import dotenv from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const args = process.argv.slice(2);
const SKIP_PUBLISH = args.includes('--skip-publish');

const COLLECTION_HANDLE = 'mavala-nail-shades';
const COLLECTION_TITLE = 'Mavala nail shades';

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

const COLLECTION_BY_HANDLE = `#graphql
  query ShadeCollection($handle: String!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      productsCount {
        count
      }
      ruleSet {
        appliedDisjunctively
        rules {
          column
          relation
          condition
        }
      }
    }
  }
`;

const COLLECTION_CREATE = `#graphql
  mutation CreateShadeCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
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
        }
      }
    }
  }
`;

const PUBLISH_MUTATION = `#graphql
  mutation PublishCollection($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Collection {
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

const RULE_SET = {
  appliedDisjunctively: false,
  rules: [
    { column: 'TAG', relation: 'EQUALS', condition: 'shade' },
    { column: 'TYPE', relation: 'EQUALS', condition: 'Nail Polish' },
  ],
};

async function main() {
  console.log('=== Ensure Mavala shade collection ===');
  console.log(`Store: ${shop}.myshopify.com`);
  console.log(`Handle: ${COLLECTION_HANDLE}`);
  console.log('Rules (AND): tag = "shade" AND product type = "Nail Polish"\n');

  await getToken();

  const existing = await adminGQL(COLLECTION_BY_HANDLE, {
    handle: COLLECTION_HANDLE,
  });

  if (existing.errors?.length) {
    console.error('Query errors:', existing.errors.map((e) => e.message).join('; '));
    process.exit(1);
  }

  let collectionId = existing.data?.collectionByHandle?.id;

  if (collectionId) {
    const c = existing.data.collectionByHandle;
    const count = c.productsCount?.count ?? '?';
    console.log(`Collection already exists: ${c.title} (${collectionId})`);
    console.log(`Products in collection (approx): ${count}`);
    console.log('Rules:', JSON.stringify(c.ruleSet?.rules ?? [], null, 2));
    const rules = c.ruleSet?.rules ?? [];
    if (rules.length === 0) {
      console.log(
        '\nNOTE: This collection has no smart rules (manual collection?). Delete it in Admin or create a new handle, then re-run this script.',
      );
    }
  } else {
    const createRes = await adminGQL(COLLECTION_CREATE, {
      input: {
        title: COLLECTION_TITLE,
        handle: COLLECTION_HANDLE,
        descriptionHtml:
          '<p>All Mavala mini-color nail polish shades (5ml / 10ml), synced from the catalog.</p>',
        ruleSet: RULE_SET,
      },
    });

    const payload = createRes.data?.collectionCreate;
    const errs = payload?.userErrors || [];
    if (errs.length > 0) {
      console.error('collectionCreate userErrors:');
      for (const e of errs) console.error(`  - ${e.field?.join('.')}: ${e.message}`);
      process.exit(1);
    }

    collectionId = payload?.collection?.id;
    console.log(
      `Created smart collection: ${payload?.collection?.title} → ${collectionId}`,
    );
  }

  if (SKIP_PUBLISH) {
    console.log('\n--skip-publish: not publishing to sales channels.');
    console.log('In Admin: Collections → open the collection → Sales channels → enable Headless / Online Store if needed.');
    return;
  }

  try {
    const pubResult = await adminGQL(LIST_PUBLICATIONS_QUERY);
    if (pubResult.errors?.length) {
      const denied = pubResult.errors.some(
        (e) => e.extensions?.code === 'ACCESS_DENIED',
      );
      if (denied) {
        console.log(
          '\nWARNING: read_publications not granted — publish the collection manually in Admin (Sales channels).',
        );
        return;
      }
      console.log(
        'Publications query errors:',
        pubResult.errors.map((e) => e.message).join('; '),
      );
      return;
    }

    const pubIds =
      pubResult.data?.publications?.edges?.map((e) => e.node.id) || [];
    if (pubIds.length === 0) {
      console.log('\nNo publications found — enable sales channels on the collection in Admin.');
      return;
    }

    const pubInput = pubIds.map((publicationId) => ({ publicationId }));
    const pubRes = await adminGQL(PUBLISH_MUTATION, {
      id: collectionId,
      input: pubInput,
    });
    const pubErrs = pubRes.data?.publishablePublish?.userErrors || [];
    if (pubErrs.length > 0) {
      console.log('\nPublish userErrors:');
      for (const e of pubErrs) console.log(`  - ${e.message}`);
    } else {
      console.log(`\nPublished collection to ${pubIds.length} publication(s).`);
    }
  } catch (e) {
    console.log('\nPublish step failed:', e.message);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
