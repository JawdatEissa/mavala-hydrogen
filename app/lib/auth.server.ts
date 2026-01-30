/**
 * Mavala AI Chatbot - Authentication Utilities
 *
 * Server-side authentication helpers for Shopify customer sessions.
 * This file provides the infrastructure for checking customer authentication
 * status when gating chatbot access.
 *
 * TODO: Implement actual Shopify Customer Account API integration when the store is connected.
 */

import { json } from "@remix-run/node";

// =========================================
// Types
// =========================================

export interface CustomerSession {
  customerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

// =========================================
// Session Check
// =========================================

/**
 * Check if a customer is authenticated from the request.
 *
 * TODO: Replace this with actual Shopify Customer Account API session check:
 * - Use Shopify Hydrogen's customer session utilities
 * - Check for customer access token in cookies
 * - Validate the token with Shopify Storefront API
 *
 * For now, this returns a mock "logged in" state for development.
 */
export async function getCustomerSession(
  request: Request
): Promise<CustomerSession | null> {
  // Check for auth header or cookie (placeholder)
  const authHeader = request.headers.get("Authorization");
  const cookies = request.headers.get("Cookie") || "";

  // TODO: Implement actual session check
  // Example with Shopify Hydrogen:
  // const { session } = await context.session.get(request);
  // if (!session?.customerAccessToken) return null;
  // const customer = await getCustomer(session.customerAccessToken);
  // return customer;

  // For development: check for a development bypass cookie
  if (cookies.includes("mavala_dev_auth=true")) {
    return {
      customerId: "dev-user",
      email: "dev@mavala.com",
      firstName: "Development",
      lastName: "User",
      isLoggedIn: true,
    };
  }

  // For development: Default to "logged in" to allow chatbot testing
  // In production, this should return null when not authenticated
  if (process.env.NODE_ENV !== "production") {
    return {
      customerId: "dev-user",
      email: "dev@mavala.com",
      firstName: "Development",
      lastName: "User",
      isLoggedIn: true,
    };
  }

  // Production: No authentication by default
  return null;
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireCustomerAuth(
  request: Request
): Promise<CustomerSession | Response> {
  const session = await getCustomerSession(request);

  if (!session) {
    return json(
      {
        error: "Authentication required. Please sign in to use the chatbot.",
        code: "AUTH_REQUIRED",
      },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Check if the response is an error response (for type narrowing)
 */
export function isAuthError(
  result: CustomerSession | Response
): result is Response {
  return result instanceof Response;
}

// =========================================
// Rate Limiting by Customer
// =========================================

/**
 * Get rate limit identifier from customer session
 * Uses customer ID if logged in, falls back to IP
 */
export function getRateLimitIdentifier(
  request: Request,
  session: CustomerSession | null
): string {
  if (session?.customerId) {
    return `customer:${session.customerId}`;
  }

  // Fallback to IP
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
