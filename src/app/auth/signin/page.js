'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';

import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { ImSpinner9 } from 'react-icons/im';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center">
        <ImSpinner9 className="text-4xl text-emerald-600 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">Checking Session...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sanctuary-sand flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-block neumorphic text-sanctuary-slate font-semibold px-5 py-2 rounded-3xl text-sm hover:shadow-sanctuary-hover transition-sanctuary mb-4 font-quicksand"
          >
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-sanctuary-slate font-quicksand">Welcome Back</h1>
          <p className="text-sanctuary-slate/70 mt-1 font-nunito">Sign in to continue your journey</p>
        </div>

        {/* Card with Neumorphism for consistency */}
        <div className="neumorphic rounded-3xl p-8">
          {error && (
            <div className="flex items-center mb-4 p-3 bg-red-50 rounded-3xl text-red-600 text-sm border border-red-200 font-nunito">
              <FiAlertCircle className="mr-2 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sanctuary-slate/60">
                <FiMail />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sanctuary-slate w-full pl-10 pr-3 py-2.5 bg-white/90 border border-sanctuary-misty/40 rounded-3xl focus:outline-none focus-sanctuary transition-sanctuary font-nunito placeholder:text-sanctuary-slate/40"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sanctuary-slate/60">
                <FiLock />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sanctuary-slate w-full pl-10 pr-3 py-2.5 bg-white/90 border border-sanctuary-misty/40 rounded-3xl focus:outline-none focus-sanctuary transition-sanctuary font-nunito placeholder:text-sanctuary-slate/40"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#52796F] hover:bg-[#3d5a52] text-white font-semibold py-3 px-4 rounded-3xl transition-sanctuary flex items-center justify-center disabled:bg-sanctuary-misty/50 disabled:cursor-not-allowed shadow-sanctuary touch-target font-quicksand"
            >
              {isLoading ? (
                <>
                  <ImSpinner9 className="animate-spin mr-2" /> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign Up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-sanctuary-slate/80 font-nunito">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-[#52796F] hover:text-sanctuary-sage transition-sanctuary">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}