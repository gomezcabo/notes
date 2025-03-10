import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Vex } from "vexflow";

import { clsx } from "clsx";
import { GearsIcon } from "./components/gears-icon";

// Constant for number of notes to show
const NOTES_TO_SHOW = 1;

const WIDTHS = [110, 160, 210, 230];
const SCALES = [2.5, 2.2, 1.8, 1.8];
const PADDING_LEFT = [32, 64, 127, 139];

type Note = {
  name: string;
  key: string;
};

type ClefType = "treble" | "bass";

const TREBLE_NOTES: Note[] = [
  { name: "La", key: "a/3" },
  { name: "Si", key: "b/3" },
  { name: "Do", key: "c/4" },
  { name: "Re", key: "d/4" },
  { name: "Mi", key: "e/4" },
  { name: "Fa", key: "f/4" },
  { name: "Sol", key: "g/4" },
  { name: "La", key: "a/4" },
  { name: "Si", key: "b/4" },
  { name: "Do", key: "c/5" },
  { name: "Re", key: "d/5" },
  { name: "Mi", key: "e/5" },
  { name: "Fa", key: "f/5" },
  { name: "Sol", key: "g/5" },
  { name: "La", key: "a/5" },
  { name: "Si", key: "b/5" },
  { name: "Do", key: "c/6" },
];

const BASS_NOTES: Note[] = [
  { name: "Do", key: "c/2" },
  { name: "Re", key: "d/2" },
  { name: "Mi", key: "e/2" },
  { name: "Fa", key: "f/2" },
  { name: "Sol", key: "g/2" },
  { name: "La", key: "a/2" },
  { name: "Si", key: "b/2" },
  { name: "Do", key: "c/3" },
  { name: "Re", key: "d/3" },
  { name: "Mi", key: "e/3" },
  { name: "Fa", key: "f/3" },
  { name: "Sol", key: "g/3" },
  { name: "La", key: "a/3" },
  { name: "Si", key: "b/3" },
  { name: "Do", key: "c/4" },
  { name: "Re", key: "d/4" },
  { name: "Mi", key: "e/4" },
];

export function App() {
  const [currentClef, setCurrentClef] = useState<ClefType>("treble");
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
    // Clear previous rendering
    staffRef.current!.innerHTML = "";

    // Create a VexFlow renderer with the staff container
    const VF = Vex.Flow;
    const renderer = new VF.Renderer(staffRef.current, VF.Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(WIDTHS[NOTES_TO_SHOW - 1] * 4, 250);
    const context = renderer.getContext();
    context.setFont("Arial", 12);
    context.scale(SCALES[NOTES_TO_SHOW - 1], SCALES[NOTES_TO_SHOW - 1]);

    // Create a stave
    const stave = new VF.Stave(PADDING_LEFT[NOTES_TO_SHOW - 1], -10, WIDTHS[NOTES_TO_SHOW - 1]);
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
    const voice = new VF.Voice({ num_beats: NOTES_TO_SHOW, beat_value: 4 });
    voice.addTickables(notes);

    // Format and draw the voice
    new VF.Formatter().joinVoices([voice]).format([voice], 180);
    voice.draw(context, stave);
  }, [currentNotes, currentClef]);

  const generateNewNotes = useCallback(() => {
    const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;
    const newNotes: Note[] = [];

    while (newNotes.length < NOTES_TO_SHOW) {
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
  }, [currentClef]);

  useEffect(() => {
    generateNewNotes();
  }, [currentClef, generateNewNotes]);

  useEffect(() => {
    if (currentNotes.length > 0 && staffRef.current) {
      renderStaff();
    }
  }, [currentNotes, staffRef, renderStaff]);

  const handleNoteClick = (selectedNote: Note) => {
    if (userAnswers.length >= NOTES_TO_SHOW) return;

    const newUserAnswers = [...userAnswers, selectedNote];
    setUserAnswers(newUserAnswers);

    if (newUserAnswers.length === NOTES_TO_SHOW) {
      const isCorrect = newUserAnswers.every((note, index) => note.name === currentNotes[index].name);

      const feedbackText = isCorrect
        ? "¡Correcto! La secuencia es: " + currentNotes.map((n) => n.name.toUpperCase()).join(" - ")
        : "¡Incorrecto! La secuencia correcta es: " + currentNotes.map((n) => n.name.toUpperCase()).join(" - ");

      setFeedback(feedbackText);
      setTimeout(generateNewNotes, 2000);
    }
  };

  const handleClefChange = (clef: ClefType) => {
    if (clef !== currentClef) {
      setCurrentClef(clef);
      setFeedback("");
      setShowClefMenu(false);
    }
  };

  const toggleClefMenu = () => {
    setShowClefMenu(!showClefMenu);
  };

  const candidateNotes = useMemo(() => {
    const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;
    return [...new Set(notesForCurrentClef.map((note) => note.name))]
      .map((name) => notesForCurrentClef.find((note) => note.name === name)!)
      .sort(() => Math.random() - 0.5)
      .slice(0, 7);
  }, [currentClef]);

  return (
    <div
      className={clsx({
        "h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b": true,
        "from-green-400 to-green-300": feedback.includes("Correcto"),
        "from-red-600 to-red-400": feedback.includes("Incorrecto"),
        "from-pink-400 to-teal-300": feedback === "",
      })}
    >
      <div className="w-full h-auto relative max-w-4xl bg-white rounded-2xl shadow-xl p-8 sm:p-16 mx-auto">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleClefMenu}
            className="w-10 h-10 flex items-center cursor-pointer justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow-md transition-colors"
            aria-label="Configuración de clave"
          >
            <GearsIcon />
          </button>

          {showClefMenu && (
            <div
              ref={clefMenuRef}
              className="absolute right-[-4px] top-[-4px] w-48 bg-white rounded-lg shadow-lg py-2 z-20"
            >
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                Seleccionar clave
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
                "p-4 sm:p-6 rounded-tl-xl rounded-tr-xl text-center text-xl sm:text-2xl font-semibold",
                feedback.includes("Correcto") ? "text-green-600" : "text-red-500"
              )}
            >
              {feedback}
            </div>
          )}
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <p className="text-xl md:text-2xl font-semibold text-black mt-2 md:mt-4 mb-2">
              ¿Qué notas son estas? ({userAnswers.length}/{NOTES_TO_SHOW})
            </p>
            {userAnswers.length > 0 && (
              <p className="text-lg text-gray-600 mb-4">
                Tu secuencia: {userAnswers.map((n) => n.name.toUpperCase()).join(" - ")}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {candidateNotes.map((note) => (
              <button
                disabled={feedback !== "" || userAnswers.length >= NOTES_TO_SHOW}
                key={note.name}
                onClick={() => handleNoteClick(note)}
                className={clsx(
                  "cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 md:py-3 md:px-4 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200 text-lg",
                  (feedback !== "" || userAnswers.length >= NOTES_TO_SHOW) && "disabled:opacity-50 pointer-events-none"
                )}
              >
                {note.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
