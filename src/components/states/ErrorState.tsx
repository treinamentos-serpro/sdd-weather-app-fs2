interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      aria-describedby="weather-error-message"
      aria-labelledby="weather-error-title"
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-md"
      role="alert"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white" id="weather-error-title">
            Não foi possível carregar o clima
          </h2>
          <p className="mt-1 text-sm text-white/75" id="weather-error-message">
            {message}
          </p>
        </div>
        <button
          className="min-h-11 rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-night-900 transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
          onClick={onRetry}
          type="button"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
