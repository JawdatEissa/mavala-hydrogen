import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Face Concerns | Mavala Switzerland" },
    {
      name: "description",
      content:
        "Identify your face concerns and find the perfect skincare solution. Expert advice for wrinkles, radiance, complexion, and more.",
    },
  ];
};

// All 12 face concerns from https://mavala.com.au/mavacademy-b
const FACE_CONCERNS = [
  { id: 'wrinkles', label: 'WRINKLES?', image: '/face-concerns/wrinkles.jpg' },
  { id: 'lack-of-radiance', label: 'LACK OF RADIANCE?', image: '/face-concerns/lack-of-radiance.jpg' },
  { id: 'uneven-complexion', label: 'UNEVEN COMPLEXION?', image: '/face-concerns/uneven-complexion.jpg' },
  { id: 'dehydrated-skin', label: 'DEHYDRATED SKIN?', image: '/face-concerns/dehydrated-skin.jpg' },
  { id: 'dry-skin', label: 'DRY SKIN?', image: '/face-concerns/dry-skin.jpg' },
  { id: 'tired-dull-skin', label: 'TIRED, DULL SKIN?', image: '/face-concerns/tired-dull-skin.jpg' },
  { id: 'clogged-skin', label: 'CLOGGED SKIN?', image: '/face-concerns/clogged-skin.jpg' },
  { id: 'dilated-pores', label: 'DILATED PORES?', image: '/face-concerns/dilated-pores.jpg' },
  { id: 'clear-complexion', label: 'CLEAR COMPLEXION?', image: '/face-concerns/clear-complexion.jpg' },
  { id: 'dull-complexion', label: 'DULL COMPLEXION?', image: '/face-concerns/dull-complexion.jpg' },
  { id: 'blotchy-complexion', label: 'BLOTCHY COMPLEXION?', image: '/face-concerns/blotchy-complexion.jpg' },
  { id: 'complexion-with-irregularities', label: 'COMPLEXION WITH IRREGULARITIES?', image: '/face-concerns/complexion-with-irregularities.jpg' },
];

export default function FaceConcernsPage() {
  return (
    <div className="min-h-screen bg-white pt-[90px]">
      {/* Breadcrumb */}
      <div className="py-4 md:py-6 px-4 md:px-8">
        <div className="max-w-[1800px] mx-auto">
          <p className="font-['Archivo'] text-[10px] md:text-[11px] uppercase tracking-wider text-[#ae1932]">
            MAVACADEMY &gt; BEAUTY ADVICE &gt; FACE CONCERNS
          </p>
        </div>
      </div>

      {/* Main Title */}
      <div className="py-6 md:py-8 px-4 md:px-8">
        <div className="max-w-[1800px] mx-auto text-center">
          <h1 className="font-['Archivo'] text-[24px] md:text-[36px] font-bold text-[#ae1932] uppercase tracking-[1px]">
            FACE CONCERNS
          </h1>
        </div>
      </div>

      {/* Face Concerns Grid - Optimized for mobile centering */}
      <div className="py-8 md:py-12 px-4 md:px-8 pb-16 md:pb-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-10 justify-items-center max-w-fit">
              {FACE_CONCERNS.map((concern) => (
                <a
                  key={concern.id}
                  href={`/face-concern/${concern.id}`}
                  className="flex flex-col items-center group w-[100px] sm:w-[120px] md:w-[140px]"
                >
                  {/* Circular Image */}
                  <div className="w-full aspect-square mb-3 md:mb-4 overflow-hidden rounded-full">
                    <img
                      src={concern.image}
                      alt={concern.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Label */}
                  <p className="font-['Archivo'] text-[10px] md:text-[12px] font-semibold uppercase text-center text-[#1a1a2e] leading-tight group-hover:text-[#ae1932] transition-colors">
                    {concern.label}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

