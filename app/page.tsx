import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
        Clawbot
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
        AI Agent Deployment Platform
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
