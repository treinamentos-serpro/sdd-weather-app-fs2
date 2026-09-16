interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-2xl shadow-black/20 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/75">{hint}</p>
    </div>
  );
}
