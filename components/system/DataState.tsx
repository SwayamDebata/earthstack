'use client';

type DataStateProps = {
  state: 'loading' | 'empty' | 'error';
  title: string;
  description: string;
  onRetry?: () => void;
};

export default function DataState({ state, title, description, onRetry }: DataStateProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      {state === 'loading' ? <div className="mt-3 h-2 w-28 bg-slate-700 rounded animate-pulse" /> : null}
      {state === 'error' && onRetry ? (
        <button onClick={onRetry} className="mt-4 rounded-md bg-slate-100 text-slate-950 px-3 py-1 text-sm">
          Retry
        </button>
      ) : null}
    </div>
  );
}
