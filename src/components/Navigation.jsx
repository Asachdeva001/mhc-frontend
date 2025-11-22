'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/authContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, PlusCircle, Leaf, LogOut, ChevronDown, Menu, X } from 'lucide-react';

// A cleaner way to manage navigation links
const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, pageName: 'dashboard' },
  { href: '/chat', label: 'Chat', icon: MessageSquare, pageName: 'chat' },
  { href: '/activities', label: 'Activities', icon: PlusCircle, pageName: 'activities' },
];

export default function Navigation({ currentPage = '' }) {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Hook to close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (currentPage === 'auth' || loading) {
    return null; // Don't show nav on auth pages or during initial auth load
  }

  return (
    <nav className="sticky top-0 z-50 glass-morphism border-b border-sanctuary-misty/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Desktop Nav Links */}
          <div className="flex items-center space-x-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2 text-sanctuary-slate">
              <Leaf className="h-6 w-6 text-sanctuary-sage" />
              <span className="font-semibold text-lg font-nunito">Mental Buddy</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-3xl text-sm font-medium transition-sanctuary ${
                    currentPage === link.pageName
                      ? 'bg-sanctuary-sage/20 text-sanctuary-sage shadow-sanctuary'
                      : 'text-sanctuary-slate hover:bg-sanctuary-misty/30'
                  }`}
                >
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: User Menu or Sign In buttons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-sanctuary-misty/30 transition-sanctuary"
                >
                  <div className="w-9 h-9 bg-sanctuary-sage/30 rounded-full flex items-center justify-center text-sanctuary-sage font-semibold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-sanctuary-slate">
                    {user?.name?.split(' ')[0] || user?.email}
                  </span>
                  <ChevronDown size={16} className="text-sanctuary-slate/60" />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right neumorphic rounded-3xl focus:outline-none"
                    >
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-sanctuary-misty/30">
                          <p className="text-sm font-semibold text-sanctuary-slate truncate">{user?.name}</p>
                          <p className="text-xs text-sanctuary-slate/60 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 transition-sanctuary rounded-2xl"
                        >
                          <LogOut size={14} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium text-sanctuary-slate hover:bg-sanctuary-misty/30 rounded-3xl transition-sanctuary">Sign In</Link>
                <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium text-white bg-sanctuary-sage hover:bg-sanctuary-sage/80 rounded-3xl transition-sanctuary shadow-sanctuary">Sign Up</Link>
              </div>
            )}
            {/* Mobile Menu Button */}
            <div className="md:hidden ml-2" ref={mobileMenuRef}>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full text-sanctuary-slate hover:bg-sanctuary-misty/30 transition-sanctuary touch-target">
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-2 pb-4 space-y-1">
                {isAuthenticated ? (
                  navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-3xl text-base font-medium transition-sanctuary touch-target ${
                        currentPage === link.pageName
                          ? 'bg-sanctuary-sage/20 text-sanctuary-sage shadow-sanctuary'
                          : 'text-sanctuary-slate hover:bg-sanctuary-misty/30'
                      }`}
                    >
                      <link.icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-base font-medium text-sanctuary-slate hover:bg-sanctuary-misty/30 rounded-3xl transition-sanctuary touch-target">Sign In</Link>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-left px-4 py-2 text-base font-medium text-white bg-sanctuary-sage hover:bg-sanctuary-sage/80 rounded-3xl transition-sanctuary shadow-sanctuary touch-target">Sign Up</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}