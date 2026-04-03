/**
 * httpOnly signed cookies for Customer Account OAuth pending state + token session.
 * Refresh/access tokens never reach the client bundle.
 */

import {
  createCookie,
  createCookieSessionStorage,
} from "@remix-run/node";

const sessionSecret =
  process.env.SESSION_SECRET?.trim() || "mavala-dev-insecure-cookie-secret";

/** Max id_token size to store for federated logout (session cookie ~4KB limit). */
export const MAX_ID_TOKEN_IN_SESSION = 3500;

export type CustomerAccountOAuthPending = {
  state: string;
  nonce: string;
  next: string;
};

/** Short-lived CSRF + nonce holder between authorize redirect and callback. */
export const customerAccountOAuthPendingCookie = createCookie(
  "mavala_ca_oauth_pending",
  {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    secrets: [sessionSecret],
  },
);

export const customerAccountSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "mavala_ca_sess",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 60,
    secrets: [sessionSecret],
  },
});

export const CA_SESSION_ACCESS = "accessToken";
export const CA_SESSION_REFRESH = "refreshToken";
export const CA_SESSION_EXPIRES_AT = "expiresAtMs";
export const CA_SESSION_ID_TOKEN = "idToken";
