import Link from 'next/link';
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/components';

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
        Sign in
      </h1>
      <div className="space-y-4">
        <LoginLink
          postLoginRedirectURL="/dashboard"
          className="block w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 text-sm font-medium text-center hover:opacity-90"
        >
          Sign in with Kinde
        </LoginLink>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <RegisterLink
            postLoginRedirectURL="/dashboard"
            className="font-medium text-slate-900 dark:text-slate-200 hover:underline"
          >
            Sign up
          </RegisterLink>
        </p>
      </div>
    </>
  );
}
