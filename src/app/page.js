'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-800 mb-2">Loading...</div>
          <div className="text-gray-600">Please wait while we check your authentication</div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header with Auth */}
        <div className="absolute top-4 right-4">
          <div className="flex space-x-2">
            <Link
              href="/auth/signin"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Mental Buddy
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered wellness companion
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Take care of your mental health with personalized support, 
            mood tracking, and wellness activities designed just for you.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signin"
            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Chat Support</h3>
            <p className="text-gray-600">Get instant, personalized mental health support whenever you need it.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Mood Tracking</h3>
            <p className="text-gray-600">Track your emotional patterns and see your progress over time.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🧘</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Wellness Activities</h3>
            <p className="text-gray-600">Discover activities and exercises to boost your mental wellbeing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}