import { useConfig } from "../hooks/useConfig";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { config } = useConfig();

  return (
    <div className="w-full h-auto relative max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-16 mx-auto text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-6">Bienvenido a AdivinaLaNota</h1>
      <p className="text-lg text-gray-700 mb-8">
        Aprende a identificar notas musicales en el pentagrama de forma divertida.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-4 bg-cyan-500 text-white text-xl font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow-lg"
      >
        Empezar
      </button>
      {!config.soundEnabled && (
        <p className="mt-4 text-sm text-gray-500">El sonido está desactivado. Puedes activarlo en la configuración.</p>
      )}
    </div>
  );
}
