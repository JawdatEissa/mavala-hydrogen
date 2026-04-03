/**
 * End-to-end smoke test: Storefront cart → checkoutUrl (Shopify-hosted checkout).
 * Use this to verify shipping rates and Bogus / test payment after Admin setup.
 *
 * Does not print tokens. Prints checkout URL — open in a browser to complete a test order.
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

const VARIANT_QUERY = `#graphql
  query FirstPurchasableVariant {
    products(first: 20) {
      edges {
        node {
          handle
          title
          variants(first: 10) {
            edges {
              node {
                id
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const LINES_ADD = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function sf(query, variables) {
  const url = `https://${domain}/api/${sfVersion}/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': sfToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function main() {
  if (!domain || !sfToken) {
    console.error('Missing PUBLIC_STORE_DOMAIN or storefront token in .env.local');
    process.exit(1);
  }

  console.log('--- Shopify checkout smoke test ---\n');

  const vJson = await sf(VARIANT_QUERY);
  if (vJson.errors?.length) {
    console.error('GraphQL:', JSON.stringify(vJson.errors, null, 2));
    process.exit(1);
  }

  let variantId = null;
  let handle = null;
  let title = null;
  for (const e of vJson.data?.products?.edges || []) {
    const n = e.node;
    for (const ve of n.variants?.edges || []) {
      const vn = ve.node;
      if (vn.availableForSale && vn.id) {
        variantId = vn.id;
        handle = n.handle;
        title = n.title;
        break;
      }
    }
    if (variantId) break;
  }

  if (!variantId) {
    console.error(
      'No available-for-sale variant found in first 20 products. Add inventory / enable “Continue selling when out of stock” or pick another product.',
    );
    process.exit(1);
  }

  console.log('Using variant:', variantId);
  console.log('Product:', title, `(${handle})\n`);

  const cJson = await sf(CART_CREATE, { input: {} });
  if (cJson.errors?.length) {
    console.error('cartCreate errors:', JSON.stringify(cJson.errors, null, 2));
    process.exit(1);
  }
  const cUe = cJson.data?.cartCreate?.userErrors || [];
  if (cUe.length) {
    console.error('cartCreate userErrors:', cUe);
    process.exit(1);
  }
  const cartId = cJson.data?.cartCreate?.cart?.id;
  if (!cartId) {
    console.error('No cart id');
    process.exit(1);
  }

  const aJson = await sf(LINES_ADD, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity: 1 }],
  });
  if (aJson.errors?.length) {
    console.error('cartLinesAdd errors:', JSON.stringify(aJson.errors, null, 2));
    process.exit(1);
  }
  const aUe = aJson.data?.cartLinesAdd?.userErrors || [];
  if (aUe.length) {
    console.error('cartLinesAdd userErrors:', aUe);
    process.exit(1);
  }

  const checkoutUrl = aJson.data?.cartLinesAdd?.cart?.checkoutUrl?.trim();
  if (!checkoutUrl) {
    console.error('No checkoutUrl on cart (unexpected).');
    process.exit(1);
  }

  console.log('OK — cart has line(s). Open this URL in your browser:\n');
  console.log(checkoutUrl);
  console.log(
    '\nOn Shopify checkout: confirm shipping options appear, then pay with Bogus gateway (or your test provider).',
  );
  console.log(
    'Bogus test cards: https://shopify.dev/docs/apps/build/payments#bogus-gateway\n',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
