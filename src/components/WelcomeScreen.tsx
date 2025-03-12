import { useConfig } from "../hooks/useConfig";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { config } = useConfig();

  return (
    <div className="w-full h-auto relative max-w-4xl bg-white rounded-2xl shadow-xl pt-6 pb-8 px-4 sm:p-16 mx-auto text-center">
      <h1 className="pt-3 text-3xl sm:text-4xl font-bold text-pink-500 mb-6">AdivinaLaNota</h1>
      <p className="text-lg leading-6 text-gray-700 mb-5">
        Aprende a identificar notas musicales en el pentagrama de forma divertida.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-cyan-500 text-white text-lg font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow-lg"
      >
        Empezar
      </button>
      {!config.soundEnabled && (
        <p className="mt-4 text-sm text-gray-500">
          El sonido está desactivado.
          <br /> Puedes activarlo en la configuración.
        </p>
      )}
    </div>
  );
}
