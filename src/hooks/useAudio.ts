import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

type Note = {
  name: string;
  key: string;
  englishName?: string;
};

// Mapping of notes to MIDI frequencies
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

// Note duration types
type NoteDuration = "4n" | "8n" | "16n" | "32n" | "64n"; // quarter, eighth, sixteenth, thirty-second, sixty-fourth

export function useAudio() {
  const pianoRef = useRef<Tone.Sampler | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Detect if it's an iOS device
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !userAgent.includes("Windows Phone");
    setIsIOSDevice(isIOS);

    // Initialize the piano with realistic samples
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
        // Make sure Tone.js is initialized
        await Tone.start();

        // On iOS, we need to make sure the audio context is in "running" state
        if (isIOSDevice && Tone.context.state !== "running") {
          await Tone.context.resume();
        }

        // Determine the duration and spacing of notes based on type and speed
        let noteDuration: NoteDuration = "4n"; // Default, quarter notes
        let noteSpacing = 0.5; // Default, 0.5 seconds between notes

        if (noteType === "scale") {
          if (speed === "veryfast") {
            noteDuration = "64n"; // Sixty-fourth notes
            noteSpacing = 0.04; // Very fast
          } else if (speed === "fast") {
            noteDuration = "16n"; // Sixteenth notes
            noteSpacing = 0.12; // Fast
          } else {
            noteDuration = "8n"; // Eighth notes
            noteSpacing = 0.25; // Normal for scale
          }
        }

        // If using the sustain pedal, all notes are held until the end
        if (useSustainPedal && noteType === "scale") {
          const now = Tone.now();

          // Calculate the total duration of the scale
          const totalDuration = (notes.length - 1) * noteSpacing + 1; // +1 extra second for the last note

          // Play each note with attack in sequence but release at the end
          notes.forEach((note, index) => {
            const noteName = NOTE_TO_MIDI[note.key];
            if (noteName) {
              const attackTime = now + index * noteSpacing;
              // Only use triggerAttack to keep the note sounding
              pianoRef.current?.triggerAttack(noteName, attackTime);

              // Schedule the release of all notes at the end
              if (index === notes.length - 1) {
                // Release all notes after the scale ends
                setTimeout(() => {
                  pianoRef.current?.releaseAll();
                }, totalDuration * 1000);
              }
            }
          });
        } else {
          // Normal behavior: each note sounds and stops according to its duration
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
        console.error("Error playing notes:", error);
      }
    },
    [isLoaded, isIOSDevice]
  );

  return { playNotes, isLoaded, isIOSDevice };
}
