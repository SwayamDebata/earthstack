export default function StatusBadge({ label, tone = 'info' }: { label: string; tone?: 'info' | 'warning' | 'critical' | 'success' }) {
  const toneClass =
    tone === 'info'
      ? 'bg-blue-500/20 text-blue-200'
      : tone === 'warning'
        ? 'bg-amber-500/20 text-amber-200'
        : tone === 'critical'
          ? 'bg-red-500/20 text-red-200'
          : 'bg-emerald-500/20 text-emerald-200';

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  );
}
