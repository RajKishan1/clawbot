import { redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardGuard from '@/components/DashboardGuard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  return (
    <DashboardGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </DashboardGuard>
  );
}
