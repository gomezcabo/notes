import { useState, useEffect } from "react";

type ClefType = "treble" | "bass";
type NotationType = "latin" | "english";
type GameMode = "practice" | "flashcards";

interface Config {
  clef: ClefType;
  notesCount: number;
  notation: NotationType;
  mode: GameMode;
}

const DEFAULT_CONFIG: Config = {
  clef: "treble",
  notesCount: 1,
  notation: "latin",
  mode: "practice",
};

export function useConfig() {
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem("notes-app-config");
    return savedConfig ? JSON.parse(savedConfig) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem("notes-app-config", JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<Config>) => {
    setConfig((current) => ({ ...current, ...updates }));
  };

  return {
    config,
    updateConfig,
  };
}
