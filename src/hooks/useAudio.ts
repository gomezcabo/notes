import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

type Note = {
  name: string;
  key: string;
  englishName?: string;
};

// Mapping de notas a frecuencias MIDI
const NOTE_TO_MIDI: { [key: string]: string } = {
  "c/2": "C2",
  "d/2": "D2",
  "e/2": "E2",
  "f/2": "F2",
  "g/2": "G2",
  "a/2": "A2",
  "b/2": "B2",
  "c/3": "C3",
  "d/3": "D3",
  "e/3": "E3",
  "f/3": "F3",
  "g/3": "G3",
  "a/3": "A3",
  "b/3": "B3",
  "c/4": "C4",
  "d/4": "D4",
  "e/4": "E4",
  "f/4": "F4",
  "g/4": "G4",
  "a/4": "A4",
  "b/4": "B4",
  "c/5": "C5",
  "d/5": "D5",
  "e/5": "E5",
  "f/5": "F5",
  "g/5": "G5",
  "a/5": "A5",
  "b/5": "B5",
  "c/6": "C6",
};

// Tipos de duración de notas
type NoteDuration = "4n" | "8n" | "16n" | "32n" | "64n"; // negra, corchea, semicorchea, fusa, semifusa

export function useAudio() {
  const pianoRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Detectar si es un dispositivo iOS
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !userAgent.includes("Windows Phone");
    setIsIOSDevice(isIOS);

    // Inicializar el piano con samples realistas
    pianoRef.current = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsLoaded(true);
      },
    }).toDestination();

    return () => {
      if (pianoRef.current) {
        pianoRef.current.dispose();
      }
    };
  }, []);

  const playNotes = useCallback(
    async (
      notes: Note[],
      noteType?: "scale" | "normal",
      speed?: "normal" | "fast" | "veryfast",
      useSustainPedal?: boolean
    ) => {
      if (!pianoRef.current || !isLoaded) return;

      try {
        // Asegurarse de que Tone.js está inicializado
        await Tone.start();

        // En iOS, necesitamos asegurarnos de que el contexto de audio esté en estado "running"
        if (isIOSDevice && Tone.context.state !== "running") {
          await Tone.context.resume();
        }

        // Determinar la duración y espaciado de las notas según el tipo y velocidad
        let noteDuration: NoteDuration = "4n"; // Por defecto, negras
        let noteSpacing = 0.5; // Por defecto, 0.5 segundos entre notas

        if (noteType === "scale") {
          if (speed === "veryfast") {
            noteDuration = "64n"; // Fusas
            noteSpacing = 0.04; // Muy rápido
          } else if (speed === "fast") {
            noteDuration = "16n"; // Semicorcheas
            noteSpacing = 0.12; // Rápido
          } else {
            noteDuration = "8n"; // Corcheas
            noteSpacing = 0.25; // Normal para escala
          }
        }

        // Si usamos el pedal sostenuto, todas las notas se mantienen hasta el final
        if (useSustainPedal && noteType === "scale") {
          const now = Tone.now();

          // Calcular el tiempo total de la escala
          const totalDuration = (notes.length - 1) * noteSpacing + 1; // +1 segundo extra para la última nota

          // Reproducir cada nota con ataque en secuencia pero liberación al final
          notes.forEach((note, index) => {
            const noteName = NOTE_TO_MIDI[note.key];
            if (noteName) {
              const attackTime = now + index * noteSpacing;
              // Solo usamos triggerAttack para mantener la nota sonando
              pianoRef.current?.triggerAttack(noteName, attackTime);

              // Programar la liberación de todas las notas al final
              if (index === notes.length - 1) {
                // Liberar todas las notas después de que termine la escala
                setTimeout(() => {
                  pianoRef.current?.releaseAll();
                }, totalDuration * 1000);
              }
            }
          });
        } else {
          // Comportamiento normal: cada nota suena y se apaga según su duración
          const now = Tone.now();
          notes.forEach((note, index) => {
            const noteName = NOTE_TO_MIDI[note.key];
            if (noteName) {
              const noteTime = now + index * noteSpacing;
              pianoRef.current?.triggerAttackRelease(noteName, noteDuration, noteTime);
            }
          });
        }
      } catch (error) {
        console.error("Error al reproducir las notas:", error);
      }
    },
    [isLoaded, isIOSDevice]
  );

  return { playNotes, isLoaded, isIOSDevice };
}
