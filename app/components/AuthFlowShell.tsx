import { Link } from "@remix-run/react";

export type AuthFlowLanguage = "en" | "fr";

export function AuthFlowShell({
  children,
  imageSrc,
  imageAlt = "",
  language,
  onToggleLanguage,
}: {
  children: React.ReactNode;
  imageSrc: string;
  imageAlt?: string;
  language: AuthFlowLanguage;
  onToggleLanguage: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[99999] bg-white overflow-auto">
      <div className="fixed top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 z-[100000] flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-1 md:gap-2 px-3 py-2 md:px-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-600 hover:text-[#AE1932] hover:border-[#AE1932] transition-colors duration-200 shadow-md"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-['Archivo'] text-sm font-medium hidden sm:inline">
            {language === "en" ? "Back" : "Retour"}
          </span>
        </Link>

        <button
          type="button"
          onClick={onToggleLanguage}
          className="px-3 py-2 md:px-4 bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-600 font-['Archivo'] text-sm font-semibold uppercase tracking-wider rounded-lg hover:border-[#AE1932] hover:text-[#AE1932] transition-colors duration-200 shadow-md"
        >
          {language === "en" ? "FR" : "EN"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen">
        <div className="md:hidden w-full h-[28vh] relative bg-gray-100 shrink-0">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
        </div>

        <div className="w-full md:w-[40%] bg-white flex flex-col justify-start md:justify-center px-5 md:px-12 py-8 md:py-20 relative pt-4 md:pt-20">
          {children}
        </div>

        <div className="hidden md:block md:w-[60%] relative bg-gray-100 md:min-h-screen">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
