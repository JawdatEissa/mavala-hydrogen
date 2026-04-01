/**
 * Server-only Shopify Admin GraphQL via Dev Dashboard client credentials.
 * Token is cached and refreshed ~60s before expiry.
 */

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let cache: TokenCache | null = null;

function getShopSubdomain(): string | null {
  const raw =
    process.env.PUBLIC_STORE_DOMAIN?.replace(/^https?:\/\//, "").trim() ||
    process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").trim() ||
    "";
  if (!raw) return null;
  return raw.replace(/\.myshopify\.com$/i, "");
}

function getAdminVersion(): string {
  return (
    process.env.SHOPIFY_API_VERSION?.trim() ||
    process.env.PUBLIC_STOREFRONT_API_VERSION?.trim() ||
    "2026-01"
  );
}

/**
 * Exchange client id/secret for a short-lived Admin API access token.
 */
export async function getAdminToken(): Promise<string | null> {
  const shop = getShopSubdomain();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim() || "";
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim() || "";

  if (!shop || !clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  const refreshBufferMs = 60_000;
  if (
    cache &&
    cache.expiresAtMs - refreshBufferMs > now &&
    cache.accessToken
  ) {
    return cache.accessToken;
  }

  const tokenUrl = `https://${shop}.myshopify.com/admin/oauth/access_token`;
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const body = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!res.ok || !body.access_token) {
    console.error(
      "[shopify-admin] token exchange failed",
      res.status,
      body && typeof body === "object" ? Object.keys(body) : "",
    );
    cache = null;
    return null;
  }

  const expiresInSec =
    typeof body.expires_in === "number" && body.expires_in > 0
      ? body.expires_in
      : 86400;

  cache = {
    accessToken: body.access_token,
    expiresAtMs: now + expiresInSec * 1000,
  };

  return cache.accessToken;
}

type AdminGraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

/**
 * Run an Admin GraphQL query/mutation (server-only).
 */
export async function adminGraphQL<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data: TData | undefined; errors: string[] }> {
  const shop = getShopSubdomain();
  if (!shop) {
    return { data: undefined, errors: ["Missing store domain"] };
  }

  const token = await getAdminToken();
  if (!token) {
    return { data: undefined, errors: ["Admin token unavailable"] };
  }

  const version = getAdminVersion();
  const url = `https://${shop}.myshopify.com/admin/api/${version}/graphql.json`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    console.error("[adminGraphQL] network error:", msg);
    return { data: undefined, errors: [msg] };
  }

  let json: AdminGraphQLResponse<TData>;
  try {
    json = (await res.json()) as AdminGraphQLResponse<TData>;
  } catch {
    return { data: undefined, errors: ["Invalid JSON response"] };
  }

  if (!res.ok) {
    return { data: undefined, errors: [`HTTP ${res.status}`] };
  }

  const gqlErrors = (json.errors || []).map((e) => e.message);
  if (gqlErrors.length) {
    console.error("[adminGraphQL] GraphQL errors:", gqlErrors.join("; "));
  }

  return { data: json.data, errors: gqlErrors };
}
