export function MavalaCares() {
  return (
    <section className="bg-[#f6f3ef] py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h2 className="font-['Archivo'] text-[32px] md:text-[38px] font-medium text-[#ae1932] uppercase text-center tracking-[1px] mb-4">
          MAVALA CARES
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-600 text-[14px] md:text-[15px] mb-10 max-w-3xl mx-auto">
          We care about the planet. We aim to minimise our impact on the
          environment through the following measures:
        </p>

        {/* Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Ingredients Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-['Archivo'] text-[16px] font-semibold text-gray-800 mb-3">
              Ingredients
            </h3>
            <p className="text-gray-600 text-[13px] leading-relaxed">
              We source our ingredients and raw materials from the nearest
              suppliers in Switzerland to reduce our carbon footprint. We also
              increasingly use ingredients that are readily biodegradable. In
              particular, we do not use plastic microbeads nor
              cyclopentasiloxane (D5), which contribute to ocean pollution.
            </p>
          </div>

          {/* Packaging Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-['Archivo'] text-[16px] font-semibold text-gray-800 mb-3">
              Packaging
            </h3>
            <p className="text-gray-600 text-[13px] leading-relaxed">
              Whenever possible, we package our products without a box or
              cellophane and in recycled and recyclable materials (including
              plastic and glass) to reduce waste. We have also implemented
              clear labelling on product packaging to assist you in knowing
              which part of the packaging can be recycled and how.
            </p>
          </div>

          {/* Manufacturing Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-['Archivo'] text-[16px] font-semibold text-gray-800 mb-3">
              Manufacturing
            </h3>
            <p className="text-gray-600 text-[13px] leading-relaxed">
              Whenever possible, we manufacture under cold conditions to
              reduce energy consumption. We are also implementing strict waste
              separation and recycling processes in our production site and
              warehouses, including that of our Canadian distributor in
              Burnaby.
            </p>
          </div>
        </div>

        {/* Certification Images - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center aspect-square">
            <img
              src="/mavala-cares-images/Not tested on Animals.png"
              alt="Not tested on animals"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center aspect-square">
            <img
              src="/mavala-cares-images/Vegan.png"
              alt="Vegan"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center aspect-square">
            <img
              src="/mavala-cares-images/Natural Ingredients - White Background NON TRANSPARENT.png"
              alt="Natural Ingredients"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm flex items-center justify-center aspect-square">
            <img
              src="/mavala-cares-images/Mavala Cares FSC.png"
              alt="FSC Certified"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
