import { useState, useEffect, useRef } from "react";

interface Shade {
  name: string;
  image: string;
}

interface ColorMapping {
  color_groups?: Record<string, string[]>;
  shade_details?: Array<{
    name: string;
    image: string;
    color?: string;
    main_color?: string;
  }>;
}

interface ShadeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shades: Shade[];
  selectedShade: string | null;
  onSelectShade: (shadeName: string) => void;
  shadeColors: Record<string, { hex: string; rgb: number[] }>;
  getShadeImage: (shade: Shade) => string;
  availableMainColors: Array<{ name: string }>;
  productTitle: string;
  colorMapping: ColorMapping | null;
}

export function ShadeDrawer({
  isOpen,
  onClose,
  shades,
  selectedShade,
  onSelectShade,
  shadeColors,
  getShadeImage,
  availableMainColors,
  productTitle,
  colorMapping,
}: ShadeDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);
  const [animationStage, setAnimationStage] = useState<0 | 1 | 2>(0); // 0: closed, 1: first stage, 2: full open
  const shadeListRef = useRef<HTMLDivElement>(null);
  const selectedShadeRef = useRef<HTMLButtonElement>(null);

  // Two-stage animation effect - smooth open, fast close
  useEffect(() => {
    if (isOpen) {
      // Immediate start for snappy feel
      setAnimationStage(1);
      
      // Second stage - full expansion with smooth delay
      const expandTimer = setTimeout(() => {
        setAnimationStage(2);
      }, 250);
      
      return () => {
        clearTimeout(expandTimer);
      };
    } else {
      // Fast close - skip stage 1, go directly to 0
      setAnimationStage(0);
    }
  }, [isOpen]);

  // Sync color filter with selected shade when drawer opens
  useEffect(() => {
    if (isOpen && selectedShade && colorMapping?.shade_details) {
      // Find the main color of the selected shade
      const shadeDetail = Array.isArray(colorMapping.shade_details)
        ? colorMapping.shade_details.find((s) => s.name === selectedShade)
        : undefined;
      const mainColor = shadeDetail?.main_color || shadeDetail?.color;
      if (mainColor) {
        setSelectedColorFilter(mainColor);
      }
    }
  }, [isOpen, selectedShade, colorMapping]);

  // Auto-scroll to selected shade when drawer fully opens
  useEffect(() => {
    if (animationStage === 2 && selectedShade && selectedShadeRef.current && shadeListRef.current) {
      // Scroll the selected shade into view
      setTimeout(() => {
        selectedShadeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [animationStage, selectedShade]);

  // Handle header visibility and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      // Dispatch event to hide header
      window.dispatchEvent(new CustomEvent("shadeDrawerOpen"));
    } else {
      // Dispatch event to show header
      window.dispatchEvent(new CustomEvent("shadeDrawerClose"));
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Helper to get shade color
  const getShadeColor = (shadeName: string): string => {
    // Normalize the shade name for matching
    const normalizedName = shadeName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

    // Try exact match first
    if (shadeColors[shadeName]) {
      return shadeColors[shadeName].hex;
    }

    // Try normalized match
    for (const [key, value] of Object.entries(shadeColors)) {
      const normalizedKey = key
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .trim();
      if (normalizedKey === normalizedName) {
        return value.hex;
      }
    }

    return "#9e1b32"; // Default color
  };

  // Get shades for a specific color from the color mapping
  const getShadesForColor = (colorName: string): string[] => {
    if (!colorMapping?.color_groups) return [];
    return colorMapping.color_groups[colorName] || [];
  };

  // Filter shades based on search and color filter
  const filteredShades = shades.filter((shade) => {
    // Search filter
    const matchesSearch = shade.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    // Color filter
    let matchesColor = true;
    if (selectedColorFilter && colorMapping?.color_groups) {
      const shadesInColor = getShadesForColor(selectedColorFilter);
      matchesColor = shadesInColor.includes(shade.name);
    }
    
    return matchesSearch && matchesColor;
  });

  // Get the currently selected shade for preview
  const previewShade = selectedShade
    ? shades.find((s) => s.name === selectedShade)
    : filteredShades[0];

  if (!isOpen && animationStage === 0) return null;

  return (
    <>
      {/* Backdrop - fades in smoothly, fades out quickly */}
      <div
        className={`fixed inset-0 z-40 ${
          animationStage >= 1 
            ? "bg-black/40 backdrop-blur-[2px]" 
            : "bg-transparent pointer-events-none"
        }`}
        style={{
          transition: animationStage >= 1 
            ? "background-color 0.35s ease-out, backdrop-filter 0.35s ease-out" 
            : "background-color 0.15s ease-in, backdrop-filter 0.15s ease-in",
        }}
        onClick={onClose}
      />

      {/* Drawer Panel - Smooth open, fast close */}
      <div
        className="fixed top-0 right-0 h-full bg-white z-50 shadow-2xl flex flex-col"
        style={{
          transform: animationStage === 0 ? "translateX(100%)" : "translateX(0)",
          width: animationStage === 0 ? "0px" : animationStage === 1 ? "320px" : "min(900px, 100%)",
          transition: animationStage >= 1 
            ? "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), width 0.35s cubic-bezier(0.32, 0.72, 0, 1)"
            : "transform 0.2s ease-in, width 0.15s ease-in",
        }}
      >
        {/* Header with Search */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div 
            className="flex items-center gap-3 flex-1 overflow-hidden"
            style={{
              opacity: animationStage === 2 ? 1 : 0,
              maxWidth: animationStage === 2 ? "100%" : "0px",
              transition: animationStage >= 1 
                ? "opacity 0.25s ease-out 0.1s, max-width 0.25s ease-out"
                : "opacity 0.1s ease-in, max-width 0.1s ease-in",
            }}
          >
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 font-['Archivo'] text-base outline-none placeholder-gray-400 min-w-0"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-auto"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Color Filter Tabs - Only shows in stage 2 */}
        <div 
          className="px-6 border-b border-gray-200 overflow-hidden"
          style={{
            maxHeight: animationStage === 2 ? "150px" : "0px",
            opacity: animationStage === 2 ? 1 : 0,
            paddingTop: animationStage === 2 ? "1rem" : "0",
            paddingBottom: animationStage === 2 ? "1rem" : "0",
            transition: animationStage >= 1 
              ? "max-height 0.25s cubic-bezier(0.32, 0.72, 0, 1) 0.05s, opacity 0.2s ease-out 0.1s, padding 0.2s ease-out"
              : "max-height 0.1s ease-in, opacity 0.1s ease-in, padding 0.1s ease-in",
          }}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              onClick={() => setSelectedColorFilter(null)}
              className={`font-['Archivo'] text-sm whitespace-nowrap pb-1 border-b-2 transition-colors ${
                selectedColorFilter === null
                  ? "border-gray-800 text-gray-800"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              See all
            </button>
            {availableMainColors.map((color) => {
              // Color mapping for all possible colors
              const getColorClass = (name: string) => {
                const colorMap: Record<string, string> = {
                  Pink: "bg-pink-400",
                  Red: "bg-red-600",
                  Nude: "bg-amber-200",
                  Orange: "bg-orange-500",
                  Purple: "bg-purple-500",
                  Brown: "bg-amber-800",
                  Blue: "bg-blue-500",
                  Green: "bg-green-600",
                  White: "bg-white border border-gray-300",
                  Transparent: "bg-transparent border border-gray-300",
                  Gray: "bg-gray-500",
                  Grey: "bg-gray-500",
                  Black: "bg-black",
                  Yellow: "bg-yellow-400",
                  Gold: "bg-yellow-500",
                  Golden: "bg-yellow-500",
                  Silver: "bg-gray-300",
                };
                return colorMap[name] || "bg-gray-400";
              };

              return (
                <button
                  key={color.name}
                  onClick={() =>
                    setSelectedColorFilter(
                      selectedColorFilter === color.name ? null : color.name
                    )
                  }
                  className={`flex items-center gap-2 font-['Archivo'] text-sm whitespace-nowrap pb-1 border-b-2 transition-colors ${
                    selectedColorFilter === color.name
                      ? "border-gray-800 text-gray-800"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${getColorClass(color.name)}`}
                  />
                  {color.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Image - Left Side - Only shows in stage 2 */}
          <div 
            className="flex items-center justify-center bg-[#f5f5f5] overflow-hidden"
            style={{
              flex: animationStage === 2 ? "1 1 60%" : "0",
              minWidth: animationStage === 2 ? "200px" : "0",
              padding: animationStage === 2 ? "1rem" : "0",
              opacity: animationStage === 2 ? 1 : 0,
              transition: animationStage >= 1 
                ? "flex 0.3s cubic-bezier(0.32, 0.72, 0, 1), min-width 0.25s ease-out, padding 0.25s ease-out, opacity 0.25s ease-out 0.05s"
                : "flex 0.1s ease-in, min-width 0.1s ease-in, padding 0.1s ease-in, opacity 0.1s ease-in",
            }}
          >
            {previewShade && getShadeImage(previewShade) && (
              <img
                src={getShadeImage(previewShade)}
                alt={previewShade.name}
                className="w-full h-full object-contain"
                style={{
                  maxHeight: "100%",
                  transform: animationStage === 2 ? "scale(1)" : "scale(0.9)",
                  opacity: animationStage === 2 ? 1 : 0,
                  transition: animationStage >= 1 
                    ? "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1) 0.1s, opacity 0.25s ease-out 0.15s"
                    : "transform 0.1s ease-in, opacity 0.1s ease-in",
                }}
              />
            )}
          </div>

          {/* Shade List - Right Side - Shows in both stages */}
          <div 
            ref={shadeListRef}
            className="border-l border-gray-200 overflow-y-auto flex-shrink-0"
            style={{
              width: animationStage >= 1 ? "min(280px, 55%)" : "0px",
              opacity: animationStage >= 1 ? 1 : 0,
              transition: animationStage >= 1 
                ? "width 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease-out"
                : "width 0.15s ease-in, opacity 0.1s ease-in",
            }}
          >
            <div className="py-4">
              {filteredShades.map((shade, index) => (
                <button
                  key={shade.name}
                  ref={selectedShade === shade.name ? selectedShadeRef : null}
                  onClick={() => {
                    onSelectShade(shade.name);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-3 hover:bg-gray-50 ${
                    selectedShade === shade.name ? "bg-gray-100" : ""
                  }`}
                  style={{
                    // Staggered animation for list items - smooth open, instant close
                    opacity: animationStage >= 1 ? 1 : 0,
                    transform: animationStage >= 1 ? "translateX(0)" : "translateX(16px)",
                    transition: animationStage >= 1 
                      ? `opacity 0.2s ease-out ${Math.min(index * 20, 200) + 50}ms, transform 0.25s cubic-bezier(0.32, 0.72, 0, 1) ${Math.min(index * 20, 200) + 50}ms`
                      : "opacity 0.1s ease-in, transform 0.1s ease-in",
                  }}
                >
                  {/* Color Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 ${
                      selectedShade === shade.name
                        ? "ring-2 ring-offset-2 ring-[#9e1b32]"
                        : ""
                    }`}
                    style={{ 
                      backgroundColor: getShadeColor(shade.name),
                      transform: selectedShade === shade.name ? "scale(1.1)" : "scale(1)",
                      transition: "transform 0.2s ease-out",
                    }}
                  />
                  {/* Shade Name */}
                  <span
                    className={`font-['Archivo'] text-sm text-left whitespace-nowrap ${
                      selectedShade === shade.name
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {shade.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

