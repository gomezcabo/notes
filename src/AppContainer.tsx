import { useState } from "react";
import { App } from "./App";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { useAudio } from "./hooks/useAudio";
import { useConfig } from "./hooks/useConfig";
import * as Tone from "tone";

export function AppContainer() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { isLoaded, playNotes, isIOSDevice } = useAudio();
  const { config } = useConfig();

  const handleStart = async () => {
    try {
      // Inicializar Tone.js solo si el sonido está habilitado
      if (config.soundEnabled) {
        await Tone.start();

        // Reproducir una escala completa Do-Re-Mi-Fa-Sol-La-Si-Do en fusas (muy rápido)
        if (isLoaded) {
          // Crear la escala completa
          const scaleNotes = [
            { name: "Sol", englishName: "G", key: "g/3" },
            { name: "Do", englishName: "C", key: "c/4" },
            { name: "Re", englishName: "D", key: "d/4" },
            { name: "Mi", englishName: "E", key: "e/4" },
            { name: "Sol", englishName: "G", key: "g/4" },
            { name: "Do", englishName: "C", key: "c/5" },
          ];

          // Reproducir la escala en modo "veryfast" (fusas) con efecto de pedal sostenuto
          playNotes(scaleNotes, "scale", "veryfast", true);

          // Esperar un momento antes de continuar solo si el sonido está habilitado
          // Aumentamos el tiempo de espera para permitir que se escuche el efecto del pedal
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }

      // Ocultar la pantalla de bienvenida
      setShowWelcome(false);
    } catch (error) {
      console.error("Error al iniciar la aplicación:", error);
      // Si hay un error, igualmente permitir continuar
      setShowWelcome(false);
    }
  };

  return (
    <>
      {showWelcome ? (
        <div className="h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-pink-400 to-teal-300">
          <WelcomeScreen onStart={handleStart} isIOSDevice={isIOSDevice && config.soundEnabled} />
        </div>
      ) : (
        <App />
      )}
    </>
  );
}
