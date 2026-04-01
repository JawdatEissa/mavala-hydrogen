/**
 * Server-only Shopify Storefront GraphQL client.
 * Uses PRIVATE_STOREFRONT_API_TOKEN with fallback to PUBLIC (same as scripts/test-shopify-connection.mjs).
 */

const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url(transform: { maxWidth: 2048 })
        altText
      }
      images(first: 20) {
        edges {
          node {
            url(transform: { maxWidth: 2048 })
            altText
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            handle
            title
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export type StorefrontMoney = {
  amount: string;
  currencyCode: string;
};

export type StorefrontProductNode = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: StorefrontMoney;
    maxVariantPrice: StorefrontMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: StorefrontMoney;
    maxVariantPrice: StorefrontMoney;
  };
  featuredImage: { url: string; altText: string | null } | null;
  images: {
    edges: Array<{ node: { url: string; altText: string | null } }>;
  };
  collections: {
    edges: Array<{ node: { handle: string; title: string } }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        availableForSale: boolean;
        price: StorefrontMoney;
        compareAtPrice: StorefrontMoney | null;
      };
    }>;
  };
};

type StorefrontGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

function getStorefrontConfig(): {
  domain: string;
  version: string;
  token: string;
} | null {
  const domain = (
    process.env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, "").trim() || ""
  ).trim();
  const version =
    process.env.PUBLIC_STOREFRONT_API_VERSION?.trim() || "2026-01";
  const token =
    process.env.PRIVATE_STOREFRONT_API_TOKEN?.trim() ||
    process.env.PUBLIC_STOREFRONT_API_TOKEN?.trim() ||
    "";

  if (!domain || !token) {
    return null;
  }

  return { domain, version, token };
}

/**
 * Execute a Storefront API GraphQL request (server-only).
 */
export async function storefrontGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data: TData | undefined; errors: string[] }> {
  const cfg = getStorefrontConfig();
  if (!cfg) {
    return { data: undefined, errors: ["Storefront API not configured"] };
  }

  const url = `https://${cfg.domain}/api/${cfg.version}/graphql.json`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": cfg.token,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    console.error("[storefrontGraphQL] network error:", msg);
    return { data: undefined, errors: [msg] };
  }

  let json: StorefrontGraphQLResponse<TData>;
  try {
    json = (await res.json()) as StorefrontGraphQLResponse<TData>;
  } catch {
    console.error("[storefrontGraphQL] invalid JSON response", res.status);
    return { data: undefined, errors: ["Invalid JSON response"] };
  }

  if (!res.ok) {
    console.error("[storefrontGraphQL] HTTP", res.status, json);
    return {
      data: undefined,
      errors: [`HTTP ${res.status}`],
    };
  }

  const gqlErrors = (json.errors || []).map((e) => e.message);
  if (gqlErrors.length) {
    console.error("[storefrontGraphQL] GraphQL errors:", gqlErrors.join("; "));
  }

  return {
    data: json.data,
    errors: gqlErrors,
  };
}

type ProductByHandleData = {
  product: StorefrontProductNode | null;
};

/**
 * Fetch a single product by handle from the Storefront API.
 * Returns null if missing, misconfigured, or on error.
 */
export async function getStorefrontProductByHandle(
  handle: string,
): Promise<StorefrontProductNode | null> {
  if (!handle?.trim()) {
    return null;
  }

  const { data, errors } = await storefrontGraphQL<ProductByHandleData>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );

  if (errors.length && !data?.product) {
    return null;
  }

  return data?.product ?? null;
}
