import { createCookie } from "@remix-run/node";

const COOKIE_NAME = "mavala_chat_anon_uses";

const chatAnonSecret =
  process.env.SESSION_SECRET?.trim() || "mavala-dev-insecure-cookie-secret";

/** Signed cookie: successful anonymous assistant replies count. */
export const chatAnonUsesCookie = createCookie(COOKIE_NAME, {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365,
  secrets: [chatAnonSecret],
});

export type ChatAnonPayload = { count: number };

export async function parseChatAnonUses(
  request: Request,
): Promise<ChatAnonPayload> {
  try {
    const raw = await chatAnonUsesCookie.parse(
      request.headers.get("Cookie"),
    );
    if (
      raw &&
      typeof raw === "object" &&
      "count" in raw &&
      typeof (raw as ChatAnonPayload).count === "number"
    ) {
      return { count: Math.max(0, Math.floor((raw as ChatAnonPayload).count)) };
    }
  } catch {
    // invalid signature / corrupt
  }
  return { count: 0 };
}

export function serializeChatAnonUses(
  count: number,
): Promise<string> {
  return chatAnonUsesCookie.serialize({ count });
}
