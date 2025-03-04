import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Vex } from "vexflow";

import { clsx } from "clsx";

type Note = {
  name: string;
  key: string;
};

const NOTES: Note[] = [
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

export function App() {
  const [currentNote, setCurrentNote] = useState<Note>(NOTES[0]);
  const [feedback, setFeedback] = useState("");
  const staffRef = useRef<HTMLDivElement>(null!);

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
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Create a note
    const note = new VF.StaveNote({
      clef: "treble",
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
  }, [currentNote]);

  useEffect(() => {
    generateNewNote();
  }, []);

  useEffect(() => {
    if (currentNote && staffRef.current) {
      renderStaff();
    }
  }, [currentNote, staffRef, renderStaff]);

  const generateNewNote = () => {
    let randomIndex = Math.floor(Math.random() * NOTES.length);
    let newNote = NOTES[randomIndex];
    while (newNote === currentNote) {
      randomIndex = Math.floor(Math.random() * NOTES.length);
      newNote = NOTES[randomIndex];
    }
    setCurrentNote(newNote);
    setFeedback("");
  };

  const handleNoteClick = (selectedNote: Note) => {
    setFeedback(
      selectedNote.name === currentNote.name
        ? "¡Correcto! Es un " + currentNote.name.toUpperCase()
        : "¡Incorrecto! Es un " + currentNote.name.toUpperCase()
    );
    setTimeout(generateNewNote, 1500);
  };

  const candidateNotes = useMemo(() => {
    const newNotes = [...NOTES]
      .slice(0, 7)
      .sort(() => Math.random() - 0.5)
      .filter((note) => note.name !== currentNote.name)
      .slice(0, 3)
      .concat(currentNote)
      .sort(() => Math.random() - 0.5);

    return newNotes;
  }, [currentNote]);

  return (
    <div
      className={clsx({
        "h-[100dvh] min-w-[380px] w-full flex flex-col items-center justify-center p-8 bg-gradient-to-b": true,
        "from-green-400 to-green-300": feedback.includes("Correcto"),
        "from-red-600 to-red-400": feedback.includes("Incorrecto"),
        "from-pink-400 to-teal-300": feedback === "",
      })}
    >
      <div className="w-full h-auto relative max-w-4xl bg-white rounded-2xl shadow-xl p-16 mx-auto">
        <div className="flex justify-center">
          <div ref={staffRef} className="staff-container"></div>
        </div>

        <div className="absolute top-0 left-0 w-full">
          {feedback && (
            <div
              className={`p-6 rounded-tl-xl rounded-tr-xl text-center text-2xl font-semibold ${
                feedback.includes("Correcto") ? "text-green-800" : "text-red-800"
              }`}
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
