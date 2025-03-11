import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Vex } from "vexflow";

import { clsx } from "clsx";
import { GearsIcon } from "./components/gears-icon";
import { useConfig } from "./hooks/useConfig";

type Note = {
  name: string;
  key: string;
  englishName?: string;
};

type ClefType = "treble" | "bass";
type NotationType = "latin" | "english";

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
  const [currentClef, setCurrentClef] = useState<ClefType>(config.clef);
  const [notesToShow, setNotesToShow] = useState<number>(config.notesCount);
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [userAnswers, setUserAnswers] = useState<Note[]>([]);
  const [feedback, setFeedback] = useState("");
  const [showClefMenu, setShowClefMenu] = useState(false);
  const staffRef = useRef<HTMLDivElement>(null!);
  const clefMenuRef = useRef<HTMLDivElement>(null!);

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
    // Only render if we have the correct number of notes
    if (currentNotes.length !== notesToShow) return;

    // Clear previous rendering
    staffRef.current!.innerHTML = "";

    // Create a VexFlow renderer with the staff container
    const VF = Vex.Flow;
    const renderer = new VF.Renderer(staffRef.current, VF.Renderer.Backends.SVG);

    const CANVAS_WIDTH = 400;
    const CANVAS_HEIGHT = 200;
    const SCALE = 2;
    const STAVE_WIDTH = 150;

    // Configure the rendering context
    renderer.resize(CANVAS_WIDTH, CANVAS_HEIGHT);
    const context = renderer.getContext();
    context.setFont("Arial", 12);
    context.scale(SCALE, SCALE);

    // Create a stave

    const stave = new VF.Stave((CANVAS_WIDTH - STAVE_WIDTH * SCALE) / (2 * SCALE), -10, STAVE_WIDTH);
    stave.addClef(currentClef);
    stave.setContext(context).draw();

    // Create notes
    const notes = currentNotes.map((note) => {
      const staveNote = new VF.StaveNote({
        clef: currentClef,
        keys: [note.key],
        duration: "q",
      });

      // Set stem direction based on note position
      const lineNumber = staveNote.getKeyLine(0);
      staveNote.setStemDirection(lineNumber >= 3 ? -1 : 1);

      return staveNote;
    });

    // Create a voice and add the notes
    const voice = new VF.Voice({ num_beats: notesToShow, beat_value: 4 });
    voice.addTickables(notes);

    new VF.Formatter().joinVoices([voice]).format([voice], 125 - notesToShow * 5);
    voice.draw(context, stave);
  }, [currentNotes, currentClef, notesToShow]);

  const generateNewNotes = useCallback(() => {
    const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;
    const newNotes: Note[] = [];

    while (newNotes.length < notesToShow) {
      const randomIndex = Math.floor(Math.random() * notesForCurrentClef.length);
      const newNote = notesForCurrentClef[randomIndex];

      // Avoid repeating the same note consecutively
      if (newNotes.length === 0 || newNotes[newNotes.length - 1].key !== newNote.key) {
        newNotes.push(newNote);
      }
    }

    setCurrentNotes(newNotes);
    setUserAnswers([]);
    setFeedback("");
  }, [currentClef, notesToShow]);

  useEffect(() => {
    generateNewNotes();
  }, [currentClef, notesToShow, generateNewNotes]);

  useEffect(() => {
    if (staffRef.current) {
      renderStaff();
    }
  }, [currentNotes, staffRef, renderStaff]);

  const handleNoteClick = (selectedNote: Note) => {
    if (userAnswers.length >= notesToShow) return;

    const newUserAnswers = [...userAnswers, selectedNote];
    setUserAnswers(newUserAnswers);

    if (newUserAnswers.length === notesToShow) {
      const isCorrect = newUserAnswers.every((note, index) => note.name === currentNotes[index].name);
      const feedbackText = isCorrect ? "¡Correcto!" : "¡Incorrecto!";

      setFeedback(feedbackText);
      setUserAnswers(newUserAnswers);
      setTimeout(generateNewNotes, 2000);
    }
  };

  const handleClefChange = (clef: ClefType) => {
    if (clef !== currentClef) {
      setCurrentClef(clef);
      updateConfig({ clef });
      setUserAnswers([]);
      setFeedback("");
      setShowClefMenu(false);
    }
  };

  const handleNotesChange = (num: number) => {
    setNotesToShow(num);
    updateConfig({ notesCount: num });
    setUserAnswers([]);
    setFeedback("");
    setShowClefMenu(false);
    generateNewNotes();
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

    // Get all available notes that are not in currentNotes
    const availableNotes = notesForCurrentClef.filter(
      (note) => !currentNotes.some((current) => current.name === note.name)
    );

    // Pick one random note to exclude
    const noteToExclude = availableNotes[Math.floor(Math.random() * availableNotes.length)];

    // Get the final list of note names to show (excluding the random note)
    const noteNamesToShow = ALL_NOTE_NAMES.filter(
      (name) => name !== (config.notation === "latin" ? noteToExclude.name : noteToExclude.englishName)
    );

    // Map note names back to actual notes from current clef and shuffle
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
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleClefMenu}
            className="w-8 h-8 flex items-center cursor-pointer justify-center bg-gray-50 hover:bg-gray-100 rounded-full shadow-sm transition-colors"
            aria-label="Configuración de clave"
          >
            <GearsIcon className="w-4 h-4 text-gray-700" />
          </button>

          {showClefMenu && (
            <div ref={clefMenuRef} className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Número de notas
              </div>
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={`notes-${num}`}
                  onClick={() => handleNotesChange(num)}
                  className={clsx(
                    "w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer",
                    notesToShow === num ? "bg-cyan-100 text-cyan-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="mr-2 w-4">{notesToShow === num ? "✓" : ""}</span>
                  {num} {num === 1 ? "nota" : "notas"}
                </button>
              ))}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-300">
                Clave
              </div>
              <button
                onClick={() => handleClefChange("treble")}
                className={clsx(
                  "w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer",
                  currentClef === "treble" ? "bg-cyan-100 text-cyan-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="mr-2 w-4">{currentClef === "treble" ? "✓" : ""}</span>
                Clave de Sol
              </button>
              <button
                onClick={() => handleClefChange("bass")}
                className={clsx(
                  "w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer",
                  currentClef === "bass" ? "bg-cyan-100 text-cyan-800 font-medium" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="mr-2 w-4">{currentClef === "bass" ? "✓" : ""}</span>
                Clave de Fa
              </button>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Notación
              </div>
              <button
                onClick={() => handleNotationChange("latin")}
                className={clsx(
                  "w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer",
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
                  "w-full text-left px-4 py-2 text-sm flex items-center cursor-pointer",
                  config.notation === "english"
                    ? "bg-cyan-100 text-cyan-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="mr-2 w-4">{config.notation === "english" ? "✓" : ""}</span>
                Inglesa (C, D, E)
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8 sm:mt-0">
          <div ref={staffRef} className="staff-container"></div>
        </div>

        <div className="absolute top-0 left-0 w-full">
          {feedback && (
            <div
              className={clsx(
                "p-5 sm:p-7 rounded-tl-xl whitespace-pre rounded-tr-xl text-center text-lg sm:text-2xl font-semibold",
                feedback.includes("Correcto") ? "text-green-600" : "text-red-500"
              )}
            >
              {feedback}
            </div>
          )}
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <p className="text-xl md:text-2xl font-semibold text-black mt-2 md:mt-4">
                {notesToShow === 1
                  ? "¿Qué nota es esta?"
                  : `¿Qué notas son estas? (${userAnswers.length}/${notesToShow})`}
              </p>
            </div>
            <div className="text-md mb-6 min-h-8">
              {!feedback && userAnswers.length > 0 && (
                <span className="relative inline-flex items-center gap-2 text-gray-600">
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
          </div>
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
        </div>
      </div>
    </div>
  );
}
