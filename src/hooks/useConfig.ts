import { useState, useEffect } from "react";

type ClefType = "treble" | "bass";
type NotationType = "latin" | "english";
type GameMode = "practice" | "flashcards";

interface Config {
  clef: ClefType;
  notesCount: number;
  notation: NotationType;
  mode: GameMode;
  soundEnabled: boolean;
}

const DEFAULT_CONFIG: Config = {
  clef: "treble",
  notesCount: 1,
  notation: "latin",
  mode: "practice",
  soundEnabled: true,
};

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem("musicNotesConfig");
    if (savedConfig) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      } catch (error) {
        console.error("Error parsing saved config:", error);
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem("musicNotesConfig", JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<Config>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return { config, updateConfig };
}
