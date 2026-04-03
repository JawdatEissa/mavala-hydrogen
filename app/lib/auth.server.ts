/**
 * Server-side Shopify customer session: Customer Account API (OAuth) first,
 * then optional legacy Storefront access token cookie for migration.
 */

import { json } from "@remix-run/node";
import { customerAccessTokenCookie } from "./customer-session-cookie.server";
import {
  CA_SESSION_ACCESS,
  CA_SESSION_EXPIRES_AT,
  CA_SESSION_ID_TOKEN,
  CA_SESSION_REFRESH,
  MAX_ID_TOKEN_IN_SESSION,
  customerAccountSessionStorage,
} from "./customer-account-session.server";
import {
  fetchCustomerAccountProfile,
  isCustomerAccountOAuthConfigured,
  refreshCustomerAccountToken,
} from "./shopify-customer-account.server";
import { getStorefrontCustomerByToken } from "./shopify-customer-storefront.server";

export interface CustomerSession {
  customerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

export type CustomerSessionResolution = {
  session: CustomerSession | null;
  /** Append to responses so refreshed tokens persist (httpOnly). */
  setCookieHeaders: string[];
};

async function sessionFromCustomerAccount(
  request: Request,
): Promise<CustomerSessionResolution> {
  const setCookieHeaders: string[] = [];
  const cookieHeader = request.headers.get("Cookie") || "";
  const storageSession =
    await customerAccountSessionStorage.getSession(cookieHeader);

  let accessToken = storageSession.get(CA_SESSION_ACCESS) as
    | string
    | undefined;
  let refreshToken = storageSession.get(CA_SESSION_REFRESH) as
    | string
    | undefined;
  let expiresAtMs = storageSession.get(CA_SESSION_EXPIRES_AT) as
    | number
    | undefined;

  if (!accessToken || !refreshToken || expiresAtMs == null) {
    return { session: null, setCookieHeaders };
  }

  const applyTokenResponse = async (tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    id_token?: string;
  }) => {
    storageSession.set(CA_SESSION_ACCESS, tokens.access_token);
    storageSession.set(CA_SESSION_REFRESH, tokens.refresh_token);
    storageSession.set(
      CA_SESSION_EXPIRES_AT,
      Date.now() + tokens.expires_in * 1000 - 60_000,
    );
    if (
      tokens.id_token &&
      tokens.id_token.length <= MAX_ID_TOKEN_IN_SESSION
    ) {
      storageSession.set(CA_SESSION_ID_TOKEN, tokens.id_token);
    }
    setCookieHeaders.push(
      await customerAccountSessionStorage.commitSession(storageSession),
    );
    accessToken = tokens.access_token;
    expiresAtMs = storageSession.get(CA_SESSION_EXPIRES_AT) as number;
  };

  if (Date.now() >= expiresAtMs) {
    try {
      await applyTokenResponse(
        await refreshCustomerAccountToken(refreshToken),
      );
      refreshToken = storageSession.get(CA_SESSION_REFRESH) as string;
    } catch {
      setCookieHeaders.push(
        await customerAccountSessionStorage.destroySession(storageSession),
      );
      return { session: null, setCookieHeaders };
    }
  }

  let profile = await fetchCustomerAccountProfile(accessToken);
  if (!profile) {
    const rt = storageSession.get(CA_SESSION_REFRESH) as string | undefined;
    if (!rt) {
      setCookieHeaders.push(
        await customerAccountSessionStorage.destroySession(storageSession),
      );
      return { session: null, setCookieHeaders };
    }
    try {
      await applyTokenResponse(await refreshCustomerAccountToken(rt));
      accessToken = storageSession.get(CA_SESSION_ACCESS) as string;
      profile = await fetchCustomerAccountProfile(accessToken);
    } catch {
      setCookieHeaders.push(
        await customerAccountSessionStorage.destroySession(storageSession),
      );
      return { session: null, setCookieHeaders };
    }
  }

  if (!profile) {
    setCookieHeaders.push(
      await customerAccountSessionStorage.destroySession(storageSession),
    );
    return { session: null, setCookieHeaders };
  }

  return {
    session: {
      customerId: profile.id,
      email: profile.email,
      firstName: profile.firstName ?? undefined,
      lastName: profile.lastName ?? undefined,
      isLoggedIn: true,
    },
    setCookieHeaders,
  };
}

async function sessionFromLegacyStorefrontToken(
  request: Request,
): Promise<CustomerSession | null> {
  const cookieHeader = request.headers.get("Cookie") || "";
  let token: string | null = null;
  try {
    const parsed = await customerAccessTokenCookie.parse(cookieHeader);
    if (typeof parsed === "string" && parsed.trim()) {
      token = parsed.trim();
    }
  } catch {
    token = null;
  }

  if (!token) {
    return null;
  }

  const customer = await getStorefrontCustomerByToken(token);
  if (!customer?.id) {
    return null;
  }

  return {
    customerId: customer.id,
    email: customer.email,
    firstName: customer.firstName ?? undefined,
    lastName: customer.lastName ?? undefined,
    isLoggedIn: true,
  };
}

/**
 * Resolves the logged-in customer, refreshes Customer Account tokens when needed,
 * and returns Set-Cookie header values to persist rotation.
 */
export async function resolveCustomerSession(
  request: Request,
): Promise<CustomerSessionResolution> {
  if (process.env.MAVALA_AUTH_DEV_BYPASS === "true") {
    return {
      session: {
        customerId: "dev-user",
        email: "dev@mavala.com",
        firstName: "Development",
        lastName: "User",
        isLoggedIn: true,
      },
      setCookieHeaders: [],
    };
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  if (cookieHeader.includes("mavala_dev_auth=true")) {
    return {
      session: {
        customerId: "dev-user",
        email: "dev@mavala.com",
        firstName: "Development",
        lastName: "User",
        isLoggedIn: true,
      },
      setCookieHeaders: [],
    };
  }

  if (isCustomerAccountOAuthConfigured()) {
    const ca = await sessionFromCustomerAccount(request);
    if (ca.session) {
      return ca;
    }
  }

  const legacy = await sessionFromLegacyStorefrontToken(request);
  if (legacy) {
    return { session: legacy, setCookieHeaders: [] };
  }

  return { session: null, setCookieHeaders: [] };
}

/** Prefer resolveCustomerSession when the response can carry Set-Cookie (token refresh). */
export async function getCustomerSession(
  request: Request,
): Promise<CustomerSession | null> {
  const { session } = await resolveCustomerSession(request);
  return session;
}

export async function requireCustomerAuth(
  request: Request,
): Promise<CustomerSession | Response> {
  const { session } = await resolveCustomerSession(request);

  if (!session) {
    return json(
      {
        error: "Authentication required. Please sign in to use the chatbot.",
        code: "AUTH_REQUIRED",
      },
      { status: 401 },
    );
  }

  return session;
}

export function isAuthError(
  result: CustomerSession | Response,
): result is Response {
  return result instanceof Response;
}

export function getRateLimitIdentifier(
  request: Request,
  session: CustomerSession | null,
): string {
  if (session?.customerId) {
    return `customer:${session.customerId}`;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return `ip:${forwarded.split(",")[0]?.trim()}`;
  }
  if (realIp) {
    return `ip:${realIp}`;
  }

  return "ip:unknown";
}
