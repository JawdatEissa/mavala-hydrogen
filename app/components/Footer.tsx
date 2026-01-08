import { Link } from "@remix-run/react";

export function Footer() {
  return (
    <footer className="bg-[#f6f3ef] text-gray-900">
      {/* Trust strip (white) */}
      <div className="bg-white border-b border-gray-200 py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-['Archivo'] text-[14px] font-semibold uppercase tracking-[1px] leading-[18.2px] text-[#5d676f]">
                Independent Swiss Laboratory
              </h3>
            <p className="text-gray-700 text-sm font-light">
                Family business since 1959.
              </p>
            <a
              href="#"
              className="font-['Archivo'] text-[14px] text-[#ae1932] font-normal underline underline-offset-4"
            >
              Find out more
            </a>
            </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-['Archivo'] text-[14px] font-semibold uppercase tracking-[1px] leading-[18.2px] text-[#5d676f]">
              Available nationally
              </h3>
            <p className="text-gray-700 text-sm font-light">
              Find MAVALA products online, in pharmacies and beauty salons.
              </p>
            <a
              href="#"
              className="font-['Archivo'] text-[14px] text-[#ae1932] font-normal underline underline-offset-4"
            >
              Where to buy
            </a>
          </div>
        </div>
      </div>

      {/* Top nav row */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-10 md:pt-12">
        <div className="flex flex-wrap justify-center gap-6 text-[15px] font-['Archivo'] font-normal tracking-[0.2px]">
          <Link to="/about" className="hover:text-[#ae1932]">
            About
          </Link>
          <Link to="/shipping-info" className="hover:text-[#ae1932]">
            Shipping &amp; returns
          </Link>
          <Link to="/privacy-policy" className="hover:text-[#ae1932]">
            Privacy
          </Link>
          <Link to="/terms-and-conditions" className="hover:text-[#ae1932]">
            Terms &amp; conditions
          </Link>
          <a
            href="https://www.mavala.com/pages/mavala-world"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#ae1932]"
          >
            Mavala World
          </a>
        </div>
      </div>

      {/* Contact line */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6 text-center text-[15px] font-['Archivo']">
        Need help? Contact us on{" "}
        <a href="tel:+12362466090" className="text-[#ae1932] hover:underline">
          +1 236 246 6090
        </a>{" "}
        or by email at{" "}
        <a
          href="mailto:info@mavala.ca"
          className="text-[#ae1932] hover:underline"
        >
          info@mavala.ca
        </a>
      </div>

      {/* Newsletter */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6 flex flex-col items-center gap-4">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <div className="flex w-full max-w-xl md:max-w-md">
            <input
              type="email"
              placeholder="Email Address"
              className="flex-1 border border-gray-300 bg-white text-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ae1932]"
            />
            <button className="px-6 py-3 border border-[#ae1932] text-[#ae1932] text-xs font-['Archivo'] uppercase tracking-[1px] hover:bg-[#ae1932] hover:text-white transition-colors">
              Join now
            </button>
          </div>
          <div className="flex items-center gap-6 text-[#ae1932] text-xs font-['Archivo']">
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 3a3.5 3.5 0 0 1 3.5 3.5c0 1.456-.887 2.7-2.146 3.236L15 14h2a3 3 0 1 1 0 6h-4v-2h4a1 1 0 1 0 0-2h-4.5l4.08-5.44A1.5 1.5 0 0 0 17.5 8.5 1.5 1.5 0 0 0 16 7h-4V5h4.5Z" />
                </svg>
              <span className="mt-1 text-center leading-tight">Buy now<br />pay later</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 6h18l-1 9H4L3 6Zm2.5 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm13 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
              </svg>
              <span className="mt-1 text-center leading-tight">Free shipping<br />over $50</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 9h14v12H5V9Zm2-5h10v3H7V4Z" />
              </svg>
              <span className="mt-1 text-center leading-tight">Free gift<br />over $100</span>
            </div>
            </div>
          </div>
        </div>

      {/* Address & distributor */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-10 pb-10 text-center text-[14px] font-['Archivo'] tracking-[0.2px]">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <span>Mavala Canada, 7802 Express St, Burnaby BC, V5A 1T4, Canada</span>
          <span className="text-gray-400">|</span>
          <a href="tel:+12362466090" className="text-[#ae1932] hover:underline">
            (+1) 236 246 6090
          </a>
          <span className="text-gray-400">|</span>
          <a href="mailto:info@mavala.ca" className="text-[#ae1932] hover:underline">
            info@mavala.ca
            </a>
        </div>
        <div className="mt-3">
          Distributed by{" "}
          <a
            href="https://www.vanirmerchants.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#ae1932] hover:underline"
          >
            Vanir Merchants Incorporated
          </a>
          , authorised distributor of{" "}
          <a
            href="http://www.mavala.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#ae1932] hover:underline"
          >
            MAVALA
            </a>
          </div>
        <div className="mt-2 text-[13px] text-gray-700">
          © 2025 Mavala Canada. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
