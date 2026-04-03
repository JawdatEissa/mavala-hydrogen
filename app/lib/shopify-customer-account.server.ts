/**
 * Shopify Customer Account API — OAuth (confidential client) + GraphQL.
 * Discovery on storefront domain; tokens never sent to the client bundle.
 *
 * @see https://shopify.dev/docs/api/customer/latest
 */

const USER_AGENT = "MavalaHydrogen/1.0 (Customer Account API)";

let openIdCache: { domain: string; config: OpenIdConfiguration; at: number } | null =
  null;
let apiCache: { domain: string; config: CustomerAccountApiDiscovery; at: number } | null =
  null;

const DISCOVERY_TTL_MS = 5 * 60 * 1000;

export type OpenIdConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  issuer: string;
};

export type CustomerAccountApiDiscovery = {
  graphql_api: string;
};

export type CustomerAccountTokenResponse = {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in: number;
};

function normalizeShopDomain(raw: string): string {
  return raw.replace(/^https?:\/\//, "").trim();
}

export function getConfiguredShopDomain(): string | null {
  const d = process.env.PUBLIC_STORE_DOMAIN?.trim();
  return d ? normalizeShopDomain(d) : null;
}

export function getCustomerAccountClientId(): string | null {
  const id = process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID?.trim();
  return id || null;
}

export function getCustomerAccountClientSecret(): string | null {
  const s =
    process.env.CUSTOMER_ACCOUNT_API_CLIENT_SECRET?.trim() ||
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim();
  return s || null;
}

/** Canonical app origin (https://example.com) — redirect_uri + token Origin header */
export function getPublicAppOrigin(): string | null {
  const raw = process.env.PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    return u.origin;
  } catch {
    return null;
  }
}

export function getCustomerAccountRedirectUri(): string | null {
  const origin = getPublicAppOrigin();
  if (!origin) return null;
  return `${origin}/auth/customer/callback`;
}

function getTokenRequestHeaders(): Headers {
  const clientId = getCustomerAccountClientId();
  const clientSecret = getCustomerAccountClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Customer Account API client id/secret not configured");
  }
  const basic = Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString(
    "base64",
  );
  const origin = getPublicAppOrigin();
  const headers = new Headers({
    "content-type": "application/x-www-form-urlencoded",
    authorization: `Basic ${basic}`,
    "user-agent": USER_AGENT,
  });
  if (origin) {
    headers.set("origin", origin);
  }
  return headers;
}

export async function discoverOpenIdConfig(
  shopDomain: string,
): Promise<OpenIdConfiguration> {
  const domain = normalizeShopDomain(shopDomain);
  const now = Date.now();
  if (
    openIdCache &&
    openIdCache.domain === domain &&
    now - openIdCache.at < DISCOVERY_TTL_MS
  ) {
    return openIdCache.config;
  }

  const url = `https://${domain}/.well-known/openid-configuration`;
  const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(
      `OpenID discovery failed ${res.status}: ${await res.text()}`,
    );
  }
  const config = (await res.json()) as OpenIdConfiguration;
  if (!config.authorization_endpoint || !config.token_endpoint) {
    throw new Error("OpenID discovery missing authorization or token endpoint");
  }
  openIdCache = { domain, config, at: now };
  return config;
}

export async function discoverCustomerAccountApi(
  shopDomain: string,
): Promise<CustomerAccountApiDiscovery> {
  const domain = normalizeShopDomain(shopDomain);
  const now = Date.now();
  if (
    apiCache &&
    apiCache.domain === domain &&
    now - apiCache.at < DISCOVERY_TTL_MS
  ) {
    return apiCache.config;
  }

  const url = `https://${domain}/.well-known/customer-account-api`;
  const res = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(
      `Customer Account API discovery failed ${res.status}: ${await res.text()}`,
    );
  }
  const config = (await res.json()) as CustomerAccountApiDiscovery;
  if (!config.graphql_api) {
    throw new Error("Customer Account API discovery missing graphql_api");
  }
  apiCache = { domain, config, at: now };
  return config;
}

const OAUTH_SCOPE = "openid email customer-account-api:full";

export function buildCustomerAccountAuthorizeUrl(params: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  loginHint?: string;
  locale?: string;
}): string {
  const u = new URL(params.authorizationEndpoint);
  u.searchParams.set("scope", OAUTH_SCOPE);
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("state", params.state);
  u.searchParams.set("nonce", params.nonce);
  if (params.loginHint) {
    u.searchParams.set("login_hint", params.loginHint);
  }
  if (params.locale) {
    u.searchParams.set("locale", params.locale);
  }
  return u.toString();
}

export async function exchangeAuthorizationCode(params: {
  code: string;
  redirectUri: string;
}): Promise<CustomerAccountTokenResponse> {
  const shopDomain = getConfiguredShopDomain();
  const clientId = getCustomerAccountClientId();
  if (!shopDomain || !clientId) {
    throw new Error("Shop domain or Customer Account client id not configured");
  }

  const { token_endpoint } = await discoverOpenIdConfig(shopDomain);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: params.redirectUri,
    code: params.code,
  });

  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: getTokenRequestHeaders(),
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token exchange failed ${res.status}: ${text}`);
  }

  const json = JSON.parse(text) as CustomerAccountTokenResponse;
  if (!json.access_token || !json.refresh_token) {
    throw new Error("Token response missing access_token or refresh_token");
  }
  return json;
}

export async function refreshCustomerAccountToken(
  refreshToken: string,
): Promise<CustomerAccountTokenResponse> {
  const shopDomain = getConfiguredShopDomain();
  const clientId = getCustomerAccountClientId();
  if (!shopDomain || !clientId) {
    throw new Error("Shop domain or Customer Account client id not configured");
  }

  const { token_endpoint } = await discoverOpenIdConfig(shopDomain);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: getTokenRequestHeaders(),
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token refresh failed ${res.status}: ${text}`);
  }

  const json = JSON.parse(text) as CustomerAccountTokenResponse;
  if (!json.access_token || !json.refresh_token) {
    throw new Error("Refresh response missing access_token or refresh_token");
  }
  return json;
}

/** Customer Account GraphQL uses raw access token in Authorization (not Bearer). */
export async function customerAccountGraphQL<T>(params: {
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}): Promise<{ data?: T; errors?: { message: string }[] }> {
  const shopDomain = getConfiguredShopDomain();
  if (!shopDomain) {
    throw new Error("PUBLIC_STORE_DOMAIN not configured");
  }

  const { graphql_api } = await discoverCustomerAccountApi(shopDomain);
  const res = await fetch(graphql_api, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: params.accessToken,
      "user-agent": USER_AGENT,
    },
    body: JSON.stringify({
      query: params.query,
      variables: params.variables ?? {},
    }),
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  return json;
}

const CUSTOMER_ME = `#graphql
  query CustomerAccountMe {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

export type CustomerAccountProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export async function fetchCustomerAccountProfile(
  accessToken: string,
): Promise<CustomerAccountProfile | null> {
  const { data, errors } = await customerAccountGraphQL<{
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      emailAddress: { emailAddress: string } | null;
    } | null;
  }>({
    accessToken,
    query: CUSTOMER_ME,
  });

  if (errors?.length) {
    return null;
  }

  const c = data?.customer;
  const email = c?.emailAddress?.emailAddress?.trim();
  if (!c?.id || !email) {
    return null;
  }

  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email,
  };
}

export function isCustomerAccountOAuthConfigured(): boolean {
  return !!(
    getConfiguredShopDomain() &&
    getCustomerAccountClientId() &&
    getCustomerAccountClientSecret() &&
    getPublicAppOrigin() &&
    getCustomerAccountRedirectUri()
  );
}

export function decodeJwtPayload(
  jwt: string,
): Record<string, unknown> | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}
