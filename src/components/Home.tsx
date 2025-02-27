import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-3xl font-bold text-music-primary mb-6">Aprende Teoría Musical</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          to="/notes"
          className="bg-music-secondary hover:bg-blue-600 text-white p-6 rounded-lg shadow transition duration-300 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Identificación de Notas</h3>
          <p>Aprende a leer notas en el pentagrama</p>
        </Link>

        <Link
          to="/chords"
          className="bg-music-accent hover:bg-red-600 text-white p-6 rounded-lg shadow transition duration-300 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Identificación de Acordes</h3>
          <p>Aprende a reconocer acordes musicales</p>
        </Link>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p>Selecciona un módulo para comenzar a practicar</p>
      </div>
    </div>
  );
}
