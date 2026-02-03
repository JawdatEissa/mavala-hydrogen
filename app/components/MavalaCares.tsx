export function MavalaCares() {
  return (
    <section className="bg-[#f6f3ef] py-10 md:py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="font-['Archivo'] text-[32px] md:text-[38px] font-medium text-[#ae1932] uppercase text-center tracking-[1px] mb-3">
          MAVALA CARES
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-600 text-[14px] md:text-[15px] mb-6 md:mb-8 max-w-3xl mx-auto">
          We care about the planet. We aim to minimise our impact on the
          environment through the following measures:
        </p>

        {/* Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-14 md:mb-18 max-w-[95%] mx-auto">
          {/* Ingredients Card */}
          <div className="bg-white rounded-lg px-5 md:px-6 py-6 md:py-7 shadow-sm">
            <h3 className="font-['Archivo'] text-[17px] md:text-[18px] font-semibold text-gray-800 mb-2">
              Ingredients
            </h3>
            <p className="text-gray-600 text-[13px] md:text-[14px] leading-relaxed">
              We source our ingredients and raw materials from the nearest
              suppliers in Switzerland to reduce our carbon footprint. We also
              increasingly use ingredients that are readily biodegradable. In
              particular, we do not use plastic microbeads nor
              cyclopentasiloxane (D5), which contribute to ocean pollution.
            </p>
          </div>

          {/* Packaging Card */}
          <div className="bg-white rounded-lg px-5 md:px-6 py-6 md:py-7 shadow-sm">
            <h3 className="font-['Archivo'] text-[17px] md:text-[18px] font-semibold text-gray-800 mb-2">
              Packaging
            </h3>
            <p className="text-gray-600 text-[13px] md:text-[14px] leading-relaxed">
              Whenever possible, we package our products without a box or
              cellophane and in recycled and recyclable materials (including
              plastic and glass) to reduce waste. We have also implemented clear
              labelling on product packaging to assist you in knowing which part
              of the packaging can be recycled and how.
            </p>
          </div>

          {/* Manufacturing Card */}
          <div className="bg-white rounded-lg px-5 md:px-6 py-6 md:py-7 shadow-sm">
            <h3 className="font-['Archivo'] text-[17px] md:text-[18px] font-semibold text-gray-800 mb-2">
              Manufacturing
            </h3>
            <p className="text-gray-600 text-[13px] md:text-[14px] leading-relaxed">
              Whenever possible, we manufacture under cold conditions to reduce
              energy consumption. We are also implementing strict waste
              separation and recycling processes in our production site and
              warehouses, including that of our Canadian distributor in Burnaby.
            </p>
          </div>
        </div>

        {/* Certification Images - Horizontal row */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16 mt-4">
          <img
            src="/mavala-cares-images/Not tested on Animals.png"
            alt="Not tested on animals"
            className="h-[80px] md:h-[100px] lg:h-[120px] w-auto object-contain mix-blend-multiply"
          />
          <img
            src="/mavala-cares-images/Vegan.png"
            alt="Vegan"
            className="h-[80px] md:h-[100px] lg:h-[120px] w-auto object-contain mix-blend-multiply"
          />
          <img
            src="/mavala-cares-images/Natural Ingredients - White Background NON TRANSPARENT.png"
            alt="Natural Ingredients"
            className="h-[80px] md:h-[100px] lg:h-[120px] w-auto object-contain mix-blend-multiply"
          />
          <img
            src="/mavala-cares-images/Mavala Cares FSC.png"
            alt="FSC Certified"
            className="h-[80px] md:h-[100px] lg:h-[120px] w-auto object-contain mix-blend-multiply"
          />
        </div>
      </div>
    </section>
  );
}
