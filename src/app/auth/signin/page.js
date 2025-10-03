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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
        <ImSpinner9 className="text-4xl text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800">Checking Session...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-block bg-blue-100 text-blue-800 font-semibold px-5 py-2 rounded-full text-sm hover:bg-blue-200 transition-colors duration-300 shadow-sm mb-4"
          >
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200/80">
          {error && (
            <div className="flex items-center mb-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
              <FiAlertCircle className="mr-2 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <FiMail />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-gray-700 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-gray-700 w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-blue-400"
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
            <p className="text-sm text-gray-700">
              Don’t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-800">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
