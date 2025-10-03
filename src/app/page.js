'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { useEffect, useState } from 'react'; // Import useState
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareHeart, BarChart3, Sparkles, UserPlus, PencilLine, BotMessageSquare } from 'lucide-react';

// This component remains the same
const BackgroundGradient = () => (
  <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-100 via-purple-100 to-cyan-100" />
);


// Reusable component for feature cards (with added hover effect)
const FeatureCard = ({ icon, title, text, delay }) => {
  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 40, damping: 10, delay },
    },
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-white/20"
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.5 }}
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex justify-center items-center mb-4">
        <div className="p-4 bg-white rounded-full shadow-md">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </motion.div>
  );
};


export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Effect to handle scroll detection for the navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading your space...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Redirecting...
  }
  
  // Animation variants for the hero text
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const heroItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    // FIX: Added `relative` class here to contain the absolute blobs
    <div className="relative min-h-screen w-full font-sans text-gray-800 animated-gradient overflow-x-hidden">
      <BackgroundGradient />
      
      {/* IMPROVED NAVBAR */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        animate={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Mental<span className="text-blue-500">Buddy</span>
          </Link>
          <nav className="flex items-center space-x-2 md:space-x-4">
            <Link href="/auth/signin" className="px-4 py-2 text-gray-600 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-900/5">
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/signup" className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/30">
                Sign Up
              </Link>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      <main className="pt-28 md:pt-32 relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span className="block" variants={heroItemVariants}>A helping hand for a</motion.span>
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 block"
              variants={heroItemVariants}
            >
              healthier mind
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your personal AI companion for tracking moods, practicing mindfulness, and finding support whenever you need it.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: '0px 15px 30px -10px rgba(71, 145, 255, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/auth/signup"
              className="bg-blue-500 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 shadow-xl"
            >
              Get Started for Free
            </Link>
          </motion.div>
        </section>
        
        {/* All other sections (Features, How it Works, etc.) remain the same */}
        {/* ... (Paste the rest of the sections from the previous code here) ... */}
        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Everything you need to feel your best</h2>
             <p className="text-md text-gray-500 mt-2">Discover tools designed for your well-being.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquareHeart size={32} className="text-purple-500" />}
              title="AI Chat Support"
              text="Get instant, compassionate, and personalized mental health support whenever you need it."
              delay={0.1}
            />
            <FeatureCard
              icon={<BarChart3 size={32} className="text-blue-500" />}
              title="Mood Tracking"
              text="Log your emotional patterns with insightful analytics to understand your journey and progress."
              delay={0.2}
            />
            <FeatureCard
              icon={<Sparkles size={32} className="text-cyan-500" />}
              title="Wellness Activities"
              text="Explore a library of guided meditations, breathing exercises, and activities to boost your wellbeing."
              delay={0.3}
            />
          </div>
        </section>

         {/* How It Works Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Get started in 3 simple steps</h2>
            <p className="text-md text-gray-500 mt-2">Your journey to a better mind is just moments away.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div initial={{y: 20, opacity: 0}} whileInView={{y: 0, opacity: 1}} transition={{delay: 0.1}} viewport={{ once: true }}>
              <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-white rounded-full shadow-lg border">
                <UserPlus size={32} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Account</h3>
              <p className="text-gray-600">Sign up for free and tell us a little about your goals.</p>
            </motion.div>
            <motion.div initial={{y: 20, opacity: 0}} whileInView={{y: 0, opacity: 1}} transition={{delay: 0.2}} viewport={{ once: true }}>
              <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-white rounded-full shadow-lg border">
                <PencilLine size={32} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Log Your Moods</h3>
              <p className="text-gray-600">Start tracking your feelings and activities to find patterns.</p>
            </motion.div>
            <motion.div initial={{y: 20, opacity: 0}} whileInView={{y: 0, opacity: 1}} transition={{delay: 0.3}} viewport={{ once: true }}>
              <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-white rounded-full shadow-lg border">
                <BotMessageSquare size={32} className="text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Chat with Buddy</h3>
              <p className="text-gray-600">Talk to your AI companion anytime you need support or guidance.</p>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
}