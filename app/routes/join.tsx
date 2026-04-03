import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { SignInQuiz } from "~/components/SignInQuiz";
import { isAuthRateLimited } from "~/lib/auth-rate-limit.server";
import {
  customerAccessTokenCookie,
  maxAgeFromExpiresAt,
} from "~/lib/customer-session-cookie.server";
import { setCustomerQuizMetafields } from "~/lib/shopify-customer-metafields.server";
import {
  storefrontCustomerAccessTokenCreate,
  storefrontCustomerCreate,
} from "~/lib/shopify-customer-storefront.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Join Mavala | Create Your Account" },
    {
      name: "description",
      content:
        "Join the Mavala community and get personalized beauty recommendations. Sign up for exclusive offers and discover your perfect products.",
    },
  ];
};

function mapSignupError(messages: string): string {
  const lower = messages.toLowerCase();
  if (
    lower.includes("taken") ||
    lower.includes("exists") ||
    lower.includes("already been taken") ||
    lower.includes("unique")
  ) {
    return "An account with this email already exists. Sign in instead.";
  }
  return messages;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { ok: false as const, error: "Method not allowed" },
      { status: 405 },
    );
  }

  if (isAuthRateLimited(request)) {
    return json(
      { ok: false, error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const firstName = String(form.get("firstName") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const gender = String(form.get("gender") || "").trim();
  const ageRange = String(form.get("ageRange") || "").trim();
  const interests = String(form.get("interests") || "").trim();

  if (!firstName || !email || !password) {
    return json(
      { ok: false, error: "Please complete all required fields." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { ok: false, error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const created = await storefrontCustomerCreate({
    email,
    password,
    firstName,
    acceptsMarketing: false,
  });

  if (!created.ok) {
    const msg = created.errors.map((e) => e.message).join(" ");
    return json(
      { ok: false, error: mapSignupError(msg) },
      { status: 400 },
    );
  }

  const tokenResult = await storefrontCustomerAccessTokenCreate({
    email,
    password,
  });

  if (!tokenResult.ok) {
    const msg = tokenResult.errors.map((e) => e.message).join(" ");
    return json(
      {
        ok: false,
        error:
          msg ||
          "Account was created but sign-in failed. Try logging in with your password.",
      },
      { status: 400 },
    );
  }

  if (gender && ageRange && interests) {
    await setCustomerQuizMetafields(created.customerId, {
      gender,
      ageRange,
      interests,
    });
  }

  const maxAge = maxAgeFromExpiresAt(tokenResult.expiresAt);
  const setCookie = await customerAccessTokenCookie.serialize(
    tokenResult.accessToken,
    { maxAge },
  );

  return json(
    { ok: true as const },
    {
      headers: { "Set-Cookie": setCookie },
    },
  );
}

export default function JoinPage() {
  return <SignInQuiz />;
}
