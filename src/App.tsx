import { useState, useEffect, useRef, useCallback } from "react";
import { Vex } from "vexflow";
import "./App.css";

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
];

function App() {
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

    // Create a stave
    const stave = new VF.Stave(19, 40, 380);
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Create a note
    const note = new VF.StaveNote({
      clef: "treble",
      keys: [currentNote.key],
      duration: "q",
    });

    // Create a voice and add the note
    const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
    voice.addTickables([note]);

    // Format and draw the voice
    new VF.Formatter().joinVoices([voice]).format([voice], 300);
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
        <div ref={staffRef} className="staff-container"></div>

        <div className="mt-8">
          <p className="block text-lg font-medium text-gray-700 mb-4">¿Qué nota es esta?</p>
          <div className="grid grid-cols-7 gap-2">
            {NOTES.map((note) => (
              <button
                key={note.name}
                onClick={() => handleNoteClick(note)}
                className="bg-music-secondary hover:bg-blue-600 text-red-500 font-bold py-2 px-4 rounded-md transition duration-300"
              >
                {note.name.split(" ")[0]}
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

      <div className="mt-8 text-center text-gray-600">
        <p>Aprende a leer partituras de forma divertida</p>
      </div>
    </div>
  );
}

export default App;
