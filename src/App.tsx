import { useState, useEffect, useRef, useCallback } from "react";
import { Vex } from "vexflow";

type Note = {
  name: string;
  key: string;
};

const NOTES: Note[] = [
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
  { name: "Si", key: "b/4" },
];

export function App() {
  const [currentNote, setCurrentNote] = useState<Note>(NOTES[0]);
  const [feedback, setFeedback] = useState("Correcto");
  const [score, setScore] = useState(0);
  const staffRef = useRef<HTMLDivElement>(null!);

  const renderStaff = useCallback(() => {
    // Clear previous rendering
    staffRef.current!.innerHTML = "";

    // Create a VexFlow renderer with the staff container
    const VF = Vex.Flow;
    const renderer = new VF.Renderer(staffRef.current, VF.Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(380, 280);
    const context = renderer.getContext();
    context.setFont("Arial", 12);
    context.scale(3, 3);

    // Create a stave
    const stave = new VF.Stave(13, -13, 100);
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Create a note
    const note = new VF.StaveNote({
      clef: "treble",
      keys: [currentNote.key],
      duration: "q",
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
    const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
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
    const randomIndex = Math.floor(Math.random() * NOTES.length);
    setCurrentNote(NOTES[randomIndex]);
    setFeedback("Correcto");
  };

  const handleNoteClick = (selectedNote: Note) => {
    if (selectedNote.name === currentNote.name) {
      setFeedback("¡Correcto! Es un " + currentNote.name.toUpperCase());
      setScore(score + 1);
      setTimeout(generateNewNote, 1500);
    } else {
      setFeedback(`Incorrecto: ${currentNote.name.toUpperCase()}`);
      setTimeout(generateNewNote, 2500);
    }
  };

  return (
    <div className="min-h-screen min-w-[640px] w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-teal-100 to-teal-100">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 mx-auto">
        <div className="flex justify-center">
          <div ref={staffRef} className="staff-container"></div>
        </div>

        <div className="h-16 my-2 text-center">
          {feedback && (
            <div
              className={`inline-block p-4 rounded-xl text-center text-lg font-semibold ${
                feedback.includes("Correcto") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {feedback}
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-2xl font-medium text-teal-800 mb-6 text-center">¿Qué nota es esta?</p>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {NOTES.slice(0, 7).map((note) => (
              <button
                key={note.name}
                onClick={() => handleNoteClick(note)}
                className="cursor-pointer bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 
                text-white font-bold py-4 px-6 rounded-xl shadow-md hover:shadow-lg 
                transform hover:scale-105 transition-all duration-200 text-lg"
              >
                {note.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
