import { getSessionUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSessionUser();

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
        Settings
      </h1>
      <section className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Profile
        </h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Email</dt>
            <dd className="text-slate-900 dark:text-slate-100 font-medium">{user.email}</dd>
          </div>
          {user.name && (
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Name</dt>
              <dd className="text-slate-900 dark:text-slate-100 font-medium">{user.name}</dd>
            </div>
          )}
        </dl>
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
          Password reset and profile changes are managed by your identity provider (Kinde). Use the same email to sign in; contact your admin or use Kinde&apos;s account dashboard if you need to update your password or details.
        </p>
      </section>
    </div>
  );
}
