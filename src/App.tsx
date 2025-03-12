import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Vex } from "vexflow";

import { clsx } from "clsx";
import { GearsIcon } from "./components/gears-icon";
import { useConfig } from "./hooks/useConfig";
import { CloseIcon } from "./components/close-icon";
import { useAudio } from "./hooks/useAudio";

type Note = {
  name: string;
  key: string;
  englishName?: string;
};

type ClefType = "treble" | "bass";
type NotationType = "latin" | "english";
type GameMode = "practice" | "flashcards";

const TREBLE_NOTES: Note[] = [
  { name: "La", englishName: "A", key: "a/3" },
  { name: "Si", englishName: "B", key: "b/3" },
  { name: "Do", englishName: "C", key: "c/4" },
  { name: "Re", englishName: "D", key: "d/4" },
  { name: "Mi", englishName: "E", key: "e/4" },
  { name: "Fa", englishName: "F", key: "f/4" },
  { name: "Sol", englishName: "G", key: "g/4" },
  { name: "La", englishName: "A", key: "a/4" },
  { name: "Si", englishName: "B", key: "b/4" },
  { name: "Do", englishName: "C", key: "c/5" },
  { name: "Re", englishName: "D", key: "d/5" },
  { name: "Mi", englishName: "E", key: "e/5" },
  { name: "Fa", englishName: "F", key: "f/5" },
  { name: "Sol", englishName: "G", key: "g/5" },
  { name: "La", englishName: "A", key: "a/5" },
  { name: "Si", englishName: "B", key: "b/5" },
  { name: "Do", englishName: "C", key: "c/6" },
];

const BASS_NOTES: Note[] = [
  { name: "Do", englishName: "C", key: "c/2" },
  { name: "Re", englishName: "D", key: "d/2" },
  { name: "Mi", englishName: "E", key: "e/2" },
  { name: "Fa", englishName: "F", key: "f/2" },
  { name: "Sol", englishName: "G", key: "g/2" },
  { name: "La", englishName: "A", key: "a/2" },
  { name: "Si", englishName: "B", key: "b/2" },
  { name: "Do", englishName: "C", key: "c/3" },
  { name: "Re", englishName: "D", key: "d/3" },
  { name: "Mi", englishName: "E", key: "e/3" },
  { name: "Fa", englishName: "F", key: "f/3" },
  { name: "Sol", englishName: "G", key: "g/3" },
  { name: "La", englishName: "A", key: "a/3" },
  { name: "Si", englishName: "B", key: "b/3" },
  { name: "Do", englishName: "C", key: "c/4" },
  { name: "Re", englishName: "D", key: "d/4" },
  { name: "Mi", englishName: "E", key: "e/4" },
];

export function App() {
  const { config, updateConfig } = useConfig();
  const { playNotes, isLoaded, isIOSDevice } = useAudio();
  const [currentClef, setCurrentClef] = useState<ClefType>(config.clef);
  const [notesToShow, setNotesToShow] = useState<number>(config.notesCount);
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [userAnswers, setUserAnswers] = useState<Note[]>([]);
  const [feedback, setFeedback] = useState("");
  const [showClefMenu, setShowClefMenu] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const staffRef = useRef<HTMLDivElement>(null!);
  const clefMenuRef = useRef<HTMLDivElement>(null!);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isFirstLoadRef = useRef(true);

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

  const renderStaff = useCallback(() => {
    if (currentNotes.length !== notesToShow) return;

    if (!staffRef.current) return;
    staffRef.current.innerHTML = "";

    const VF = Vex.Flow;
    const renderer = new VF.Renderer(staffRef.current, VF.Renderer.Backends.SVG);

    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 200;
    const SCALE = 2;
    const STAVE_WIDTH = 150;

    renderer.resize(CANVAS_WIDTH, CANVAS_HEIGHT);
    const context = renderer.getContext();
    context.setFont("Arial", 12);
    context.scale(SCALE, SCALE);

    const stave = new VF.Stave((CANVAS_WIDTH - STAVE_WIDTH * SCALE) / (2 * SCALE), -10, STAVE_WIDTH);
    stave.addClef(currentClef);
    stave.setContext(context).draw();

    const notes = currentNotes.map((note) => {
      const staveNote = new VF.StaveNote({
        clef: currentClef,
        keys: [note.key],
        duration: "q",
      });

      const lineNumber = staveNote.getKeyLine(0);
      staveNote.setStemDirection(lineNumber >= 3 ? -1 : 1);

      return staveNote;
    });

    const voice = new VF.Voice({ num_beats: notesToShow, beat_value: 4 });
    voice.addTickables(notes);

    new VF.Formatter().joinVoices([voice]).format([voice], 125 - notesToShow * 5);
    voice.draw(context, stave);
  }, [currentNotes, currentClef, notesToShow]);

  const generateNewNotes = useCallback(() => {
    // Clear current state
    setUserAnswers([]);
    setFeedback("");

    // Clear the staff
    if (staffRef.current) {
      staffRef.current.innerHTML = "";
    }

    // Use the current clef from state, not from a closure
    const currentClefValue = currentClef;
    const notesForCurrentClef = currentClefValue === "treble" ? TREBLE_NOTES : BASS_NOTES;
    const newNotes: Note[] = [];

    // Use the current number of notes from state
    const currentNotesToShow = notesToShow;
    while (newNotes.length < currentNotesToShow) {
      const randomIndex = Math.floor(Math.random() * notesForCurrentClef.length);
      const newNote = notesForCurrentClef[randomIndex];

      if (newNotes.length === 0 || newNotes[newNotes.length - 1].key !== newNote.key) {
        newNotes.push(newNote);
      }
    }

    // Update state with new notes
    setCurrentNotes(newNotes);

    // Automatic playback will be handled in the effect that observes changes in currentNotes
  }, [currentClef, notesToShow]);

  // Effect to generate initial notes only once at startup
  useEffect(() => {
    generateNewNotes();
  }, [generateNewNotes]);

  // Effect to render the staff when notes change
  useEffect(() => {
    if (staffRef.current && currentNotes.length > 0) {
      // Use requestAnimationFrame to ensure the DOM is ready
      requestAnimationFrame(() => {
        renderStaff();
      });
    }
  }, [currentNotes, renderStaff]);

  // Effect to initialize audio automatically when the application loads
  useEffect(() => {
    if (!audioInitialized && isLoaded) {
      // Create an audio context if it doesn't exist
      if (!audioContextRef.current) {
        try {
          const AudioContextClass =
            window.AudioContext || (window as unknown as { webkitAudioContext?: AudioContext }).webkitAudioContext;

          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        } catch (error) {
          console.warn("Could not create audio context:", error);
        }
      }

      // Mark as initialized
      setAudioInitialized(true);
    }
  }, [audioInitialized, isLoaded]);

  // Effect to play notes automatically when they change (except on first load)
  useEffect(() => {
    // If it's the first load, mark as no longer first load and exit without playing
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    // Only play if there are notes, audio is initialized, and sound is enabled
    if (currentNotes.length > 0 && audioInitialized && isLoaded && config.soundEnabled) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        playNotes(currentNotes, "normal", "normal", false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentNotes, audioInitialized, isLoaded, config.soundEnabled, playNotes]);

  const handleNoteClick = (selectedNote: Note) => {
    if (userAnswers.length >= notesToShow || feedback !== "") return;

    // Play the sound of the selected note
    if (isLoaded && config.soundEnabled) {
      // Determine which note to play
      let noteToPlay: Note;

      // If we're on the last step and the selected note is correct
      if (userAnswers.length === notesToShow - 1 && selectedNote.name === currentNotes[userAnswers.length].name) {
        // Play the correct note at the correct pitch
        noteToPlay = currentNotes[userAnswers.length];
      } else {
        // If the note is incorrect or not the last step, play the selected note
        // at the pitch closest to the correct note
        const correctNote = currentNotes[userAnswers.length];
        const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;

        // Find the note with the same name as the selected one and closest to the correct one
        const sameNameNotes = notesForCurrentClef.filter((n) =>
          config.notation === "latin" ? n.name === selectedNote.name : n.englishName === selectedNote.englishName
        );

        if (sameNameNotes.length > 0) {
          // Find the note closest to the correct one
          noteToPlay = sameNameNotes.reduce((closest, note) => {
            const correctKeyParts = correctNote.key.split("/");
            const noteKeyParts = note.key.split("/");
            const closestKeyParts = closest.key.split("/");

            const correctOctave = parseInt(correctKeyParts[1]);
            const noteOctave = parseInt(noteKeyParts[1]);
            const closestOctave = parseInt(closestKeyParts[1]);

            // Calculate the distance in octaves
            const noteDist = Math.abs(noteOctave - correctOctave);
            const closestDist = Math.abs(closestOctave - correctOctave);

            return noteDist < closestDist ? note : closest;
          }, sameNameNotes[0]);
        } else {
          // If there are no notes with the same name, use the selected one
          noteToPlay = selectedNote;
        }
      }

      // Play the note
      playNotes([noteToPlay], "normal", "normal", false);
    }

    const newUserAnswers = [...userAnswers, selectedNote];
    setUserAnswers(newUserAnswers);

    if (newUserAnswers.length === notesToShow) {
      const isCorrect = newUserAnswers.every((note, index) => note.name === currentNotes[index].name);
      const feedbackText = isCorrect ? "¡Correcto!" : "¡Incorrecto!";

      setFeedback(feedbackText);
      setTimeout(() => {
        generateNewNotes();
      }, 2000);
    }
  };

  const handleModeChange = (mode: GameMode) => {
    updateConfig({ mode });
    setShowClefMenu(false);
    generateNewNotes();
  };

  const handleClefChange = (clef: ClefType) => {
    if (clef !== currentClef) {
      // Clear the staff before changing the clef
      if (staffRef.current) {
        staffRef.current.innerHTML = "";
      }

      // Clear answers and feedback
      setUserAnswers([]);
      setFeedback("");

      // Update the clef
      setCurrentClef(clef);
      updateConfig({ clef });

      // Generate new notes with the new clef
      // We use a function that captures the new clef in its closure
      setTimeout(() => {
        const notesForNewClef = clef === "treble" ? TREBLE_NOTES : BASS_NOTES;
        const newNotes: Note[] = [];

        while (newNotes.length < notesToShow) {
          const randomIndex = Math.floor(Math.random() * notesForNewClef.length);
          const newNote = notesForNewClef[randomIndex];

          if (newNotes.length === 0 || newNotes[newNotes.length - 1].key !== newNote.key) {
            newNotes.push(newNote);
          }
        }

        setCurrentNotes(newNotes);
      }, 50);

      setShowClefMenu(false);
    }
  };

  const handleNotesChange = (num: number) => {
    if (num !== notesToShow) {
      // Clear the staff
      if (staffRef.current) {
        staffRef.current.innerHTML = "";
      }

      // Clear answers and feedback
      setUserAnswers([]);
      setFeedback("");

      // Update the number of notes
      setNotesToShow(num);
      updateConfig({ notesCount: num });

      // Generate new notes with the new number
      setTimeout(() => {
        const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;
        const newNotes: Note[] = [];

        while (newNotes.length < num) {
          const randomIndex = Math.floor(Math.random() * notesForCurrentClef.length);
          const newNote = notesForCurrentClef[randomIndex];

          if (newNotes.length === 0 || newNotes[newNotes.length - 1].key !== newNote.key) {
            newNotes.push(newNote);
          }
        }

        setCurrentNotes(newNotes);
      }, 50);

      setShowClefMenu(false);
    }
  };

  const handleNotationChange = (notation: NotationType) => {
    updateConfig({ notation });
    setShowClefMenu(false);
  };

  const toggleClefMenu = () => {
    setShowClefMenu(!showClefMenu);
  };

  const getNoteName = (note: Note) => {
    return config.notation === "latin" ? note.name : note.englishName!;
  };

  const candidateNotes = useMemo(() => {
    const ALL_NOTE_NAMES =
      config.notation === "latin" ? ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"] : ["C", "D", "E", "F", "G", "A", "B"];
    const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;

    const availableNotes = notesForCurrentClef.filter(
      (note) => !currentNotes.some((current) => current.name === note.name)
    );

    const noteToExclude = availableNotes[Math.floor(Math.random() * availableNotes.length)];

    const noteNamesToShow = ALL_NOTE_NAMES.filter(
      (name) => name !== (config.notation === "latin" ? noteToExclude.name : noteToExclude.englishName)
    );

    return noteNamesToShow
      .map(
        (name) =>
          notesForCurrentClef.find((note) => (config.notation === "latin" ? note.name : note.englishName) === name)!
      )
      .sort(() => Math.random() - 0.5)
      .map((note, index) => ({
        ...note,
        uniqueId: `${note.name}-${index}`,
      }));
  }, [currentClef, currentNotes, config.notation]);

  const handleSoundToggle = () => {
    const newSoundEnabled = !config.soundEnabled;
    updateConfig({ soundEnabled: newSoundEnabled });

    // If the user is enabling sound, initialize audio
    if (newSoundEnabled && isIOSDevice && audioContextRef.current) {
      audioContextRef.current.resume().catch(console.error);

      // Play a note to activate audio on iOS
      if (currentNotes.length > 0) {
        playNotes([currentNotes[0]], "normal", "normal", false);
      }
    }
  };

  return (
    <div
      className={clsx({
        "h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b": true,
        "from-green-400 to-green-300": feedback.includes("Correcto"),
        "from-red-600 to-red-400": feedback.includes("Incorrecto"),
        "from-pink-400 to-teal-300": feedback === "",
      })}
    >
      <div className="w-full h-auto relative max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-16 mx-auto">
        <div className="absolute top-4 right-4 z-50 flex justify-end">
          <div className="relative flex flex-col items-end">
            <button
              onClick={toggleClefMenu}
              className="w-12 h-12 flex items-center cursor-pointer justify-center bg-gray-50 hover:bg-gray-100 rounded-full shadow-sm transition-colors"
              aria-label="Configuración"
            >
              <GearsIcon className="w-6 h-6 text-gray-700" />
            </button>

            {showClefMenu && (
              <div
                ref={clefMenuRef}
                className="fixed inset-0 sm:absolute sm:inset-auto sm:right-0 sm:top-[-8px] sm:mt-2 sm:w-72 bg-white sm:rounded-lg shadow-xl z-50 border border-gray-200 overflow-y-auto sm:overflow-hidden"
              >
                <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Configuración</h2>
                  <button
                    onClick={() => setShowClefMenu(false)}
                    className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:border-b border-gray-300">
                    Modo
                  </div>
                  <button
                    onClick={() => handleModeChange("practice")}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      config.mode === "practice"
                        ? "bg-cyan-100 text-cyan-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{config.mode === "practice" ? "✓" : ""}</span>
                    Práctica
                  </button>
                  <button
                    onClick={() => handleModeChange("flashcards")}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      config.mode === "flashcards"
                        ? "bg-cyan-100 text-cyan-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{config.mode === "flashcards" ? "✓" : ""}</span>
                    Tarjetas de memoria
                  </button>

                  <div className="px-4 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:border-b border-gray-300">
                    Número de notas
                  </div>
                  {[1, 2, 3].map((num) => (
                    <button
                      key={`notes-${num}`}
                      onClick={() => handleNotesChange(num)}
                      className={clsx(
                        "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                        notesToShow === num
                          ? "bg-cyan-100 text-cyan-800 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span className="mr-2 w-4">{notesToShow === num ? "✓" : ""}</span>
                      {num} {num === 1 ? "nota" : "notas"}
                    </button>
                  ))}

                  <div className="px-4 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:border-b border-gray-300">
                    Clave
                  </div>
                  <button
                    onClick={() => handleClefChange("treble")}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      currentClef === "treble"
                        ? "bg-cyan-100 text-cyan-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{currentClef === "treble" ? "✓" : ""}</span>
                    Clave de Sol
                  </button>
                  <button
                    onClick={() => handleClefChange("bass")}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      currentClef === "bass"
                        ? "bg-cyan-100 text-cyan-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{currentClef === "bass" ? "✓" : ""}</span>
                    Clave de Fa
                  </button>

                  <div className="px-4 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:border-b border-gray-300">
                    Notación
                  </div>
                  <button
                    onClick={() => handleNotationChange("latin")}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      config.notation === "latin"
                        ? "bg-cyan-100 text-cyan-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{config.notation === "latin" ? "✓" : ""}</span>
                    Latina (Do, Re, Mi)
                  </button>
                  <button
                    onClick={() => handleNotationChange("english")}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      config.notation === "english"
                        ? "bg-cyan-100 text-cyan-800 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{config.notation === "english" ? "✓" : ""}</span>
                    Inglesa (C, D, E)
                  </button>

                  <div className="px-4 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider sm:border-b border-gray-300">
                    Sonido
                  </div>
                  <button
                    onClick={handleSoundToggle}
                    className={clsx(
                      "w-full text-left px-4 py-2 sm:py-2 text-sm flex items-center cursor-pointer",
                      config.soundEnabled ? "bg-cyan-100 text-cyan-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className="mr-2 w-4">{config.soundEnabled ? "✓" : ""}</span>
                    {config.soundEnabled ? "Sonido activado" : "Sonido desactivado"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div className="absolute top-6 sm:top-8 inset-x-0 text-center z-10">
            <span
              className={clsx("text-2xl font-bold", feedback.includes("Correcto") ? "text-green-600" : "text-red-600")}
            >
              {feedback}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center mt-12 sm:mt-0">
          <div className="relative">
            <div ref={staffRef} className="staff-container h-[200px]" />
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            {config.mode === "practice" ? (
              <>
                <div className="flex items-center justify-center mb-2">
                  <p className="text-xl md:text-2xl font-semibold text-black mt-2 md:mt-4">
                    {notesToShow === 1
                      ? "¿Qué nota es esta?"
                      : `¿Qué notas son estas? (${userAnswers.length}/${notesToShow})`}
                  </p>
                </div>
                <div className={clsx("mb-6 min-h-8 text-2xl")}>
                  {!feedback && userAnswers.length > 0 && (
                    <span className="relative inline-flex items-center gap-2 font-semibold text-cyan-600">
                      {userAnswers.map((n) => getNoteName(n)).join("-")}
                    </span>
                  )}
                  {feedback && (
                    <div className="flex items-center justify-center gap-1">
                      {feedback.includes("Incorrecto") && (
                        <>
                          <span className="text-red-500 font-semibold line-through">
                            {userAnswers.map((n) => getNoteName(n)).join("-")}
                          </span>
                          <span className="text-gray-500">→</span>
                        </>
                      )}
                      <span className="text-green-600 font-semibold">
                        {currentNotes.map((n) => getNoteName(n)).join("-")}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-2xl font-bold text-cyan-600">{currentNotes.map((n) => getNoteName(n)).join("-")}</p>
                <p className="text-lg text-gray-600">
                  Memoriza la posición de {notesToShow === 1 ? "la nota" : "las notas"}
                </p>
                <button
                  onClick={() => {
                    generateNewNotes();
                  }}
                  className="mt-4 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-lg"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>

          {config.mode === "practice" && (
            <div className="grid grid-cols-3 gap-3">
              {candidateNotes.map((note) => (
                <button
                  disabled={feedback !== "" || userAnswers.length >= notesToShow}
                  key={note.uniqueId}
                  onClick={() => handleNoteClick(note)}
                  className={clsx(
                    "cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 md:py-3 md:px-4 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200 text-lg",
                    (feedback !== "" || userAnswers.length >= notesToShow) && "disabled:opacity-50 pointer-events-none"
                  )}
                >
                  {getNoteName(note).toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
