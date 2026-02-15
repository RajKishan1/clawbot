import Link from 'next/link';
import { RegisterLink, LoginLink } from '@kinde-oss/kinde-auth-nextjs/components';

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
        Sign up
      </h1>
      <div className="space-y-4">
        <RegisterLink
          postLoginRedirectURL="/dashboard"
          className="block w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 text-sm font-medium text-center hover:opacity-90"
        >
          Sign up with Kinde
        </RegisterLink>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <LoginLink
            postLoginRedirectURL="/dashboard"
            className="font-medium text-slate-900 dark:text-slate-200 hover:underline"
          >
            Sign in
          </LoginLink>
        </p>
      </div>
    </>
  );
}
