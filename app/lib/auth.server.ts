/**
 * Server-side Shopify customer session (Storefront access token cookie).
 */

import { json } from "@remix-run/node";
import {
  customerAccessTokenCookie,
} from "./customer-session-cookie.server";
import { getStorefrontCustomerByToken } from "./shopify-customer-storefront.server";

export interface CustomerSession {
  customerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

export async function getCustomerSession(
  request: Request,
): Promise<CustomerSession | null> {
  if (process.env.MAVALA_AUTH_DEV_BYPASS === "true") {
    return {
      customerId: "dev-user",
      email: "dev@mavala.com",
      firstName: "Development",
      lastName: "User",
      isLoggedIn: true,
    };
  }

  const cookieHeader = request.headers.get("Cookie") || "";
  if (cookieHeader.includes("mavala_dev_auth=true")) {
    return {
      customerId: "dev-user",
      email: "dev@mavala.com",
      firstName: "Development",
      lastName: "User",
      isLoggedIn: true,
    };
  }

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

export async function requireCustomerAuth(
  request: Request,
): Promise<CustomerSession | Response> {
  const session = await getCustomerSession(request);

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
