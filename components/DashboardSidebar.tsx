'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/agents', label: 'Agents' },
  { href: '/settings', label: 'Settings' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useKindeBrowserClient();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Clawbot
        </Link>
      </div>
      <nav className="p-2 flex-1">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === href
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signed in as</p>
        <p className="text-xs text-slate-700 dark:text-slate-300 truncate mb-2" title={user?.email ?? ''}>
          {user?.email ?? '…'}
        </p>
        <LogoutLink className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
          Sign out
        </LogoutLink>
      </div>
    </aside>
  );
}
