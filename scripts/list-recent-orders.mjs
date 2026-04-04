/**
 * Lists recent orders via Admin API (client credentials). Uses .env.local.
 * Run: node scripts/list-recent-orders.mjs
 */
import dotenv from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env.local") });

const domain =
  process.env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, "").trim() || "";
const clientId = process.env.SHOPIFY_CLIENT_ID?.trim() || "";
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim() || "";
const adminVersion =
  process.env.SHOPIFY_API_VERSION?.trim() ||
  process.env.PUBLIC_STOREFRONT_API_VERSION?.trim() ||
  "2025-01";

if (!domain || !clientId || !clientSecret) {
  console.error("Need PUBLIC_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET in .env.local");
  process.exit(2);
}

const shop = domain.replace(/\.myshopify\.com$/i, "");
const tokenRes = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }),
});
const tokenJson = await tokenRes.json();
if (!tokenJson.access_token) {
  console.error("Token exchange failed:", tokenRes.status, tokenJson);
  process.exit(1);
}

const query = `#graphql
  query RecentOrders {
    orders(first: 20, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          name
          email
          displayFulfillmentStatus
          customer {
            displayName
            firstName
            lastName
          }
        }
      }
    }
  }
`;

const gqlRes = await fetch(
  `https://${shop}.myshopify.com/admin/api/${adminVersion}/graphql.json`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": tokenJson.access_token,
    },
    body: JSON.stringify({ query }),
  },
);
const gqlJson = await gqlRes.json();
if (gqlJson.errors?.length) {
  console.error("GraphQL errors:", JSON.stringify(gqlJson.errors, null, 2));
  process.exit(1);
}

const edges = gqlJson.data?.orders?.edges || [];
console.log("Recent orders:", edges.length);
for (const e of edges) {
  const n = e.node;
  const c = n.customer;
  const who = c
    ? c.displayName ||
      [c.firstName, c.lastName].filter(Boolean).join(" ") ||
      "(no name)"
    : "(guest)";
  console.log(
    "-",
    n.name,
    "|",
    who,
    "|",
    n.email || "(no email)",
    "|",
    n.displayFulfillmentStatus,
  );
}

const needle = process.argv[2];
if (needle) {
  const re = new RegExp(needle, "i");
  const hits = edges.filter((e) => {
    const n = e.node;
    const c = n.customer;
    return (
      re.test(c?.firstName || "") ||
      re.test(c?.lastName || "") ||
      re.test(c?.displayName || "") ||
      re.test(n.email || "")
    );
  });
  console.log(`\nMatches for "${needle}":`, hits.length);
}
