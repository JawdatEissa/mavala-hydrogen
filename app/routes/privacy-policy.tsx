import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | Mavala Canada" },
    {
      name: "description",
      content:
        "This policy sets out how MAVALA Canada handles all personal information.",
    },
  ];
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-[90px]">
      {/* Header */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-['Archivo'] text-[36px] md:text-[42px] font-semibold text-[#ae1932] uppercase tracking-[2px] leading-tight">
            Privacy Policy
          </h1>
          <p className="font-['Archivo'] text-[16px] md:text-[17px] text-[#5c666f] mt-6 leading-[1.7]">
            This policy sets out how MAVALA Canada handles all personal
            information.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12 bg-[#f6f3ef]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm">
            {/* Introduction */}
            <div className="mb-10">
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                When we say 'we', 'us' or 'MAVALA Canada', we are referring to
                Vanir Merchants Incorporated as the operator of www.mavala.ca
                (our 'Site'), under licence from MAVALA SA. By 'policy' we're
                talking about this privacy policy. If we say 'user terms' we are
                referring to the rules for using our Site. Take the time to read
                this policy because it forms a part of the user terms for our
                Site. By accessing or using any of the services on our Site, you
                accept the application of this policy. If you do not agree to
                this policy we won't take it personally, but please do not use
                our Site.
              </p>
            </div>

            {/* What type of personal information */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                What type of personal information do we collect?
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                We collect certain personal information about visitors and users
                of our Site. The most common types of information we collect are
                things like: user names, member names, email addresses, other
                contact details, payment information such as payment agent
                details, transactional details, support queries, forum comments
                and web analytics data. We may also collect personal information
                from job applications and this information may be used to assess
                an applicant's suitability for employment. Information or an
                opinion is your "personal information" if it is about you as an
                identified or identifiable individual.
              </p>
            </div>

            {/* How we collect */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                How we collect personal information
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                We may collect personal information directly when you provide it
                to us, automatically as you navigate through the Site or through
                other people when you use services associated with the Site.
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                When you provide personal information to us via the Site you're
                consenting to us collecting and using that information in line
                with this policy and the user terms of each of the Site. You are
                likely to provide personal information when you complete
                membership registration and buy or provide items or services on
                our Site, subscribe to a newsletter, email list, submit
                feedback, enter a contest, fill out a survey, or send us a
                communication.
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                If you choose not to provide personal information, we may not be
                able to provide you with our services and you may not be able to
                carry out transactions or access the full range of features
                available through our Site.
              </p>
            </div>

            {/* Personal information from others */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                Personal information we collect about you from others
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Although we generally collect personal information directly from
                you, we may on occasion also collect information about you from
                other people (such as the payment provider account details
                required to process a transaction) and by using tracking
                technologies such as cookies, web beacons and other web
                analytics software or services.
              </p>
            </div>

            {/* How do we use */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                How do we use personal information?
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                We may use your personal information in order for us to:
              </p>
              <ul className="space-y-3 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    operate the Site and provide you with services described on
                    the Site, like to verify your identity when you sign in to
                    our Site, to facilitate and process transactions that take
                    place on the Site, to respond to support requests and to
                    help facilitate the resolution of any disputes
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    customise our services and websites, like advertising that
                    may appear on the Site, in order to provide a more
                    personalised experience
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    update you with operational news and information about our
                    Site and services like to notify you about changes to our
                    Site, website disruptions or security updates
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    provide you with information that you request from us or,
                    where we have your consent to do so, provide you with
                    marketing information about products and services which we
                    feel may interest you
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    carry out technical analysis to determine how to improve the
                    Site and services we provide
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    monitor activity on the Site, like to identify potential
                    fraudulent activity and to ensure compliance with the user
                    terms that apply to the Site
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    manage our relationship with you, like by responding to your
                    comments or queries submitted to us on the Site or asking
                    for your feedback or whether you want to participate in a
                    survey
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>manage our legal and operational affairs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    train our staff about how to best serve our community
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    provide general administrative and performance functions and
                    activities.
                  </span>
                </li>
              </ul>
            </div>

            {/* When may we disclose */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                When may we disclose your personal information?
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                We may disclose personal information to people like:
              </p>
              <ul className="space-y-3 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>other companies within our group of companies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    subcontractors and service providers who assist us in
                    connection with the ways we may use personal information (as
                    set out above)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    our professional advisers (lawyers, accountants, financial
                    advisers etc)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    regulators and government authorities in connection with our
                    compliance procedures and obligations
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    a purchaser or prospective purchaser of all or part of our
                    assets or our business, and their professional advisers, in
                    connection with the purchase
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    other people where we are authorised or required by law to
                    do so.
                  </span>
                </li>
              </ul>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                We use a network of global subcontractors and service providers
                in order to ensure that we maintain the best possible service
                standards. Some of the subcontractors and service providers to
                whom we may disclose your personal information, like service
                providers who provide us with cloud storage solutions, are based
                outside Canada (in places like Europe, Asia and the US). In
                order to protect your information, we take care where possible
                to work with subcontractors and service providers who we believe
                maintain an acceptable standard of data security compliance.
              </p>
            </div>

            {/* How do we store */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                How do we store your personal information?
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                We store personal information on secure servers that are managed
                by us and our service providers, and occasionally hard copy
                files that are kept in a secure location. Personal information
                that we store is subject to security and access controls,
                including username and password authentication and data
                encryption where appropriate.
              </p>
            </div>

            {/* How can you access */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                How can you access your personal information?
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                You can access some of the information that we collect about you
                by logging in to your account. You also have the right to make a
                request to access other information we hold about you and to
                request corrections of any errors in that information. You may
                also close the account you have for our site at any time. To
                make an access or correction request, contact our privacy
                manager using the contact details at the end of this policy.
              </p>
            </div>

            {/* Choices regarding control */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                Choices regarding control of your personal information
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                Where we have your consent to do so (e.g. if you have subscribed
                to one of our e-mail lists or have otherwise indicated that you
                are interested in receiving offers or information from us), we
                may send you marketing communications about products and
                services that we feel may be of interest to you. You can
                'opt-out' of such communications if you would prefer not to
                receive them in the future.
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                If your e-mail address has changed and you would like to
                continue to receive our e-mails, you will need to access your
                account and update your e-mail address information in your
                account and sign-up again for those e-mails that you want to
                receive.
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                If we send e-mails with commercial content we will generally
                include an "unsubscribe" facility that you can use to opt-out of
                further communications – to opt-out, just follow the
                instructions in the e-mail. We might not include an opt-out
                facility in important operational and service-based e-mails
                concerning things like your purchases, the user terms, important
                updates and need-to-know messages. By using our Site you agree
                that we do not need to include opt-out facilities in those
                messages.
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                You also have choices about cookies, as described below. By
                modifying your browser preferences, you have the choice to
                accept all cookies, to be notified when a cookie is set, or to
                reject all cookies. If you choose to reject cookies some parts
                of our Site may not work properly in your case.
              </p>
            </div>

            {/* Cookies and web analytics */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                Cookies and web analytics
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                Cookies are used to enhance your use of the Site, such as
                remembering that you are logged in. You are able to minimise or
                block cookies using the privacy settings in your internet
                browser, but this may restrict your use of the Site. For general
                information on cookies, see{" "}
                <a
                  href="http://www.allaboutcookies.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ae1932] hover:underline"
                >
                  www.allaboutcookies.org
                </a>
                .
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                When you visit our Site, there's certain information that's
                recorded which is generally anonymous information and may not
                reveal your actual identity. This collection of information is
                typically known as 'web analytics information', and we only use
                this information for statistical and website development
                purposes and to improve our services to you. If you create an
                account with us, some of this information could be associated
                with your account. By this, we may mean the following kinds of
                details:
              </p>
              <ul className="space-y-2 font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>your IP or proxy server IP</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>basic domain information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    your Internet service provider is sometimes captured
                    depending on the configuration of your ISP connection
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>the date and time of your visit to the website</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>the length of your session</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>the pages which you have accessed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>
                    the number of times you access our site within any month
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>the size of file you look at</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>the website which referred you to our Site</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#ae1932] mr-2">•</span>
                  <span>the operating system which your computer uses</span>
                </li>
              </ul>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Occasionally, we may use third party advertising companies to
                serve ads based on prior visits to our Site. These advertising
                companies use cookies to anonymously collect data. No personally
                identifiable information is collected by these cookies. The
                anonymous data they collect is kept separate from the personal
                information about you as a user. You can opt out of third party
                advertising cookies at any time by visiting{" "}
                <a
                  href="http://www.networkadvertising.org/managing/opt_out.asp"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ae1932] hover:underline"
                >
                  www.networkadvertising.org/managing/opt_out.asp
                </a>
                .
              </p>
            </div>

            {/* Information about children */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                Information about children
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                Our Site is not suitable for children under the age of 15 years,
                so if you are under 15 we ask that you do not use our Site or
                give us your personal information. If you are from 15 to 18
                years, you can browse the Site but will need the supervision of
                a parent or guardian to become a registered user. It is the
                responsibility of parents or guardians to monitor their
                children's use of our Site.
              </p>
            </div>

            {/* Information you make public */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                Information you make public or give to others
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                If you make your personal information available to other people,
                we can't control or accept responsibility for the way they will
                use or manage that information. There are lots of ways that you
                may find yourself providing information to other people, like
                when you post a public message on a forum thread, share
                information via social media, or make contact with another user
                via our Site. Before making your information publicly available
                or giving your information to anyone else, think carefully. If
                giving information to another user via our Site, ask them how
                they will handle your information. If you're sharing information
                via another website, check the privacy policy for that site to
                understand its information management practices as this privacy
                policy will not apply.
              </p>
            </div>

            {/* When we need to update */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                When we need to update this policy
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                We may need to change this policy from time to time in order to
                make sure it stays up to date with the latest legal requirements
                and any changes to our privacy management practices. When we do
                amend the policy, the changes will be effective straightaway.
                We'll usually publish information about changes to be made to
                this policy on our Site – but please be aware that it is your
                responsibility to check in and make sure you keep up to date
                with any changes to this policy.
              </p>
            </div>

            {/* How can you contact us */}
            <div className="mb-10">
              <h2 className="font-['Archivo'] text-[20px] font-semibold text-[#ae1932] mb-4">
                How can you contact us?
              </h2>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7] mb-4">
                If you have any questions about our privacy practices, please
                contact us in writing at Vanir Merchants Privacy Manager, 7802
                Express St, Burnaby BC, V5A 1T4, Canada or{" "}
                <a
                  href="mailto:info@mavala.ca"
                  className="text-[#ae1932] hover:underline"
                >
                  info@mavala.ca
                </a>
                .
              </p>
              <p className="font-['Archivo'] text-[15px] text-[#5c666f] leading-[1.7]">
                If you have any concerns about how we have been managing your
                personal information, or if you think we have not been complying
                with Canadian privacy law, you can make a complaint in writing
                to our privacy champion. We will consider your complaint and
                contact you to resolve the matter. For more information about
                privacy issues in Canada and protecting your privacy, please
                visit the Office of the Privacy Commissioner of Canada's website
                at{" "}
                <a
                  href="https://www.priv.gc.ca"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ae1932] hover:underline"
                >
                  www.priv.gc.ca
                </a>
                .
              </p>
            </div>

            {/* Copyright */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="font-['Archivo'] text-[13px] text-[#5c666f] text-center">
                Copyright 2026 Vanir Merchants Incorporated. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
