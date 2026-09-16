export default function LoadingState() {
  return (
    <div
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-md"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
        />
        <p className="text-sm font-medium text-white/85">Buscando previsão do tempo...</p>
      </div>
    </div>
  );
}
