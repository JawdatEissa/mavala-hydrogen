import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import {
  CA_SESSION_ACCESS,
  CA_SESSION_EXPIRES_AT,
  CA_SESSION_ID_TOKEN,
  CA_SESSION_REFRESH,
  MAX_ID_TOKEN_IN_SESSION,
  customerAccountOAuthPendingCookie,
  customerAccountSessionStorage,
} from "~/lib/customer-account-session.server";
import {
  decodeJwtPayload,
  exchangeAuthorizationCode,
  getCustomerAccountRedirectUri,
} from "~/lib/shopify-customer-account.server";

/**
 * OAuth redirect_uri target — register this exact URL in Shopify Admin
 * (Settings → Customer accounts → API credentials).
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const cookieHeader = request.headers.get("Cookie") || "";
  const clearPending = await customerAccountOAuthPendingCookie.serialize(
    "",
    { maxAge: 0 },
  );

  const fail = (codeKey: string) =>
    redirect(`/login?error=${encodeURIComponent(codeKey)}`, {
      headers: { "Set-Cookie": clearPending },
    });

  if (oauthError) {
    const msg = errorDescription || oauthError;
    return redirect(
      `/login?error=${encodeURIComponent(String(msg).slice(0, 200))}`,
      { headers: { "Set-Cookie": clearPending } },
    );
  }

  const pendingRaw = await customerAccountOAuthPendingCookie.parse(cookieHeader);
  if (
    !pendingRaw ||
    typeof pendingRaw !== "object" ||
    typeof (pendingRaw as { state?: unknown }).state !== "string" ||
    typeof (pendingRaw as { nonce?: unknown }).nonce !== "string"
  ) {
    return fail("oauth_state_missing");
  }

  const pending = pendingRaw as { state: string; nonce: string; next: string };
  if (!state || pending.state !== state) {
    return fail("oauth_state_mismatch");
  }

  if (!code) {
    return fail("oauth_missing_code");
  }

  const redirectUri = getCustomerAccountRedirectUri();
  if (!redirectUri) {
    throw new Response("Customer Account OAuth not configured", {
      status: 500,
    });
  }

  let tokens: Awaited<ReturnType<typeof exchangeAuthorizationCode>>;
  try {
    tokens = await exchangeAuthorizationCode({ code, redirectUri });
  } catch {
    return fail("oauth_token_exchange");
  }

  if (tokens.id_token) {
    const payload = decodeJwtPayload(tokens.id_token);
    const nonce = payload?.nonce;
    if (String(nonce ?? "") !== pending.nonce) {
      return fail("oauth_nonce_mismatch");
    }
  }

  const session = await customerAccountSessionStorage.getSession();
  session.set(CA_SESSION_ACCESS, tokens.access_token);
  session.set(CA_SESSION_REFRESH, tokens.refresh_token);
  session.set(
    CA_SESSION_EXPIRES_AT,
    Date.now() + tokens.expires_in * 1000 - 60_000,
  );
  if (tokens.id_token && tokens.id_token.length <= MAX_ID_TOKEN_IN_SESSION) {
    session.set(CA_SESSION_ID_TOKEN, tokens.id_token);
  }

  const setSession = await customerAccountSessionStorage.commitSession(session);
  const headers = new Headers();
  headers.append("Set-Cookie", clearPending);
  headers.append("Set-Cookie", setSession);

  const next =
    typeof pending.next === "string" &&
    pending.next.startsWith("/") &&
    !pending.next.startsWith("//")
      ? pending.next
      : "/";

  return redirect(next, { headers });
}

export default function AuthCustomerCallback() {
  return null;
}
