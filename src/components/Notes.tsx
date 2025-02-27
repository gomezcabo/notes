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

export function Notes() {
  const [currentNote, setCurrentNote] = useState<Note>(NOTES[0]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const staffRef = useRef<HTMLDivElement>(null!);

  const renderStaff = useCallback(() => {
    // Clear previous rendering
    staffRef.current!.innerHTML = "";

    // Create a VexFlow renderer with the staff container
    const VF = Vex.Flow;
    const renderer = new VF.Renderer(staffRef.current, VF.Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(400, 400);
    const context = renderer.getContext();
    context.setFont("Arial", 12);
    context.scale(3, 3);

    // Create a stave
    const stave = new VF.Stave(10, 20, 120);
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
    setFeedback("");
  };

  const handleNoteClick = (selectedNote: Note) => {
    if (selectedNote.name === currentNote.name) {
      setFeedback("¡Correcto!");
      setScore(score + 1);
      setTimeout(generateNewNote, 1500);
    } else {
      setFeedback(`Incorrecto. La respuesta correcta es ${currentNote.name}.`);
      setTimeout(generateNewNote, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Quiz de Lectura Musical</h1>

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="scale-50 relative transform transform-scale-50">
          <div ref={staffRef} className="staff-container"></div>
        </div>

        <div className="mt-8">
          <p className="block text-lg font-medium text-gray-700 mb-4">¿Qué nota es esta?</p>
          <div className="grid grid-cols-7 gap-2">
            {NOTES.slice(0, 7).map((note) => (
              <button
                key={note.name}
                onClick={() => handleNoteClick(note)}
                className="bg-music-secondary hover:bg-blue-600 text-red-500 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                {note.name}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3 rounded-md ${
              feedback.includes("Correcto") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xl font-semibold">Puntuación: {score}</p>
        </div>
      </div>
    </div>
  );
}
