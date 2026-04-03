import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { chatAnonUsesCookie } from "~/lib/chat-anon-cookie.server";
import { customerAccessTokenCookie } from "~/lib/customer-session-cookie.server";

export async function loader(_args: LoaderFunctionArgs) {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    await customerAccessTokenCookie.serialize("", { maxAge: 0 }),
  );
  headers.append(
    "Set-Cookie",
    await chatAnonUsesCookie.serialize("", { maxAge: 0 }),
  );
  return redirect("/", { headers });
}

export default function LogoutPage() {
  return null;
}
