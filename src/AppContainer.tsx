import { useState } from "react";
import { App } from "./App";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { useAudio } from "./hooks/useAudio";
import { useConfig } from "./hooks/useConfig";
import * as Tone from "tone";

export function AppContainer() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { isLoaded, playNotes } = useAudio();
  const { config } = useConfig();

  const handleStart = async () => {
    try {
      // Initialize Tone.js only if sound is enabled
      if (config.soundEnabled) {
        await Tone.start();

        // Play a complete scale Do-Re-Mi-Fa-Sol-La-Si-Do in very fast tempo
        if (isLoaded) {
          // Create the complete scale
          const scaleNotes = [
            { name: "Sol", englishName: "G", key: "g/3" },
            { name: "Do", englishName: "C", key: "c/4" },
            { name: "Re", englishName: "D", key: "d/4" },
            { name: "Mi", englishName: "E", key: "e/4" },
            { name: "Sol", englishName: "G", key: "g/4" },
            { name: "Do", englishName: "C", key: "c/5" },
          ];

          // Play the scale in "veryfast" mode with sustain pedal effect
          playNotes(scaleNotes, "scale", "veryfast", true);

          // Wait a moment before continuing only if sound is enabled
          // Increased wait time to allow the pedal effect to be heard
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      // Hide the welcome screen
      setShowWelcome(false);
    } catch (error) {
      console.error("Error starting the application:", error);
      // If there's an error, still allow continuing
      setShowWelcome(false);
    }
  };

  return (
    <>
      {showWelcome ? (
        <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-pink-400 to-teal-300">
          <WelcomeScreen onStart={handleStart} />
        </div>
      ) : (
        <App />
      )}
    </>
  );
}
