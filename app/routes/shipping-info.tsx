import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Shipping & Returns | Mavala Canada" },
    {
      name: "description",
      content:
        "Free shipping on orders over $50. Learn about our shipping times and returns policy for Mavala Canada.",
    },
  ];
};

export default function ShippingInfoPage() {
  return (
    <div className="pt-[90px]">
      {/* Header Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-['Archivo'] text-[36px] md:text-[42px] font-semibold text-[#ae1932] uppercase tracking-[2px] leading-tight text-center mb-6">
            Shipping
          </h1>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] text-center leading-[1.7]">
            We ship to Canadian addresses only. For other locations, please
            visit your local Mavala distributor or contact{" "}
            <a
              href="https://www.mavala.com/contact"
              target="_blank"
              rel="noreferrer"
              className="text-[#ae1932] hover:underline"
            >
              Mavala International
            </a>
            .
          </p>
        </div>
      </section>

      {/* Shipping Details */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cost */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                Cost
              </h2>
              <ul className="space-y-3">
                <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    <strong className="text-[#1c1c1c]">Free</strong> for orders
                    over $50. In addition, orders over $100 receive a free trial
                    size product.
                  </span>
                </li>
                <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    <strong className="text-[#1c1c1c]">$9.95 Flat rate</strong>{" "}
                    Canada wide for orders below $50.
                  </span>
                </li>
              </ul>
            </div>

            {/* Time */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                Time
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-3">
                All orders are dispatched within 2 business days and are shipped
                from Burnaby, BC, Canada.
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Shipping times vary depending on your location. Indicative
                shipping time is usually within 5-10 business days of dispatch.
                Service may take longer in remote areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="font-['Archivo'] text-[36px] md:text-[42px] font-semibold text-[#ae1932] uppercase tracking-[2px] leading-tight text-center mb-12">
            Returns
          </h1>

          {/* Change of Mind */}
          <div className="mb-10">
            <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#1c1c1c] mb-4">
              Change of Mind
            </h2>
            <div className="bg-[#f6f3ef] p-6 rounded-lg mb-4">
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] italic">
                For hygiene reasons, no returns or exchanges will be accepted on
                any product sold unsealed or on sealed products where the seal
                has been broken, unless the product was faulty. For this reason,
                it is strongly recommended that purchases on the website be
                limited to products and shades that you have used in the past.
                To try any of our products, please visit one of our stockists.
              </p>
            </div>
            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
              For sealed products where the product has not been used and the
              seal and packaging are still intact, we accept change of mind
              returns within 14 days of purchase. Exclusions may apply to
              products which do not meet certain criteria, such as clearance
              stock, customised products, or used items.
            </p>
            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
              To return a product under this policy, please contact our customer
              service manager via email at{" "}
              <a
                href="mailto:info@mavala.ca"
                className="text-[#ae1932] hover:underline"
              >
                info@mavala.ca
              </a>{" "}
              or by calling{" "}
              <a
                href="tel:+12362466090"
                className="text-[#ae1932] hover:underline"
              >
                +1 236 246 6090
              </a>
              .
            </p>
            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
              We may offer you a choice of a credit voucher redeemable for any
              new purchase of goods from us, or a cash refund of the purchase
              price you paid, less any unrecoverable costs, such as merchant
              fees and shipping charges. We do not cover the cost of return
              shipping.
            </p>
          </div>

          {/* Faulty Items */}
          <div>
            <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#1c1c1c] mb-4">
              Faulty Items
            </h2>
            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
              We will provide refunds as required under Canadian Consumer
              Protection Law if the goods you purchased are:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-6 ml-4">
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                not of merchantable quality;
              </li>
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                not fit for purpose; or
              </li>
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                do not match the sample made available to you.
              </li>
            </ol>

            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
              Should you wish to seek a refund due to one of the reasons set out
              above, you are required to return to us within 14 days:
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-6 ml-4">
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                The goods you purchased from us, with all original packaging
                reasonably intact;
              </li>
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Proof of purchase, such as the original tax invoice and
                transaction receipt;
              </li>
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Means to identify you as the original purchaser; and
              </li>
              <li className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Details of the fault or issue with the product, caused by
                something other than you.
              </li>
            </ol>

            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
              To return damaged or faulty goods under this policy, please
              contact our customer service manager via email at{" "}
              <a
                href="mailto:info@mavala.ca"
                className="text-[#ae1932] hover:underline"
              >
                info@mavala.ca
              </a>{" "}
              or by calling{" "}
              <a
                href="tel:+12362466090"
                className="text-[#ae1932] hover:underline"
              >
                +1 236 246 6090
              </a>
              .
            </p>

            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
              We may request evidence of the fault or issue, including pictures
              and/or return of the faulty product. If we confirm that the
              product is faulty, we will issue you with a full refund of the
              purchase price you paid, plus standard shipping charges for the
              return of the faulty goods (if applicable).
            </p>

            <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
              We reserve our right to reject the claim for refund in respect of
              any returned products which do not meet the above conditions, and
              we may return the goods to you at your cost or dispose of the
              product if you do not pay return postage or collect the product
              from us within 30 days of being notified that your claim for
              refund was rejected.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 bg-[#f6f3ef]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#1c1c1c] mb-4">
            Need Help?
          </h2>
          <p className="font-['Archivo'] text-[16px] text-[#5c666f] leading-[1.7]">
            Contact us on{" "}
            <a
              href="tel:+12362466090"
              className="text-[#ae1932] hover:underline"
            >
              +1 236 246 6090
            </a>{" "}
            or by email at{" "}
            <a
              href="mailto:info@mavala.ca"
              className="text-[#ae1932] hover:underline"
            >
              info@mavala.ca
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
