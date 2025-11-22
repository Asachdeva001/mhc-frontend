'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/authContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, PlusCircle, Gamepad2, Leaf, LogOut, ChevronDown, Menu, X, HandMetal } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, pageName: 'dashboard' },
  { href: '/chat', label: 'Chat', icon: MessageSquare, pageName: 'chat' },
  { href: '/activities', label: 'Activities', icon: PlusCircle, pageName: 'activities' },
  { href: '/anti-stress-games', label: 'Games', icon: Gamepad2, pageName: 'anti-stress-games' },
  { href: '/community', label: 'Community', icon: HandMetal, pageName: 'community' },
];

export default function Navigation({ currentPage = '' }) {
  const { user, isAuthenticated, loading, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- THEME LOGIC ---
  const isCommunity = currentPage === 'community';

  // Theme Configuration
  const theme = {
    // Nav Background: Dark Slate for Community (as requested), White for others
    navBg: isCommunity 
      ? 'bg-slate-900/95 border-slate-800 shadow-md' 
      : 'bg-white/80 border-slate-200/80',
    
    // Text Colors
    text: isCommunity ? 'text-slate-300' : 'text-slate-600',
    textHover: isCommunity ? 'hover:bg-slate-800 hover:text-teal-300' : 'hover:bg-slate-100',
    
    // Active Link
    activeLink: isCommunity 
      ? 'bg-teal-900/40 text-teal-400 border border-teal-500/20' 
      : 'bg-teal-50 text-teal-600',
    
    // Logo
    logoIcon: isCommunity ? 'text-teal-400' : 'text-teal-600',
    logoText: isCommunity ? 'text-slate-100' : 'text-slate-800',
    
    // Avatar & User Menu
    avatarBg: isCommunity ? 'bg-slate-800 text-teal-400 ring-2 ring-slate-700' : 'bg-teal-100 text-teal-700',
    dropdownBg: isCommunity ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200',
    dropdownTextMain: isCommunity ? 'text-slate-200' : 'text-slate-800',
    dropdownTextSub: isCommunity ? 'text-slate-500' : 'text-slate-500',
    dropdownHover: isCommunity ? 'hover:bg-slate-800' : 'hover:bg-slate-50',

    // Buttons
    btnPrimary: isCommunity 
      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white' 
      : 'bg-teal-600 hover:bg-teal-700 text-white',
      
    // Mobile Menu Button
    menuBtn: isCommunity ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
  };
  // -------------------

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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
    return null; 
  }

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-all duration-500 ${theme.navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className={`flex items-center space-x-2 transition-colors ${theme.logoText}`}>
              <Leaf className={`h-6 w-6 transition-colors ${theme.logoIcon}`} />
              <span className="font-semibold text-lg tracking-tight">Mental Buddy</span>
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated && navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    currentPage === link.pageName
                      ? theme.activeLink
                      : `${theme.text} ${theme.textHover}`
                  }`}
                >
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 p-1 rounded-full transition-colors ${theme.textHover}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold transition-colors ${theme.avatarBg}`}>
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <span className={`hidden md:block text-sm font-medium transition-colors ${theme.text}`}>
                    {user?.name?.split(' ')[0] || user?.email}
                  </span>
                  <ChevronDown size={16} className={isCommunity ? "text-slate-500" : "text-slate-400"} />
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl shadow-xl border focus:outline-none overflow-hidden ${theme.dropdownBg}`}
                    >
                      <div className="py-1">
                        <div className={`px-4 py-3 border-b ${isCommunity ? 'border-slate-800' : 'border-slate-100'}`}>
                          <p className={`text-sm font-semibold truncate ${theme.dropdownTextMain}`}>{user?.name}</p>
                          <p className={`text-xs truncate ${theme.dropdownTextSub}`}>{user?.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className={`w-full flex items-center space-x-2 text-left px-4 py-2 text-sm text-red-500 transition-colors ${theme.dropdownHover}`}
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
                <Link href="/auth/signin" className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${theme.text} ${theme.textHover}`}>Sign In</Link>
                <Link href="/auth/signup" className={`px-4 py-2 text-sm font-medium rounded-full transition-colors shadow-sm ${theme.btnPrimary}`}>Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-2" ref={mobileMenuRef}>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-full transition-colors ${theme.menuBtn}`}>
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
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                        currentPage === link.pageName
                          ? theme.activeLink
                          : `${theme.text} ${theme.textHover}`
                      }`}
                    >
                      <link.icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className={`block w-full text-left px-4 py-2 text-base font-medium rounded-lg ${theme.text} ${theme.textHover}`}>Sign In</Link>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)} className={`block w-full text-left px-4 py-2 text-base font-medium rounded-lg ${theme.btnPrimary}`}>Sign Up</Link>
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