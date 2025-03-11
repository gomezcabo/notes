import { useCallback, useEffect, useRef } from "react";

type Note = {
  name: string;
  key: string;
  englishName?: string;
};

const NOTE_TO_FREQUENCY: { [key: string]: number } = {
  "c/2": 65.41,
  "d/2": 73.42,
  "e/2": 82.41,
  "f/2": 87.31,
  "g/2": 98.0,
  "a/2": 110.0,
  "b/2": 123.47,
  "c/3": 130.81,
  "d/3": 146.83,
  "e/3": 164.81,
  "f/3": 174.61,
  "g/3": 196.0,
  "a/3": 220.0,
  "b/3": 246.94,
  "c/4": 261.63,
  "d/4": 293.66,
  "e/4": 329.63,
  "f/4": 349.23,
  "g/4": 392.0,
  "a/4": 440.0,
  "b/4": 493.88,
  "c/5": 523.25,
  "d/5": 587.33,
  "e/5": 659.25,
  "f/5": 698.46,
  "g/5": 783.99,
  "a/5": 880.0,
  "b/5": 987.77,
  "c/6": 1046.5,
};

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    // Initialize AudioContext on first user interaction
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      document.removeEventListener("click", initAudioContext);
    };

    document.addEventListener("click", initAudioContext);
    return () => {
      document.removeEventListener("click", initAudioContext);
    };
  }, []);

  const playNotes = useCallback((notes: Note[], duration: number = 1000) => {
    if (!audioContextRef.current) return;

    // Stop any currently playing notes
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors from already stopped oscillators
      }
    });
    oscillatorsRef.current = [];

    // Play each note in sequence
    notes.forEach((note, index) => {
      const frequency = NOTE_TO_FREQUENCY[note.key];
      if (!frequency) return;

      setTimeout(() => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, audioContextRef.current!.currentTime);

        gainNode.gain.setValueAtTime(0.5, audioContextRef.current!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);

        oscillator.start();
        oscillatorsRef.current.push(oscillator);

        setTimeout(() => {
          oscillator.stop();
          oscillator.disconnect();
          gainNode.disconnect();
        }, 500);
      }, index * 600);
    });
  }, []);

  return { playNotes };
}
