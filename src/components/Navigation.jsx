'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { useRouter } from 'next/navigation';

export default function Navigation({ currentPage = '' }) {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Don't show navigation on auth pages
  if (currentPage === 'auth') {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            ← Mental Buddy
          </Link>
          {isAuthenticated && (
            <h1 className="text-2xl font-bold text-gray-800">
              {currentPage === 'chat' && 'Chat'}
              {currentPage === 'activities' && 'Activities'}
              {currentPage === 'dashboard' && 'Dashboard'}
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : isAuthenticated ? (
            <>
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-2">
              <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'dashboard' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'chat' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Chat
                </Link>
                <Link
                  href="/activities"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'activities' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Activities
                </Link>
                
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name || user?.email}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex space-x-2">
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
