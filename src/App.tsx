import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Home } from "./components/Home";
import { Notes } from "./components/Notes";
import { Chords } from "./components/Chords.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <header className="w-full max-w-2xl mb-8">
          <h1 className="text-4xl font-bold text-music-primary text-center">
            <Link to="/" className="hover:text-music-secondary transition duration-300">
              Quiz de Teoría Musical
            </Link>
          </h1>
        </header>

        <main className="flex-grow w-full flex items-center justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/chords" element={<Chords />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
