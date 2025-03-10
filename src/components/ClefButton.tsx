import { useEffect, useRef, useState } from "react";
import { ClefType } from "../models/clef-type";

export const ClefButton = ({
  currentClef,
  handleClefChange,
}: {
  currentClef: ClefType;
  handleClefChange: (clef: ClefType) => void;
}) => {
  const [showClefMenu, setShowClefMenu] = useState(false);
  const clefMenuRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clefMenuRef.current && !clefMenuRef.current.contains(event.target as Node)) {
        setShowClefMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    showClefMenu && (
      <div ref={clefMenuRef} className="absolute right-[-4px] top-[-4px] w-48 bg-white rounded-lg shadow-lg py-2 z-20">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
          Seleccionar clave
        </div>
        <button
          onClick={() => handleClefChange("treble")}
          className={`w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer ${
            currentClef === "treble" ? "bg-cyan-100 text-cyan-800 font-medium" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="mr-2 w-4">{currentClef === "treble" ? "✓" : ""}</span>
          Clave de Sol
        </button>
        <button
          onClick={() => handleClefChange("bass")}
          className={`w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer ${
            currentClef === "bass" ? "bg-cyan-100 text-cyan-800 font-medium" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="mr-2 w-4">{currentClef === "bass" ? "✓" : ""}</span>
          Clave de Fa
        </button>
      </div>
    )
  );
};
