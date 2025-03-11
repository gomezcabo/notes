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

export function useAudio() {
  const pianoRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
    async (notes: Note[]) => {
      if (!pianoRef.current || !isLoaded) return;

      try {
        // Asegurarse de que Tone.js está inicializado
        await Tone.start();

        // Reproducir cada nota en secuencia
        const now = Tone.now();
        notes.forEach((note, index) => {
          const noteName = NOTE_TO_MIDI[note.key];
          if (noteName) {
            const noteTime = now + index * 0.5; // 0.5 segundos entre notas
            pianoRef.current?.triggerAttackRelease(noteName, "4n", noteTime);
          }
        });
      } catch (error) {
        console.error("Error al reproducir las notas:", error);
      }
    },
    [isLoaded]
  );

  return { playNotes, isLoaded };
}
