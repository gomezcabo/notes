import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Vex } from "vexflow";

import { clsx } from "clsx";
import { GearsIcon } from "./components/gears-icon";

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
  const [currentNote, setCurrentNote] = useState<Note>(TREBLE_NOTES[0]);
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
    renderer.resize(360, 250);
    const context = renderer.getContext();
    context.setFont("Arial", 12);
    context.scale(2.5, 2.5);

    // Create a stave
    const stave = new VF.Stave(22, -10, 100);
    stave.addClef(currentClef);
    stave.setContext(context).draw();

    // Create a note
    const note = new VF.StaveNote({
      clef: currentClef,
      keys: [currentNote.key],
      duration: "w",
    });

    // Get the line number for the note (0 is the bottom line, 6 is the top line)
    const lineNumber = note.getKeyLine(0);

    // Middle line is 2 (counting from 0), so we use this as our reference
    if (lineNumber >= 3) {
      note.setStemDirection(-1); // stem down for high notes
    } else {
      note.setStemDirection(1); // stem up for low notes
    }

    // Create a voice and add the note
    const voice = new VF.Voice({ num_beats: 1, beat_value: 1 });
    voice.addTickables([note]);

    // Format and draw the voice
    new VF.Formatter().joinVoices([voice]).format([voice]);
    voice.draw(context, stave);
  }, [currentNote, currentClef]);

  useEffect(() => {
    generateNewNote();
  }, [currentClef]);

  useEffect(() => {
    if (currentNote && staffRef.current) {
      renderStaff();
    }
  }, [currentNote, staffRef, renderStaff]);

  const generateNewNote = () => {
    const notesForCurrentClef = currentClef === "treble" ? TREBLE_NOTES : BASS_NOTES;
    let randomIndex = Math.floor(Math.random() * notesForCurrentClef.length);
    let newNote = notesForCurrentClef[randomIndex];

    // Asegurarse de que la nueva nota sea diferente a la actual
    if (currentNote && notesForCurrentClef.length > 1) {
      while (newNote.key === currentNote.key) {
        randomIndex = Math.floor(Math.random() * notesForCurrentClef.length);
        newNote = notesForCurrentClef[randomIndex];
      }
    }

    setCurrentNote(newNote);
    setFeedback("");
  };

  const handleNoteClick = (selectedNote: Note) => {
    const isCorrect = selectedNote.name === currentNote.name;

    setFeedback(
      isCorrect
        ? "¡Correcto! Es un " + currentNote.name.toUpperCase()
        : "¡Incorrecto! Es un " + currentNote.name.toUpperCase()
    );

    setTimeout(generateNewNote, 1500);
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

    const newNotes = [...notesForCurrentClef]
      .slice(0, 7)
      .sort(() => Math.random() - 0.5)
      .filter((note) => note.name !== currentNote.name)
      .slice(0, 3)
      .concat(currentNote)
      .sort(() => Math.random() - 0.5);

    return newNotes;
  }, [currentNote, currentClef]);

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
          <p className="text-xl md:text-2xl font-semibold text-black mt-2 md:mt-4 mb-4 md:mb-6 text-center">
            ¿Qué nota es esta?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {candidateNotes.map((note) => (
              <button
                disabled={feedback !== ""}
                key={note.name}
                onClick={() => handleNoteClick(note)}
                className={clsx(
                  "cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 md:py-4 md:px-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-200 text-lg md:text-xl",
                  feedback !== "" && "disabled:opacity-50 pointer-events-none"
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
