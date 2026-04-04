import { Link, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { categories } from "../lib/mock-data";

// Served from /public/brand — not a third-party CDN (avoids distributor URL breakage)
const LOGO_URL = "/brand/mavala-switzerland-logotype.webp";

function MavalaLogo({ width = 240 }: { width?: number }) {
  return (
    <div
      id="logoWrapper"
      className="title-logo-wrapper"
      style={{
        display: "block",
        textAlign: "center",
        width: `${width}px`,
        height: "auto",
        lineHeight: 1,
      }}
    >
      <h1
        id="logoImage"
        className="logo-image"
        style={{
          margin: 0,
          fontSize: 0,
          maxWidth: "100%",
        }}
      >
        <Link to="/">
          <img
            src={LOGO_URL}
            alt="Mavala Switzerland"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "100%",
              border: 0,
              display: "block",
            }}
          />
        </Link>
      </h1>
    </div>
  );
}

// Navigation link style classes - match reference header styling
const navLinkClasses =
  "block font-['Archivo'] text-[14px] font-normal leading-[14px] uppercase tracking-[0.92px] text-[rgba(167,24,48,0.996)] px-[14px] py-[10.5px] text-center transition-colors duration-100 ease-in-out";

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

/** Root loader in `root.tsx` provides cart + customer session for the header. */
type RootLoaderShape = {
  cartItemCount?: number;
  isLoggedIn?: boolean;
  customerFirstName?: string | null;
  customerEmail?: string | null;
  customerAccountUrl?: string | null;
};

export function Header() {
  const rootData = useRouteLoaderData("root") as RootLoaderShape | undefined;
  const cartItemCount = rootData?.cartItemCount ?? 0;
  const isLoggedIn = rootData?.isLoggedIn ?? false;
  const customerFirstName = rootData?.customerFirstName?.trim() || null;
  const customerEmail = rootData?.customerEmail?.trim() || null;
  const customerAccountUrl = rootData?.customerAccountUrl ?? null;

  const displayName =
    customerFirstName ||
    (customerEmail ? customerEmail.split("@")[0] : null) ||
    "Account";
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);
  const isMobileMenuOpenRef = useRef(false);
  const isHiddenRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastDirectionRef = useRef<"up" | "down" | null>(null);
  const directionStartYRef = useRef(0);

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    isHiddenRef.current = isHidden;
  }, [isHidden]);

  // Scroll-hide header (disabled while mobile menu is open)
  useEffect(() => {
    // Tunables for smooth, deliberate scroll behavior
    // Different thresholds for hide vs show to prevent covering content
    const HIDE_AFTER_PX = 30; // hide quickly once user starts scrolling down
    const SHOW_NEAR_TOP_PX = 50; // always show when near the very top

    // Hysteresis: require more distance when showing (scroll up) to prevent
    // the header from appearing too quickly and covering product titles
    const MIN_TRAVEL_TO_HIDE_PX = 6; // minimal distance to hide (fast response)
    const MIN_TRAVEL_TO_SHOW_PX = 35; // distance to travel before showing (scroll up) - more deliberate

    // Debounce delays: longer delay for showing to make it feel more intentional
    const HIDE_DELAY_MS = 0; // immediate hide (no delay)
    const SHOW_DELAY_MS = 180; // longer delay when showing (prevents accidental reveals)

    // Velocity tracking for smoother response
    const SCROLL_NOISE_THRESHOLD = 2; // more responsive to scroll input

    const clearPending = () => {
      if (scrollTimeoutRef.current != null) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };

    const handleScroll = () => {
      if (isMobileMenuOpenRef.current) return;
      const currentScrollY = window.scrollY;

      // Always show near top (prevents odd "hidden at top" states)
      if (currentScrollY <= SHOW_NEAR_TOP_PX) {
        clearPending();
        if (isHiddenRef.current) setIsHidden(false);
        lastScrollYRef.current = currentScrollY;
        lastDirectionRef.current = null;
        directionStartYRef.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollYRef.current;
      // Ignore tiny scroll noise (trackpads / momentum / sub-pixel)
      if (Math.abs(delta) < SCROLL_NOISE_THRESHOLD) {
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const direction: "up" | "down" = delta > 0 ? "down" : "up";

      // On direction change, reset hysteresis window and cancel pending toggle
      if (lastDirectionRef.current !== direction) {
        lastDirectionRef.current = direction;
        directionStartYRef.current = currentScrollY;
        clearPending();
      }

      // Require different minimum distances based on direction
      // This prevents the header from popping up and covering content when user
      // makes small upward scrolls (e.g., reading product titles)
      const traveled = Math.abs(currentScrollY - directionStartYRef.current);
      const minTravelRequired =
        direction === "down" ? MIN_TRAVEL_TO_HIDE_PX : MIN_TRAVEL_TO_SHOW_PX;

      if (traveled < minTravelRequired) {
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const nextHidden =
        direction === "down" ? currentScrollY > HIDE_AFTER_PX : false;

      if (nextHidden === isHiddenRef.current) {
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Different delays for show vs hide for a more intentional feel
      const delayMs = nextHidden ? HIDE_DELAY_MS : SHOW_DELAY_MS;

      // Debounce applying show/hide so it doesn't jitter during small up/down motions
      clearPending();
      scrollTimeoutRef.current = window.setTimeout(() => {
        if (isMobileMenuOpenRef.current) return;
        if (nextHidden !== isHiddenRef.current) setIsHidden(nextHidden);
      }, delayMs);

      lastScrollYRef.current = currentScrollY;
    };

    // Listen for custom event from ShadeDrawer
    const handleDrawerOpen = () => {
      clearPending();
      setIsHidden(true);
    };
    const handleDrawerClose = () => {
      clearPending();
      if (!isMobileMenuOpenRef.current) setIsHidden(false);
    };

    // Listen for tab click event - keep header in current state
    let tabClickPauseUntil = 0;
    const handleTabClick = () => {
      tabClickPauseUntil = Date.now() + 300;
    };

    // Wrap the scroll handler to check for tab click pause
    const wrappedHandleScroll = () => {
      if (Date.now() < tabClickPauseUntil) return;
      handleScroll();
    };

    // Initialize refs to avoid incorrect first-scroll direction detection
    lastScrollYRef.current = window.scrollY;
    directionStartYRef.current = window.scrollY;

    window.addEventListener("scroll", wrappedHandleScroll, { passive: true });
    window.addEventListener("shadeDrawerOpen", handleDrawerOpen);
    window.addEventListener("shadeDrawerClose", handleDrawerClose);
    window.addEventListener("productTabClick", handleTabClick);

    return () => {
      clearPending();
      window.removeEventListener("scroll", wrappedHandleScroll);
      window.removeEventListener("shadeDrawerOpen", handleDrawerOpen);
      window.removeEventListener("shadeDrawerClose", handleDrawerClose);
      window.removeEventListener("productTabClick", handleTabClick);
    };
  }, []);

  // Mobile menu: push history state so Android back button closes it
  useEffect(() => {
    const handlePopState = () => {
      if (isMobileMenuOpenRef.current) {
        setIsMobileMenuOpen(false);
        setIsHidden(false);
        lastScrollYRef.current = window.scrollY;
        lastDirectionRef.current = null;
        directionStartYRef.current = window.scrollY;
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    // Hide header while menu is open (requested behavior)
    setIsHidden(true);
    lastScrollYRef.current = window.scrollY;

    // Push a history entry so the native back button closes the menu
    const currentState =
      typeof window !== "undefined" ? window.history.state : null;
    window.history.pushState(
      { ...(currentState ?? {}), mobileMenuOpen: true },
      "",
    );

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // close via back to remove the pushed state
        if (window.history.state?.mobileMenuOpen) window.history.back();
        else setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className="w-full fixed top-0 left-0 right-0 z-[9999] bg-white shadow-sm"
      style={{
        top: isHidden ? "-90px" : "0px",
        // Asymmetric animation: fast hide, smooth show
        transition: isHidden
          ? "top 0.25s cubic-bezier(0.4, 0, 1, 1)" // hiding: fast, snappy
          : "top 0.5s cubic-bezier(0.0, 0, 0.2, 1)", // showing: slower, more deliberate ease-out
      }}
    >
      <nav className="h-[90px] relative">
        {/* Desktop Navigation - Three column layout for perfect centering */}
        <div className="hidden lg:grid grid-cols-3 items-center h-full px-8">
          {/* Left Group: SHOP, DIAGNOSIS, BLOG - pushed right towards logo */}
          <div className="flex flex-row items-center justify-end gap-6">
            {/* SHOP with CSS-only dropdown - group hover (non-clickable) */}
            <div className="relative group">
              <span
                className={`${navLinkClasses} relative z-[10001] cursor-default`}
              >
                SHOP
              </span>

              {/* Dropdown Menu - CSS hover, no JavaScript */}
              <div className="absolute top-full left-0 w-[220px] z-[10000] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* Invisible bridge to prevent hover gap */}
                <div className="h-2"></div>
                <div className="bg-white shadow-xl py-4 flex flex-col border border-gray-100">
                  {categories.map((cat) => (
                    <a
                      key={cat.slug}
                      href={cat.url}
                      className="font-sans text-[12px] font-semibold text-black hover:text-red-700 hover:bg-gray-50 transition-colors py-3 px-6 uppercase tracking-[0.1em] text-left w-full"
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* DIAGNOSIS with dropdown */}
            <div className="relative group">
              <span
                className={`${navLinkClasses} relative z-[10001] cursor-pointer`}
              >
                DIAGNOSIS
              </span>

              {/* Dropdown Menu - CSS hover */}
              <div className="absolute top-full left-0 w-[220px] z-[10000] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {/* Invisible bridge to prevent hover gap */}
                <div className="h-2"></div>
                <div className="bg-white shadow-xl py-4 flex flex-col border border-gray-100">
                  <Link
                    to="/nail-diagnosis"
                    className="font-sans text-[12px] font-semibold text-black hover:text-red-700 hover:bg-gray-50 transition-colors py-3 px-6 uppercase tracking-[0.1em] text-left w-full"
                  >
                    NAIL QUIZ
                  </Link>
                  <Link
                    to="/face-concerns"
                    className="font-sans text-[12px] font-semibold text-black hover:text-red-700 hover:bg-gray-50 transition-colors py-3 px-6 uppercase tracking-[0.1em] text-left w-full"
                  >
                    SKIN QUIZ
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/blog" className={navLinkClasses}>
              BLOG
            </Link>
          </div>

          {/* Center: Logo - perfectly centered with spacing */}
          <div className="flex items-center justify-center mx-6">
            <MavalaLogo width={240} />
          </div>

          {/* Right Group: THE BRAND, SEARCH, SIGN IN - pushed left towards logo */}
          <div className="flex flex-row items-center justify-start gap-6">
            <a href="/the-brand" className={navLinkClasses}>
              THE BRAND
            </a>

            <Link to="/search" className={navLinkClasses}>
              SEARCH
            </Link>

            {isLoggedIn ? (
              <div className="flex flex-row items-center gap-1 xl:gap-2 shrink-0">
                <span
                  className="font-['Archivo'] text-[12px] xl:text-[13px] font-normal leading-tight uppercase tracking-[0.92px] text-[rgba(167,24,48,0.996)] px-2 xl:px-[10px] py-[10.5px] max-w-[72px] xl:max-w-[100px] 2xl:max-w-[130px] truncate text-center"
                  title={
                    customerEmail ||
                    customerFirstName ||
                    undefined
                  }
                >
                  {customerFirstName
                    ? customerFirstName.toUpperCase()
                    : displayName.toUpperCase()}
                </span>
                {customerAccountUrl ? (
                  <a
                    href={customerAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={navLinkClasses}
                  >
                    ACCOUNT
                  </a>
                ) : null}
                <Link to="/logout" className={navLinkClasses}>
                  SIGN OUT
                </Link>
              </div>
            ) : (
              <Link to="/login" className={navLinkClasses}>
                SIGN IN
              </Link>
            )}

            <Link
              to="/cart"
              className={`${navLinkClasses} inline-flex items-center justify-center`}
              aria-label={
                cartItemCount > 0
                  ? `Shopping bag, ${cartItemCount} items`
                  : "Shopping bag"
              }
            >
              <span className="relative inline-flex items-center justify-center">
                <BagIcon className="w-[22px] h-[22px]" />
                {cartItemCount > 0 ? (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-0.5 rounded-full bg-[#a71830] text-white text-[10px] font-semibold leading-[18px] text-center tabular-nums">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                ) : null}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Header - Using native details/summary for guaranteed functionality */}
        <div className="lg:hidden h-full">
          {/* Mobile Logo - centered */}
          <div className="flex items-center justify-center h-full">
            <MavalaLogo width={160} />
          </div>

          {/* Mobile Cart */}
          <Link
            to="/cart"
            className="absolute top-[22px] right-4 p-2 z-[10001] text-[rgba(167,24,48,0.996)]"
            aria-label={
              cartItemCount > 0
                ? `Shopping bag, ${cartItemCount} items`
                : "Shopping bag"
            }
          >
            <span className="relative inline-flex">
              <BagIcon className="w-7 h-7" />
              {cartItemCount > 0 ? (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-0.5 rounded-full bg-[#a71830] text-white text-[10px] font-semibold leading-[18px] text-center tabular-nums">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              ) : null}
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden absolute top-[20px] left-4 z-[10001] p-3 bg-white rounded-md shadow-sm hover:bg-gray-50"
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <svg
            className="w-6 h-6 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay (renders outside header flow; closes on back button) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[10010] bg-white">
          {/* Close button (X) */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute top-5 left-4 p-3 bg-white rounded-md shadow-sm hover:bg-gray-50"
            onClick={() => {
              // Prefer history.back so the Android back button stack stays clean
              if (window.history.state?.mobileMenuOpen) window.history.back();
              else setIsMobileMenuOpen(false);
            }}
          >
            <svg
              className="w-6 h-6 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="pt-[90px] max-h-screen overflow-y-auto">
            <div className="flex flex-col p-8 space-y-6 text-center">
              {/* Shop with sub-menu */}
              <details className="group/shop">
                <summary className="list-none cursor-pointer text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 flex items-center justify-center gap-2">
                  <span className="group-open/shop:hidden">+</span>
                  <span className="hidden group-open/shop:inline">−</span>
                  <span>Shop</span>
                </summary>
                <div className="space-y-3 mt-4">
                  {categories.map((cat) => (
                    <a
                      key={cat.slug}
                      href={cat.url}
                      className="block text-[18px] font-['Archivo'] uppercase tracking-[0.2px] text-gray-800 hover:text-red-700 transition-colors w-full text-center py-2"
                      onClick={() => {
                        // Prevent returning to an intermediate "menu open" state on back
                        if (window.history.state?.mobileMenuOpen) {
                          window.history.replaceState(
                            { ...window.history.state, mobileMenuOpen: false },
                            "",
                          );
                        }
                      }}
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </details>

              {/* Diagnosis with sub-menu */}
              <details className="group/diagnosis">
                <summary className="list-none cursor-pointer text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 flex items-center justify-center gap-2">
                  <span className="group-open/diagnosis:hidden">+</span>
                  <span className="hidden group-open/diagnosis:inline">−</span>
                  <span>Diagnosis</span>
                </summary>
                <div className="space-y-3 mt-4">
                  <a
                    href="/nail-diagnosis"
                    className="block text-[18px] font-['Archivo'] uppercase tracking-[0.2px] text-gray-800 hover:text-red-700 transition-colors w-full text-center py-2"
                    onClick={() => {
                      if (window.history.state?.mobileMenuOpen) {
                        window.history.replaceState(
                          { ...window.history.state, mobileMenuOpen: false },
                          "",
                        );
                      }
                    }}
                  >
                    NAIL QUIZ
                  </a>
                  <a
                    href="/face-concerns"
                    className="block text-[18px] font-['Archivo'] uppercase tracking-[0.2px] text-gray-800 hover:text-red-700 transition-colors w-full text-center py-2"
                    onClick={() => {
                      if (window.history.state?.mobileMenuOpen) {
                        window.history.replaceState(
                          { ...window.history.state, mobileMenuOpen: false },
                          "",
                        );
                      }
                    }}
                  >
                    SKIN QUIZ
                  </a>
                </div>
              </details>

              <a
                href="/blog"
                className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                onClick={() => {
                  if (window.history.state?.mobileMenuOpen) {
                    window.history.replaceState(
                      { ...window.history.state, mobileMenuOpen: false },
                      "",
                    );
                  }
                }}
              >
                Blog
              </a>

              <a
                href="/the-brand"
                className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                onClick={() => {
                  if (window.history.state?.mobileMenuOpen) {
                    window.history.replaceState(
                      { ...window.history.state, mobileMenuOpen: false },
                      "",
                    );
                  }
                }}
              >
                The Brand
              </a>

              <a
                href="/search"
                className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                onClick={() => {
                  if (window.history.state?.mobileMenuOpen) {
                    window.history.replaceState(
                      { ...window.history.state, mobileMenuOpen: false },
                      "",
                    );
                  }
                }}
              >
                Search
              </a>

              {isLoggedIn ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="text-[22px] font-['Archivo'] font-normal tracking-[0.5px] text-gray-900">
                    <span className="block text-[14px] uppercase tracking-wider text-gray-500 mb-1">
                      Signed in
                    </span>
                    <span className="block text-[28px] uppercase tracking-[0.5px]">
                      {customerFirstName || displayName}
                    </span>
                    {customerEmail ? (
                      <span className="block text-[15px] normal-case text-gray-600 mt-2 break-all">
                        {customerEmail}
                      </span>
                    ) : null}
                  </div>
                  {customerAccountUrl ? (
                    <a
                      href={customerAccountUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                      onClick={() => {
                        if (window.history.state?.mobileMenuOpen) {
                          window.history.replaceState(
                            { ...window.history.state, mobileMenuOpen: false },
                            "",
                          );
                        }
                      }}
                    >
                      My account
                    </a>
                  ) : null}
                  <Link
                    to="/logout"
                    className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                    onClick={() => {
                      if (window.history.state?.mobileMenuOpen) {
                        window.history.replaceState(
                          { ...window.history.state, mobileMenuOpen: false },
                          "",
                        );
                      }
                    }}
                  >
                    Sign out
                  </Link>
                </div>
              ) : (
                <a
                  href="/login"
                  className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                  onClick={() => {
                    if (window.history.state?.mobileMenuOpen) {
                      window.history.replaceState(
                        { ...window.history.state, mobileMenuOpen: false },
                        "",
                      );
                    }
                  }}
                >
                  Sign In
                </a>
              )}

              <Link
                to="/cart"
                className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors inline-flex items-center justify-center gap-2"
                onClick={() => {
                  if (window.history.state?.mobileMenuOpen) {
                    window.history.replaceState(
                      { ...window.history.state, mobileMenuOpen: false },
                      "",
                    );
                  }
                }}
              >
                Bag
                {cartItemCount > 0 ? (
                  <span className="text-[18px] font-semibold tabular-nums bg-[#a71830] text-white rounded-full min-w-[28px] px-2 py-0.5">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
