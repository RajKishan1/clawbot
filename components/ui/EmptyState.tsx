import Link from 'next/link';

type EmptyStateProps = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export default function EmptyState({
  message,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  const action =
    actionLabel && (actionHref || onAction) ? (
      actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          {actionLabel}
        </button>
      )
    ) : null;

  return (
    <div
      className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center ${className}`}
    >
      <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
      {action}
    </div>
  );
}
