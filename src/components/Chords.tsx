import { useState, useEffect, useRef } from "react";
import { Vex } from "vexflow";

type ChordType = {
  name: string;
  keys: string[];
  notes: string[];
};

const CHORDS: ChordType[] = [
  // {
  //   name: "Do Mayor (C)",
  //   keys: ["c/4", "e/4", "g/4"],
  //   notes: ["Do", "Mi", "Sol"],
  // },
  {
    name: "Re Mayor (D)",
    keys: ["d/4", "f#/4", "a/4"],
    notes: ["Re", "Fa#", "La"],
  },
  {
    name: "Mi Mayor (E)",
    keys: ["e/4", "g#/4", "b/4"],
    notes: ["Mi", "Sol#", "Si"],
  },
  // {
  //   name: "Fa Mayor (F)",
  //   keys: ["f/4", "a/4", "c/5"],
  //   notes: ["Fa", "La", "Do"],
  // },
  // {
  //   name: "Sol Mayor (G)",
  //   keys: ["g/4", "b/4", "d/5"],
  //   notes: ["Sol", "Si", "Re"],
  // },
  // {
  //   name: "La Mayor (A)",
  //   keys: ["a/4", "c#/5", "e/5"],
  //   notes: ["La", "Do#", "Mi"],
  // },
  // {
  //   name: "Si Mayor (B)",
  //   keys: ["b/4", "d#/5", "f#/5"],
  //   notes: ["Si", "Re#", "Fa#"],
  // },
  // {
  //   name: "Do menor (Cm)",
  //   keys: ["c/4", "eb/4", "g/4"],
  //   notes: ["Do", "Mib", "Sol"],
  // },
  // {
  //   name: "Re menor (Dm)",
  //   keys: ["d/4", "f/4", "a/4"],
  //   notes: ["Re", "Fa", "La"],
  // },
  // {
  //   name: "Mi menor (Em)",
  //   keys: ["e/4", "g/4", "b/4"],
  //   notes: ["Mi", "Sol", "Si"],
  // },
];

export function Chords() {
  const [currentChord, setCurrentChord] = useState<ChordType | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const staffRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    generateNewChord();
  }, []);

  useEffect(() => {
    if (currentChord && staffRef.current) {
      renderStaff();
    }
  }, [currentChord]);

  const renderStaff = () => {
    // Clear previous rendering
    if (!currentChord) return;
    staffRef.current.innerHTML = "";

    // Create a VexFlow renderer with the staff container
    const VF = Vex.Flow;
    const renderer = new VF.Renderer(staffRef.current, VF.Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(500, 200);
    const context = renderer.getContext();
    context.setFont("Arial", 10);

    // Create a stave
    const stave = new VF.Stave(10, 40, 400);
    stave.addClef("treble");
    stave.setContext(context).draw();

    // Create chord notes
    const chordNotes = [
      new VF.StaveNote({
        clef: "treble",
        keys: currentChord.keys,
        duration: "q",
      }),
    ];

    // Add accidentals for sharp/flat notes
    currentChord.keys.forEach((key, index) => {
      if (key.includes("#")) {
        chordNotes[0].addModifier(new VF.Accidental("#"), index);
      }
      // else if (key.includes("b")) {
      //   chordNotes[0].addModifier(new VF.Accidental("b"), index);
      // }
    });

    // Create a voice and add the chord
    const voice = new VF.Voice({ num_beats: 1, beat_value: 4 });
    voice.addTickables(chordNotes);

    // Format and draw the voice
    new VF.Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(context, stave);
  };

  const generateNewChord = () => {
    const randomIndex = Math.floor(Math.random() * CHORDS.length);
    setCurrentChord(CHORDS[randomIndex]);
    setUserAnswer("");
    setFeedback("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (userAnswer.toLowerCase() === currentChord?.name.toLowerCase()) {
      setFeedback("¡Correcto!");
      setScore(score + 1);
      setTimeout(generateNewChord, 1500);
    } else {
      setFeedback(`Incorrecto. La respuesta correcta es ${currentChord?.name}.`);
      setTimeout(generateNewChord, 2500);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold text-music-primary mb-6">Identificación de Acordes</h2>

      <div ref={staffRef} className="staff-container"></div>

      <div className="mt-4 mb-6 text-center">
        <p className="text-gray-600">Notas del acorde: {currentChord ? currentChord.notes.join(", ") : ""}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="mb-4">
          <label htmlFor="answer" className="block text-lg font-medium text-gray-700 mb-2">
            ¿Qué acorde es este?
          </label>
          <input
            type="text"
            id="answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-music-secondary"
            placeholder="Escribe el nombre del acorde"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-music-accent hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Comprobar
        </button>
      </form>

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
  );
}
