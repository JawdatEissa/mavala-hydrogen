import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Where to Buy | Mavala Canada" },
    {
      name: "description",
      content:
        "Find MAVALA products online, in pharmacies and beauty salons across Canada. Discover your nearest Mavala stockist.",
    },
  ];
};

// Online retailers data
const onlineRetailers = [
  {
    name: "Amazon Canada",
    url: "https://www.amazon.ca/stores/Mavala/page/F4F9C4F5-8C8E-4E5A-9C8E-4E5A9C8E4E5A",
    description: "Wide selection of Mavala products with Prime shipping",
  },
  {
    name: "Well.ca",
    url: "https://well.ca/searchresult.html?keyword=mavala",
    description: "Natural health and beauty products retailer",
  },
  {
    name: "London Drugs",
    url: "https://www.londondrugs.com/search/?q=mavala",
    description: "Pharmacy and general merchandise chain",
  },
  {
    name: "Shoppers Drug Mart",
    url: "https://www.shoppersdrugmart.ca",
    description: "Canada's largest pharmacy chain",
  },
];

// Physical stockist types
const stockistTypes = [
  {
    title: "Pharmacies",
    description:
      "Find Mavala products at major pharmacy chains across Canada, including Shoppers Drug Mart, London Drugs, Rexall, and independent pharmacies.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    title: "Beauty Salons",
    description:
      "Professional beauty salons and spas across Canada stock Mavala professional products. Ask your beautician about Mavala treatments.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
  {
    title: "Department Stores",
    description:
      "Select department stores carry Mavala products in their beauty and cosmetics sections.",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
];

export default function WhereToBuyPage() {
  return (
    <div className="pt-[90px]">
      {/* Hero Image Section - Same dimensions as hero videos */}
      <section className="w-full bg-white">
        {/* Mobile - 16:9 aspect ratio */}
        <div
          className="md:hidden relative w-full overflow-hidden bg-black"
          style={{ height: "56.25vw" }}
        >
          <img
            src="/where-to-buy-hero.png"
            alt="Mavala - Find your nearest stockist"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Desktop - 92vh with cover behavior */}
        <div className="hidden md:block relative w-full h-[92vh] overflow-hidden bg-black">
          <img
            src="/where-to-buy-hero.png"
            alt="Mavala - Find your nearest stockist"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Header Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-['Archivo'] text-[36px] md:text-[42px] font-semibold text-[#ae1932] uppercase tracking-[2px] leading-tight">
            WHERE TO BUY
          </h1>
          <h2 className="font-['Archivo'] text-[20px] md:text-[24px] font-medium text-[#1c1c1c] mt-6 leading-relaxed">
            Find your nearest Mavala stockist in Canada
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] mt-6 leading-[1.7]">
            MAVALA products are available nationally across Canada in
            pharmacies, beauty salons, and online stores. Whether you prefer
            shopping online or visiting a physical store, we have options for
            you.
          </p>
        </div>
      </section>

      {/* Purchase Online Section */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#ae1932] uppercase tracking-[1px] text-center mb-4">
            Purchase MAVALA Online
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] text-center mb-10 leading-[1.7]">
            Shop Mavala products from the comfort of your home through our
            official online store or these trusted retailers:
          </p>

          {/* Official Store CTA */}
          <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm text-center mb-10">
            <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#1c1c1c] mb-3">
              Official Mavala Canada Online Store
            </h3>
            <p className="font-['Archivo'] text-[15px] text-[#5c666f] mb-6 leading-[1.7]">
              Shop our complete range of genuine Mavala products with free
              shipping over $50, free gift over $100, and buy now pay later
              options.
            </p>
            <Link
              to="/collections/all"
              className="inline-block px-8 py-4 bg-[#ae1932] text-white font-['Archivo'] text-[14px] font-normal uppercase tracking-[1px] hover:bg-[#8a1428] transition-colors duration-150"
            >
              Shop Now
            </Link>
          </div>

          {/* Online Retailers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onlineRetailers.map((retailer) => (
              <a
                key={retailer.name}
                href={retailer.url}
                target="_blank"
                rel="noreferrer"
                className="bg-white p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
              >
                <h3 className="font-['Archivo'] text-[18px] font-semibold text-[#1c1c1c] mb-2 group-hover:text-[#ae1932] transition-colors">
                  {retailer.name}
                  <span className="inline-block ml-2 text-[#ae1932]">→</span>
                </h3>
                <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                  {retailer.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Find Physical Stockists Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#ae1932] uppercase tracking-[1px] text-center mb-4">
            Find Physical Stockists
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] text-center mb-10 leading-[1.7]">
            MAVALA products are stocked in pharmacies, beauty salons, and select
            retail stores across Canada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stockistTypes.map((stockist) => (
              <div key={stockist.title} className="text-center">
                <div className="flex justify-center mb-4 text-[#ae1932]">
                  {stockist.icon}
                </div>
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#1c1c1c] mb-3">
                  {stockist.title}
                </h3>
                <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                  {stockist.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#1c1c1c] uppercase tracking-[1px] mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] leading-[1.8] mb-8">
            If you're having trouble finding a Mavala product or stockist near
            you, please contact us and we'll be happy to help.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <a
              href="tel:+12362466090"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[14px] font-normal uppercase tracking-[1px] hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              +1 236 246 6090
            </a>
            <a
              href="mailto:info@mavala.ca"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[14px] font-normal uppercase tracking-[1px] hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              info@mavala.ca
            </a>
          </div>
        </div>
      </section>

      {/* Bottom Info Boxes */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            {/* Independent Swiss Laboratory */}
            <div className="bg-[#f6f3ef] p-8 md:p-10 rounded-lg">
              <h3 className="font-['Archivo'] text-[16px] font-semibold uppercase tracking-[1px] text-[#5c666f] mb-2">
                Independent Swiss Laboratory
              </h3>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] mb-4">
                Family business since 1959
              </p>
              <Link
                to="/about"
                className="font-['Archivo'] text-[14px] text-[#ae1932] font-normal underline underline-offset-4 hover:no-underline"
              >
                Find out more
              </Link>
            </div>

            {/* Genuine Products */}
            <div className="bg-[#f6f3ef] p-8 md:p-10 rounded-lg">
              <h3 className="font-['Archivo'] text-[16px] font-semibold uppercase tracking-[1px] text-[#5c666f] mb-2">
                100% Genuine Products
              </h3>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] mb-4">
                All products from our store are certified genuine Mavala
                products
              </p>
              <Link
                to="/collections/all"
                className="font-['Archivo'] text-[14px] text-[#ae1932] font-normal underline underline-offset-4 hover:no-underline"
              >
                Shop now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
