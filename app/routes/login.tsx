import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useState } from "react";
import { AuthFlowShell } from "~/components/AuthFlowShell";
import { isAuthRateLimited } from "~/lib/auth-rate-limit.server";
import {
  customerAccessTokenCookie,
  maxAgeFromExpiresAt,
} from "~/lib/customer-session-cookie.server";
import { storefrontCustomerAccessTokenCreate } from "~/lib/shopify-customer-storefront.server";

export const meta: MetaFunction = () => [
  { title: "Sign In | Mavala" },
  {
    name: "description",
    content: "Sign in to your Mavala account.",
  },
];

export async function loader(_args: LoaderFunctionArgs) {
  const domain = (process.env.PUBLIC_STORE_DOMAIN || "")
    .replace(/^https?:\/\//, "")
    .trim();
  const recoverUrl = domain
    ? `https://${domain}/account/recover`
    : "#";
  return json({ recoverUrl });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  if (isAuthRateLimited(request)) {
    return json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const next = String(form.get("redirectTo") || "/").trim() || "/";

  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  const tokenResult = await storefrontCustomerAccessTokenCreate({
    email,
    password,
  });

  if (!tokenResult.ok) {
    return json(
      {
        error: "Invalid email or password.",
      },
      { status: 401 },
    );
  }

  const maxAge = maxAgeFromExpiresAt(tokenResult.expiresAt);
  const setCookie = await customerAccessTokenCookie.serialize(
    tokenResult.accessToken,
    { maxAge },
  );

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return redirect(safeNext, {
    headers: { "Set-Cookie": setCookie },
  });
}

export default function LoginPage() {
  const { recoverUrl } = useLoaderData<typeof loader>();
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";

  const t =
    language === "en"
      ? {
          title: "Sign in",
          subtitle: "Welcome back — access your account and unlimited chat.",
          email: "Email",
          password: "Password",
          submit: "Sign in",
          create: "Create an account",
          createHint: "New to Mavala?",
          forgot: "Forgot password?",
        }
      : {
          title: "Se connecter",
          subtitle: "Bon retour — accédez à votre compte et au chat illimité.",
          email: "Courriel",
          password: "Mot de passe",
          submit: "Se connecter",
          create: "Créer un compte",
          createHint: "Nouveau chez Mavala?",
          forgot: "Mot de passe oublié?",
        };

  return (
    <AuthFlowShell
      imageSrc="/quiz/step9.jpg"
      imageAlt=""
      language={language}
      onToggleLanguage={() => setLanguage(language === "en" ? "fr" : "en")}
    >
      <div className="max-w-md mx-auto w-full">
        <h1 className="font-['Archivo'] text-2xl md:text-4xl font-semibold text-[#AE1932] mb-2 md:mb-3">
          {t.title}
        </h1>
        <p className="font-['Archivo'] text-sm text-gray-600 mb-6 md:mb-8">
          {t.subtitle}
        </p>

        {actionData?.error && (
          <div
            className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm font-['Archivo']"
            role="alert"
          >
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block font-['Archivo'] text-xs uppercase tracking-wider text-gray-500 mb-1"
            >
              {t.email}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 focus:border-[#AE1932] rounded-lg focus:outline-none font-['Archivo'] text-sm text-gray-900"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="block font-['Archivo'] text-xs uppercase tracking-wider text-gray-500 mb-1"
            >
              {t.password}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 focus:border-[#AE1932] rounded-lg focus:outline-none font-['Archivo'] text-sm text-gray-900"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <a
              href={recoverUrl}
              target={recoverUrl === "#" ? undefined : "_blank"}
              rel={recoverUrl === "#" ? undefined : "noopener noreferrer"}
              className="font-['Archivo'] text-sm text-[#AE1932] hover:underline"
            >
              {t.forgot}
            </a>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full px-6 py-3.5 bg-[#AE1932] text-white font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-[#8d1428] disabled:opacity-50 transition-colors"
          >
            {busy ? "…" : t.submit}
          </button>
        </Form>

        <p className="mt-8 text-center font-['Archivo'] text-sm text-gray-500">
          {t.createHint}{" "}
          <Link
            to="/join"
            className="text-[#AE1932] font-medium hover:underline"
          >
            {t.create}
          </Link>
        </p>
      </div>
    </AuthFlowShell>
  );
}
