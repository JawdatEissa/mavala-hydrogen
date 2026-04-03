import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigationType,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import "./styles/tailwind.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ChatWidget } from "./components/chat";
import {
  fetchCartById,
  readCartIdFromRequest,
} from "./lib/shopify-cart.server";

export const links: LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Archivo:wght@200;300;400;500;600;700&family=Inter:wght@400;500;600&family=Raleway:wght@400;500;600;700&family=Tenor+Sans&family=Marcellus&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  let cartItemCount = 0;
  try {
    const cartId = await readCartIdFromRequest(request);
    if (cartId) {
      const { cart } = await fetchCartById(cartId);
      if (cart) {
        cartItemCount = cart.totalQuantity;
      }
    }
  } catch {
    // Storefront misconfigured or transient error — header shows 0 items
  }
  return json({ cartItemCount });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();

  // TODO: Replace with actual Shopify customer authentication check
  // For now, default to true to show the chatbot (will be gated when auth is implemented)
  const [isLoggedIn] = useState(true);

  // Scroll to top on route change - fixes mobile scroll restoration issues
  useEffect(() => {
    /**
     * Important:
     * - On normal navigations (PUSH/REPLACE) we want to start at top.
     * - On Back/Forward (POP) we must preserve/restore the previous scroll position.
     */
    if (navigationType !== "POP" && !location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash, navigationType]);

  // Handler for login button click (placeholder until Shopify auth is implemented)
  const handleLoginClick = () => {
    // TODO: Implement Shopify customer login modal or redirect
    console.log("Login clicked - implement Shopify auth");
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* React Grab disabled for debugging
        {import.meta.env.DEV && (
          <script src="https://www.react-grab.com/script.js" defer />
        )}
        */}
      </head>
      <body className="antialiased font-sans font-light text-[#272724]">
        <Header />
        <main>{children}</main>
        <Footer />

        {/* AI Chatbot Widget */}
        <ChatWidget isLoggedIn={isLoggedIn} onLoginClick={handleLoginClick} />

        <ScrollRestoration
          getKey={(location) => {
            // Use pathname as key to reset scroll on navigation
            return location.pathname;
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
