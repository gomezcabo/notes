import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Aprende Teoría Musical</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link
          to="/notes"
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-6 rounded-lg shadow transition duration-300 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Identificación de Notas</h3>
          <p>Aprende a leer notas en el pentagrama</p>
        </Link>

        <Link
          to="/chords"
          className="bg-teal-100 hover:bg-teal-200 text-teal-700 p-6 rounded-lg shadow transition duration-300 text-center"
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
