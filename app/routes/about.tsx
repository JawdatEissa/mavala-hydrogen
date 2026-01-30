import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { HeroVideo } from "../components/HeroVideo";

export const meta: MetaFunction = () => {
  return [
    { title: "About Us | Mavala Switzerland" },
    {
      name: "description",
      content:
        "MAVALA is a philosophy dedicated to care and beauty. For more than 60 years, the name MAVALA has become synonymous with quality cosmetics.",
    },
  ];
};

export default function AboutPage() {
  return (
    <div className="pt-[90px]">
      {/* Hero Video Section - Same dimensions as landing page */}
      <HeroVideo videoId="fNGAmWwRx6Y" />

      {/* ABOUT Header Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-['Archivo'] text-[36px] md:text-[42px] font-semibold text-[#ae1932] uppercase tracking-[2px] leading-tight">
            ABOUT
          </h1>
          <h2 className="font-['Archivo'] text-[20px] md:text-[24px] font-medium text-[#1c1c1c] mt-6 leading-relaxed">
            MAVALA is a philosophy dedicated to care and beauty.
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] mt-6 leading-[1.7]">
            Throughout the world and for more than 60 years, the name MAVALA has
            become synonymous with quality cosmetics thanks to our specific and
            high performing care and beauty products, concentrating our efforts
            on innovation and the search for perfection. All our products are
            developed and manufactured in our scientific laboratories in Geneva
            (Switzerland), in conformity with the most rigorous quality
            standards and regulations.
          </p>
        </div>
      </section>

      {/* MAVALA Cares Section */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#ae1932] uppercase tracking-[1px] text-center mb-4">
            MAVALA cares
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] text-center mb-10 leading-[1.7]">
            We care about the planet. We aim to minimise our impact on the
            environment through the following measures:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Ingredients */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h3 className="font-['Archivo'] text-[18px] font-semibold text-[#1c1c1c] mb-4">
                Ingredients
              </h3>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                We source our ingredients and raw materials from the nearest
                suppliers in Switzerland to reduce our carbon footprint. We also
                increasingly use ingredients that are readily biodegradable. In
                particular, we do not use plastic microbeads nor
                cyclopentasiloxane (D5), which contribute to ocean pollution.
              </p>
            </div>

            {/* Packaging */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h3 className="font-['Archivo'] text-[18px] font-semibold text-[#1c1c1c] mb-4">
                Packaging
              </h3>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Whenever possible, we package our products without a box or
                cellophane and in recycled and recyclable materials (including
                plastic and glass) to reduce waste. We have also implemented
                clear labelling on product packaging to assist you in knowing
                which part of the packaging can be recycled and how.
              </p>
            </div>

            {/* Manufacturing */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h3 className="font-['Archivo'] text-[18px] font-semibold text-[#1c1c1c] mb-4">
                Manufacturing
              </h3>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Whenever possible, we manufacture under cold conditions to
                reduce energy consumption. We are also implementing strict waste
                separation and recycling processes in our production site and
                warehouses, including that of our Canadian distributor in
                Burnaby.
              </p>
            </div>
          </div>

          {/* Cruelty Free Statement */}
          <div className="text-center bg-white p-6 md:p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
            <p className="font-['Archivo'] text-[17px] md:text-[18px] font-medium text-[#ae1932] leading-[1.7]">
              We are 100% cruelty free, we do not test any of our ingredients or
              products on animals.
            </p>
          </div>
        </div>
      </section>

      {/* Mavala Cares Image */}
      <section className="py-0 bg-white">
        <div className="w-full">
          <img
            src="https://images.squarespace-cdn.com/content/v1/55432595e4b05903a7a1130b/1539994037869-KDW23CAFI5T9HQVCWEM5/Mavala+cares.jpg"
            alt="Mavala cares - Our commitment to quality and sustainability"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Nail care and beauty */}
            <div className="border-b border-gray-200 pb-8">
              <Link to="/nail-care" className="group">
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-3 group-hover:underline">
                  Nail care and beauty
                </h3>
              </Link>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                We are specialists in the care and beauty of nails, offering a
                complete range of products that respond to all nail problems,
                from uneven nail surfaces, splitting and flaking due to lack of
                hydration or nail discolouration. Thanks to our efforts to
                innovate and deliver solutions to address various nail problems,
                our product range is the most extensive in the nail care
                industry today. We also offer a vast array of over 300 nail
                colours in shades ranging from chic yet understated nudes to the
                bold and vibrant.
              </p>
            </div>

            {/* Hand care and beauty */}
            <div className="border-b border-gray-200 pb-8">
              <Link to="/hand-care" className="group">
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-3 group-hover:underline">
                  Hand care and beauty
                </h3>
              </Link>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                As a natural extension to our nail care and beauty line of
                products, we offer a range of specific hand care products,
                collectively referred to as the MAVALA Swiss Hand Care
                Programme, specifically formulated to care for the hands with
                active ingredients revolutionary for their use in hand
                treatments.
              </p>
            </div>

            {/* Skin care and beauty */}
            <div className="border-b border-gray-200 pb-8">
              <Link to="/skincare" className="group">
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-3 group-hover:underline">
                  Skin care and beauty
                </h3>
              </Link>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                After many years of research and development, we created a line
                of face care and beauty, blending our scientific expertise and a
                natural ingredient commonly found in Switzerland, the Mallow,
                which is present in all the care products of this line. In 2016,
                born from a controlled fusion between Swiss Nature and the
                science of cosmetology, SWISS SKIN SOLUTION was born,
                meticulously combining the power of Alpine botanic treasures
                with advanced dermatological active ingredients.
              </p>
            </div>

            {/* Eye contour and eyelashes care */}
            <div className="border-b border-gray-200 pb-8">
              <Link to="/eye-care" className="group">
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-3 group-hover:underline">
                  Eye contour and eyelashes care
                </h3>
              </Link>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                With the same enthusiasm, professionalism and savoir-faire as
                for all our other lines of products, we have been developing a
                range of beauty and care products for the eye contour and
                eyelashes since 1967, with the introduction of Double-Lash, a
                unique eyelash enhancer formulated to lengthen, cover and
                protect the lashes allowing them to become healthy, long and
                resistant.
              </p>
            </div>

            {/* Foot care and beauty */}
            <div className="border-b border-gray-200 pb-8">
              <Link to="/foot-care" className="group">
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-3 group-hover:underline">
                  Foot care and beauty
                </h3>
              </Link>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                With the aim of constant innovation, we have expanded our field
                of action and experience to foot care. In perfect harmony with
                our existing ranges, the foot care and beauty line is composed
                of different complementary products to provide comfort, vitality
                and freshness to feet.
              </p>
            </div>

            {/* Hair and body care */}
            <div className="border-b border-gray-200 pb-8">
              <Link to="/the-brand" className="group">
                <h3 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-3 group-hover:underline">
                  Hair and body care
                </h3>
              </Link>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Body and hair have also drawn the attention of our laboratories
                which have developed a smooth shampoo and two subtle oils for
                hair and body, all blended with a south Pacific Island scent.
                (Tanoa)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mavala's History Section */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#ae1932] uppercase tracking-[1px] mb-8">
            Mavala's history
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] leading-[1.8] mb-6">
            MAVALA was founded in Switzerland in 1959 by Mrs Madeleine VAN
            LANDEGHEM with the introduction of the Scientifique Nail Hardener,
            which remains one of MAVALA's best selling products.
          </p>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] leading-[1.8] mb-6">
            In 1969, we opened our first professional manicure school in London,
            and since 1994, we have been working in close collaboration with
            thirty French beauty schools, which use our products and manicure
            techniques as part of their curriculum.
          </p>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] leading-[1.8] mb-10">
            Today, MAVALA is distributed in 110 countries around the world, in
            department stores, cosmetic stores, perfumeries, pharmacies, beauty
            salons and spas.
          </p>
          <a
            href="https://www.mavala.com"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-8 py-4 border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[14px] font-normal uppercase tracking-[1px] hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
          >
            Visit Mavala.com →
          </a>
        </div>
      </section>

      {/* MAVALA CANADA Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-['Archivo'] text-[28px] md:text-[32px] font-semibold text-[#1c1c1c] uppercase tracking-[1px] mb-8">
            MAVALA CANADA
          </h2>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] leading-[1.8] mb-10">
            Mavala Canada is operated by Vanir Merchants Incorporated,
            independent Canadian based importer and distributor of beauty and
            care products. Mavala products are imported in Canada by Vanir
            Merchants Incorporated. The mavala.ca website and online store is
            operated by Vanir Merchants Incorporated, under licence from MAVALA
            Switzerland. All Mavala products purchased from this online store
            and any of the authorised stockists listed in our store locator are
            certified genuine Mavala products. Beware of forgeries, products
            purchased from auction sites and international stores may not be
            genuine Mavala products.
          </p>
          <a
            href="https://www.vanirmerchants.com"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-8 py-4 border-2 border-[#ae1932] bg-transparent text-[#ae1932] font-['Archivo'] text-[14px] font-normal uppercase tracking-[1px] hover:bg-[#ae1932] hover:text-white transition-colors duration-150"
          >
            Visit VanirMerchants.com →
          </a>
        </div>
      </section>

      {/* Bottom Info Boxes */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            {/* Independent Swiss Laboratory */}
            <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm">
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

            {/* Available nationally */}
            <div className="bg-white p-8 md:p-10 rounded-lg shadow-sm">
              <h3 className="font-['Archivo'] text-[16px] font-semibold uppercase tracking-[1px] text-[#5c666f] mb-2">
                Available nationally
              </h3>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] mb-4">
                Find MAVALA products online, in pharmacies and beauty salons
              </p>
              <Link
                to="/where-to-buy"
                className="font-['Archivo'] text-[14px] text-[#ae1932] font-normal underline underline-offset-4 hover:no-underline"
              >
                Where to buy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
