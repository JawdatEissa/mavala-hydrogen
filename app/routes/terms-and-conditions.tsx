import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms & Conditions | Mavala Canada" },
    {
      name: "description",
      content:
        "Terms and Conditions of Use for Mavala Canada website and online store.",
    },
  ];
};

export default function TermsAndConditionsPage() {
  return (
    <div className="pt-[90px]">
      {/* Header */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-['Archivo'] text-[36px] md:text-[42px] font-semibold text-[#ae1932] uppercase tracking-[2px] leading-tight">
            Terms and Conditions of Use
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12 bg-[#f6f3ef]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm">
            {/* Section 1 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                1. Welcome to our site
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">1.1.</strong> www.mavala.ca
                  (this Site) is operated by Vanir Merchants Incorporated, which
                  is registered in British Columbia, Canada, under licence from
                  MAVALA SA which is a corporation with its principal place of
                  business located in Geneva, Switzerland. In these terms and
                  conditions (our user terms), if we say "we", "us" and "our" we
                  mean Vanir Merchants Incorporated, and when we refer to "you"
                  or "your" we mean you, the end user of this Site.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">1.2.</strong> By accessing
                  or using any of the services on our Site, you accept the
                  application of these user terms. If you do not agree to these
                  user terms we won't take it personally, but please do not use
                  our Site.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">1.3.</strong> The Site is a
                  website for our customers to obtain information about our
                  products and purchase consumables relating to cosmetic
                  products and related supplies, (together referred to as the
                  Services).
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">1.4.</strong> All notices,
                  enquiries or complaints relating to the Services can be
                  communicated to Vanir Merchants Incorporated at{" "}
                  <a
                    href="mailto:info@mavala.ca"
                    className="text-[#ae1932] hover:underline"
                  >
                    info@mavala.ca
                  </a>
                  .
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">1.5.</strong> We may need
                  to change these user terms from time to time in order to make
                  sure they stay up to date with the latest legal requirements
                  and any changes to our Services or policies. When we do amend
                  these user terms, the changes will be effective straightaway.
                  We'll usually publish information about changes to be made to
                  our user terms on our Site – but please be aware that it is
                  your responsibility to check and make sure you keep up to date
                  with any changes to our user terms.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                2. Use and Access
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">2.1.</strong> In visiting
                  our Site, you are granted a non-exclusive, limited and
                  revocable licence to access the Services and use the Site
                  functionality on the condition that:
                </p>
                <ul className="list-none ml-6 space-y-2">
                  <li>(a) You only use the Site for lawful purposes;</li>
                  <li>
                    (b) You do not engage in any improper, indecent or offensive
                    behaviour while using the Site;
                  </li>
                  <li>
                    (c) You are not breaking any local, provincial or federal
                    law in your relevant jurisdiction by accessing this Site;
                    and
                  </li>
                  <li>
                    (d) You will treat the Site and its users with respect and
                    will not partake in any conduct that could be considered
                    bullying, harassment, degradation, insulting or otherwise
                    demeaning to the human standard of any other person (as
                    determined by us).
                  </li>
                </ul>
                <p>
                  <strong className="text-[#1c1c1c]">2.2.</strong> By using this
                  Site you agree that we accept no responsibility for this Site
                  or any of its Services being unavailable, and we make no
                  warranties or guarantees, implied or express, as to the
                  ongoing availability of the Site or any of our Services.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">2.3.</strong> You agree
                  that we are not liable for any loss or damage that you or any
                  other person may incur by not being able to access this Site
                  or parts of it.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">2.4.</strong> We may
                  change, update or otherwise amend the Site at our absolute
                  discretion and without notice.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                3. Transactions on the Site
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">3.1.</strong> In order to
                  use all of the Services to conduct a transaction you are
                  required to be:
                </p>
                <ul className="list-none ml-6 space-y-2">
                  <li>(a) 18 years of age or older; and</li>
                  <li>(b) capable of forming binding contracts.</li>
                </ul>
                <p>
                  <strong className="text-[#1c1c1c]">3.2.</strong> If you are
                  under the age of 18 years, your parent or lawful guardian over
                  the age of 18 may register on your behalf. Your parent or
                  guardian will then be responsible for all of your actions.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">3.3.</strong> The
                  information you provide to us when conducting any transaction
                  using the Site must be accurate and complete in all respects.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">3.4.</strong> You will only
                  represent yourself and will not create false aliases or
                  impersonate any other person (with or without their consent)
                  while using the Site.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">3.5.</strong> You agree to
                  keep us indemnified and hold us harmless in respect of any and
                  all liability, loss, costs and expenses arising from or
                  incurred in connection with any use of the third party
                  merchant facilities used to make a purchase of our products.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                4. Accuracy of Information on this Site
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">4.1.</strong> The
                  information on our website is not comprehensive and you
                  acknowledge that there may be technical or administrative
                  errors in the information on the Site, including errors with
                  respect to product description, pricing and availability.
                  While we use all reasonable attempts to ensure the accuracy
                  and completeness of the information on our website, to the
                  extent permitted by law, including the Competition Act
                  (Canada) and applicable provincial consumer protection
                  legislation, we make no warranty regarding the information on
                  this website. You should monitor any changes to the
                  information contained on this website.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">4.2.</strong> We are not
                  liable to you or anyone else if interference with or damage to
                  your computer systems occurs from the use of this website or a
                  linked website. You must take your own precautions to ensure
                  that anything you download is free from viruses or other
                  malicious code (such as worms or Trojan horses) that may
                  interfere with or damage the operations of your computer
                  systems.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">4.3.</strong> We may, from
                  time to time and without notice, change or add to the website
                  (including the user terms) or the information, products or
                  services described in it. However, we do not undertake to keep
                  the website updated. We are not liable to you or anyone else
                  if errors occur in the information on the website or if that
                  information is not up-to-date.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                5. Intellectual Property
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">5.1.</strong> All content
                  on the Site is the copyright of Vanir Merchants Incorporated
                  or used by Vanir Merchants Incorporated under licence. You
                  must not, without our express written permission:
                </p>
                <ul className="list-none ml-6 space-y-2">
                  <li>(a) replicate all or part of the site in any way; or</li>
                  <li>
                    (b) incorporate all or part of the Site in any other
                    webpage, site, application or other digital or non-digital
                    format.
                  </li>
                </ul>
                <p>
                  <strong className="text-[#1c1c1c]">5.2.</strong> Vanir
                  Merchants Incorporated has moral & registered rights in its
                  trademarks and you shall not copy, alter, use or otherwise
                  deal in the marks without our prior written consent.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">5.3.</strong> You agree
                  that by using the site you will not copy the Site or our
                  Services for your own commercial purposes. You agree and
                  warrant that you will not solicit our suppliers or the users
                  of the Site to join another competing site, or in any way to
                  stop using the Site in preference of using another site
                  offering comparable services. You indemnify us for any loss or
                  damage we suffer as a result of your breach of this warranty.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                6. Third Party Websites and Advertising
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">6.1.</strong> The Site may
                  contain information & advertising from third-party businesses,
                  people and websites (Third-Parties). You consent to receiving
                  this information as part of your use of the Site.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">6.2.</strong> We are not
                  responsible for any information transmitted by Third Parties
                  or liable for any reliance you make upon the information or
                  statements conveyed by Third Parties (or in relation to your
                  dealings with Third Parties), nor are we responsible for the
                  accuracy of any advertisements.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                7. Limitation of Liability
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">7.1.</strong> You agree
                  that you use the Site at your own risk.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">7.2.</strong> You agree to
                  indemnify us for any loss, damage, cost or expense that we may
                  suffer or incur as a result of or in connection with any
                  misuse or misconduct by you or any other user in connection
                  with the Site, including but not limited to any breach by you
                  of the user terms.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">7.3.</strong> Under no
                  circumstances will we be liable for any direct, incidental,
                  consequential or indirect damages, loss on account of
                  corruption of data, loss of profits, goodwill, bargain or
                  opportunity, loss of anticipated savings or any other similar
                  or analogous loss resulting from your access to, or use of, or
                  inability to use the Site or any content, whether based on
                  warranty, contract, tort, negligence, in equity or any other
                  legal theory, and whether or not we knew or should have known
                  of the possibility of such damage to business interruption of
                  any type, whether in tort, contract or otherwise.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">7.4.</strong> Vanir
                  Merchants Incorporated does not design or manufacture any of
                  the products listed on the Site and does not provide any
                  recommendation that a particular product is suitable for an
                  individual's circumstance. The person choosing the product is
                  responsible for their choice and we recommend seeking
                  professional advice. Vanir Merchants Incorporated takes no
                  responsibility for the choice of any product that may lead to
                  loss or injury, or fail to prevent harm being caused to any
                  person.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">7.5.</strong> Apart from
                  those that cannot be excluded under Canadian Consumer
                  Protection Law, we exclude all conditions and warranties that
                  may be implied by law and our liability for breach of any
                  implied warranty or condition that cannot be excluded is
                  restricted, at our option to:
                </p>
                <ul className="list-none ml-6 space-y-2">
                  <li>
                    (a) the re-supply of Services or payment of the cost of
                    re-supply of Services; or
                  </li>
                  <li>
                    (b) the replacement or repair of goods or payment of the
                    cost of replacement or repair.
                  </li>
                </ul>
                <p>
                  <strong className="text-[#1c1c1c]">7.6.</strong> You agree
                  that any taxation related to any transactions made via the
                  Site is the sole responsibility of the purchaser under that
                  transaction and that Vanir Merchants Incorporated accepts no
                  liability or responsibility for taxation matters in that
                  regard.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                8. Colours
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">8.1.</strong> Colours that
                  you see depend on the resolution of the image and your
                  computer display, so we cannot guarantee that your monitor
                  will display the colours accurately.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                9. Availability
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">9.1.</strong> We reserve
                  the right to limit order quantities of any product, including
                  after you have submitted an order or made a payment.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">9.2.</strong>{" "}
                  Representations of goods for sale on the Site do not
                  constitute an offer to sell but an invitation to treat. Such
                  representations do not warrant that the product or service is
                  available.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                10. Title and Delivery of Goods
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">10.1.</strong> The goods
                  remain our absolute property as a legal and equitable interest
                  until you have paid the full price.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">10.2.</strong> You agree to
                  take on the risk for the goods, such as loss or damage, when
                  the goods reach the delivery address.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">10.3.</strong> After taking
                  delivery of the goods, you agree to examine the goods and
                  notify us if there is any defect in the goods within 14 days
                  of the delivery date.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">10.4.</strong> If we
                  receive no notification from the customer within 14 days of
                  the delivery date, you agree that the goods will be taken as
                  delivered without defect.
                </p>
              </div>
            </div>

            {/* Section 11 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                11. Orders Placed from Outside Canada
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">11.1.</strong> We may be
                  restricted from distributing our products in certain countries
                  outside Canada.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">11.2.</strong> Where you
                  request us to deliver goods outside Canada and we are
                  permitted to do so, you agree to take responsibility for
                  ensuring that the goods can be legally imported into the
                  country of delivery.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">11.3.</strong> You agree to
                  pay any customs, duties or taxes with respect to the goods
                  that we send to the address outside of Canada. These costs
                  will be in addition to the purchase price that we quote on the
                  Site.
                </p>
              </div>
            </div>

            {/* Section 12 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                12. Returns Policy
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">12.1.</strong> For hygiene
                  reasons, no returns or exchanges will be accepted on any
                  product sold unsealed or on sealed products where the seal has
                  been broken, unless the product was faulty. For this reason,
                  it is strongly recommended that purchases on the website be
                  limited to products and shades that you have used in the past.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">12.2.</strong> We will
                  provide refunds as required under Canadian Consumer Protection
                  Law if the goods you purchased are:
                </p>
                <ul className="list-none ml-6 space-y-2">
                  <li>(a) not of merchantable quality;</li>
                  <li>(b) not fit for purpose; or</li>
                  <li>(c) do not match the sample made available to you.</li>
                </ul>
                <p>
                  <strong className="text-[#1c1c1c]">12.3.</strong> Should you
                  wish to seek a refund due to one of the reasons set out in
                  clause 12.1 above, you are required to return to us within 14
                  days:
                </p>
                <ul className="list-none ml-6 space-y-2">
                  <li>
                    (a) The goods you purchased from us, with all original
                    packaging reasonably intact;
                  </li>
                  <li>
                    (b) Proof of purchase, such as the original tax invoice and
                    transaction receipt;
                  </li>
                  <li>
                    (c) Means to identify you as the original purchaser; and
                  </li>
                  <li>
                    (d) Details of the fault or issue with the product, caused
                    by something other than you.
                  </li>
                </ul>
                <p>
                  <strong className="text-[#1c1c1c]">12.4.</strong> If you
                  return a product to us unopened, unused and in accordance with
                  the above conditions we will provide you with a credit voucher
                  redeemable for any new purchase of goods from us, or, where
                  the returned goods are determined by us to be faulty, a full
                  refund of the purchase price you paid, plus standard shipping
                  charges for the return of the faulty goods.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">12.5.</strong> Exclusions
                  may apply to returned products which do not meet certain
                  criteria, such as clearance stock, customised products, or
                  used items. To return damaged or faulty goods under this
                  policy, please contact our customer service manager via email
                  at{" "}
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
                <p>
                  <strong className="text-[#1c1c1c]">12.6.</strong> We reserve
                  our right to reject the claim for refund in respect of any
                  returned products which do not meet the above conditions, and
                  we may return the goods to you at your cost or dispose of the
                  product if you do not pay return postage or collect the
                  product from us within 30 days of being notified that your
                  claim for refund was rejected.
                </p>
              </div>
            </div>

            {/* Section 13 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                13. How we resolve Complaints and Disputes
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">13.1.</strong> If you have
                  a complaint in relation to our Services you should report it
                  to us immediately. We may or may not investigate your
                  complaint, depending on its nature.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">13.2.</strong> If you have
                  a dispute with us, another user or a product manufacturer in
                  connection with the Services, you must report the dispute to
                  us so that we may investigate and assist in the resolution of
                  the dispute (where possible).
                </p>
              </div>
            </div>

            {/* Section 14 */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                14. Privacy
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">14.1.</strong> You
                  acknowledge and accept the terms and conditions of our{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-[#ae1932] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">14.2.</strong> You agree
                  that you will not do anything that shall compromise Vanir
                  Merchants Incorporated's compliance with its Privacy Policy
                  nor do anything contrary to the Privacy Policy insofar as your
                  use of the Site is concerned.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">14.3.</strong> We may amend
                  the Privacy Policy from time-to-time.
                </p>
              </div>
            </div>

            {/* Section 15 */}
            <div className="mb-6">
              <h2 className="font-['Archivo'] text-[22px] font-semibold text-[#ae1932] mb-4">
                15. Other Important Information
              </h2>
              <div className="space-y-4 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <p>
                  <strong className="text-[#1c1c1c]">15.1.</strong> Vanir
                  Merchants Incorporated may end any agreement arising under
                  these user terms immediately for any reason by giving you
                  written notice. Where such agreement has been terminated you
                  must immediately cease using the Site.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.2.</strong> We will send
                  you notices and other correspondence to the details that you
                  submit to the Site, or that you notify us of from
                  time-to-time. It is your responsibility to notify us of any
                  updated contact details as they change.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.3.</strong> Email notice
                  from us to you is effective notice under these user terms.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.4.</strong> You
                  acknowledge that you have not relied on any representation,
                  warranty or statement made by any other party, other than as
                  set out in these user terms.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.5.</strong> No clause of
                  these user terms will be deemed waived and no breach excused
                  unless such waiver or consent is provided in writing.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.6.</strong> Any
                  agreement arising under these user terms will be governed by
                  the laws of the Province of British Columbia and the federal
                  laws of Canada applicable therein. You agree to submit to the
                  non-exclusive jurisdiction of the courts of British Columbia.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.7.</strong> Any clause
                  of these user terms, which is invalid or unenforceable, is
                  ineffective to the extent of the invalidity or
                  unenforceability without affecting the remaining clauses of
                  the user terms.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.8.</strong> Any
                  agreement arising from these user terms is part of an
                  ecommerce transaction and the parties agree that the agreement
                  shall be accepted electronically and the agreement formed &
                  validly entered into electronically in accordance with the
                  applicable electronic commerce legislation in Canada.
                </p>
                <p>
                  <strong className="text-[#1c1c1c]">15.9.</strong> The
                  termination of any agreement arising from these user terms
                  does not affect the parties' rights in respect of periods
                  before the termination of this agreement.
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="font-['Archivo'] text-[13px] text-[#5c666f] text-center">
                © Copyright Vanir Merchants Incorporated 2026. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
