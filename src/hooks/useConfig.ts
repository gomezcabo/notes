import { useState, useEffect } from "react";

type ClefType = "treble" | "bass";

interface Config {
  clef: ClefType;
  notesCount: number;
}

const DEFAULT_CONFIG: Config = {
  clef: "treble",
  notesCount: 1,
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
