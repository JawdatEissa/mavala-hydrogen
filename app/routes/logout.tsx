import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { chatAnonUsesCookie } from "~/lib/chat-anon-cookie.server";
import {
  CA_SESSION_ID_TOKEN,
  customerAccountOAuthPendingCookie,
  customerAccountSessionStorage,
} from "~/lib/customer-account-session.server";
import { customerAccessTokenCookie } from "~/lib/customer-session-cookie.server";
import {
  discoverOpenIdConfig,
  getConfiguredShopDomain,
  getPublicAppOrigin,
} from "~/lib/shopify-customer-account.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const headers = new Headers();

  headers.append(
    "Set-Cookie",
    await customerAccessTokenCookie.serialize("", { maxAge: 0 }),
  );
  headers.append(
    "Set-Cookie",
    await chatAnonUsesCookie.serialize("", { maxAge: 0 }),
  );
  headers.append(
    "Set-Cookie",
    await customerAccountOAuthPendingCookie.serialize("", { maxAge: 0 }),
  );

  const caSession = await customerAccountSessionStorage.getSession(cookieHeader);
  const idToken = caSession.get(CA_SESSION_ID_TOKEN);
  headers.append(
    "Set-Cookie",
    await customerAccountSessionStorage.destroySession(caSession),
  );

  if (typeof idToken === "string" && idToken.length > 0) {
    try {
      const shopDomain = getConfiguredShopDomain();
      const appOrigin = getPublicAppOrigin();
      if (shopDomain && appOrigin) {
        const { end_session_endpoint } = await discoverOpenIdConfig(shopDomain);
        if (end_session_endpoint) {
          const postLogout = `${appOrigin.replace(/\/$/, "")}/`;
          const logoutUrl = new URL(end_session_endpoint);
          logoutUrl.searchParams.set("id_token_hint", idToken);
          logoutUrl.searchParams.set("post_logout_redirect_uri", postLogout);
          return redirect(logoutUrl.toString(), { headers });
        }
      }
    } catch {
      // Local cookie clear only
    }
  }

  return redirect("/", { headers });
}

export default function LogoutPage() {
  return null;
}
