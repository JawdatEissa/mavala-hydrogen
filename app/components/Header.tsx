import { Link } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { categories } from "../lib/mock-data";

// Mavala Logo Component - using official logo image from Squarespace CDN
const LOGO_URL = "https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/2145336d-78c4-4158-95e6-60f11fe8a5f8/MAVALA_Switzerland_logotype+Digital.png?format=1500w";

function MavalaLogo({ width = 240 }: { width?: number }) {
  return (
    <div
      id="logoWrapper"
      className="title-logo-wrapper"
      style={{
        display: 'block',
        textAlign: 'center',
        width: `${width}px`,
        height: 'auto',
        lineHeight: 1,
      }}
    >
      <h1
        id="logoImage"
        className="logo-image"
        style={{
          margin: 0,
          fontSize: 0,
          maxWidth: '100%',
        }}
      >
        <Link to="/">
          <img
            src={LOGO_URL}
            alt="Mavala Switzerland"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              border: 0,
              display: 'block',
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

export function Header() {
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
    // Tunables to reduce jitter while keeping the header feeling responsive
    const HIDE_AFTER_PX = 50; // don't hide until user is past the hero/top area (25% faster)
    const SHOW_NEAR_TOP_PX = 40; // always show when near the very top
    const MIN_DIRECTION_TRAVEL_PX = 8; // hysteresis: ignore tiny direction changes (25% faster)
    const RESPONSE_DELAY_MS = 90; // debounce: wait a bit before applying show/hide (25% faster)

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
      // Ignore tiny scroll noise (trackpads / momentum)
      if (Math.abs(delta) < 2) {
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

      // Require a minimum distance traveled in the new direction before reacting
      const traveled = Math.abs(currentScrollY - directionStartYRef.current);
      if (traveled < MIN_DIRECTION_TRAVEL_PX) {
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const nextHidden =
        direction === "down" ? currentScrollY > HIDE_AFTER_PX : false;

      if (nextHidden === isHiddenRef.current) {
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Debounce applying show/hide so it doesn't jitter during small up/down motions
      clearPending();
      scrollTimeoutRef.current = window.setTimeout(() => {
        if (isMobileMenuOpenRef.current) return;
        if (nextHidden !== isHiddenRef.current) setIsHidden(nextHidden);
      }, RESPONSE_DELAY_MS);

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
      ""
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
        transition: "top 0.36s cubic-bezier(0.32, 0.72, 0, 1)",
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

            <Link 
              to="/search" 
              className={navLinkClasses}
            >
              SEARCH
            </Link>

            <Link 
              to="/account" 
              className={navLinkClasses}
            >
              SIGN IN
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
          <a
            href="/cart"
            className="absolute top-[25px] right-4 p-3 z-[10001] bg-white rounded-md text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </a>
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
                            ""
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
                          ""
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
                          ""
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
                      ""
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
                      ""
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
                      ""
                    );
                  }
                }}
              >
                Search
              </a>

              <a
                href="/account"
                className="text-[28px] font-['Archivo'] font-normal uppercase tracking-[0.5px] text-gray-900 hover:text-red-700 transition-colors"
                onClick={() => {
                  if (window.history.state?.mobileMenuOpen) {
                    window.history.replaceState(
                      { ...window.history.state, mobileMenuOpen: false },
                      ""
                    );
                  }
                }}
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
