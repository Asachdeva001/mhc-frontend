'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareHeart, BarChart3, Sparkles, UserPlus, PencilLine, BotMessageSquare } from 'lucide-react';

// Updated background gradient with a green theme
const BackgroundGradient = () => (
  <div className="absolute inset-0 -z-10 bg-sanctuary-sand" />
);


// Reusable component for feature cards (styles are theme-agnostic)
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
        <div className="p-4 bg-white rounded-full shadow-sanctuary">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-sanctuary-slate mb-2 font-quicksand">{title}</h3>
      <p className="text-sanctuary-slate/80 leading-relaxed font-nunito">{text}</p>
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
    <div className="relative min-h-screen w-full font-sans text-gray-800 overflow-x-hidden">
      <BackgroundGradient />
      
      {/* NAVBAR WITH GREEN THEME */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        animate={{
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
          boxShadow: scrolled ? '0 4px_6px -1px rgba(0, 0, 0, 0.05)' : 'none',
        }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sanctuary-slate font-quicksand">
            Mental<span className="text-sanctuary-sage">Buddy</span>
          </Link>
          <nav className="flex items-center space-x-2 md:space-x-4">
            <Link href="/auth/signin" className="px-4 py-2 text-sanctuary-slate/80 hover:text-sanctuary-sage transition-sanctuary rounded-full hover:bg-sanctuary-misty/20 font-nunito">
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/signup" className="bg-[#52796F] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#3d5a52] transition-sanctuary shadow-sanctuary hover:shadow-sanctuary-hover font-quicksand">
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
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-sanctuary-slate mb-6 leading-tight font-quicksand"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span className="block" variants={heroItemVariants}>A helping hand for a</motion.span>
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-sanctuary-sage to-[#52796F] block"
              variants={heroItemVariants}
            >
              healthier mind
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-sanctuary-slate/80 mb-12 max-w-3xl mx-auto tracking-wide font-nunito"
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
            whileHover={{ scale: 1.05, boxShadow: '0px 15px 30px -10px rgba(132, 169, 140, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/auth/signup"
              className="bg-[#52796F] text-white font-bold py-4 px-10 rounded-full text-lg transition-sanctuary shadow-sanctuary hover:bg-[#3d5a52] font-quicksand"
            >
              Get Started for Free
            </Link>
          </motion.div>
        </section>
        
        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-sanctuary-slate font-quicksand">Everything you need to feel your best</h2>
             <p className="text-md text-sanctuary-slate/70 mt-2 font-nunito">Discover tools designed for your well-being.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquareHeart size={32} className="text-sanctuary-sage" />}
              title="AI Chat Support"
              text="Get instant, compassionate, and personalized mental health support whenever you need it."
              delay={0.1}
            />
            <FeatureCard
              icon={<BarChart3 size={32} className="text-[#52796F]" />}
              title="Mood Tracking"
              text="Log your emotional patterns with insightful analytics to understand your journey and progress."
              delay={0.2}
            />
            <FeatureCard
              icon={<Sparkles size={32} className="text-sanctuary-sage-light" />}
              title="Wellness Activities"
              text="Explore a library of guided meditations, breathing exercises, and activities to boost your wellbeing."
              delay={0.3}
            />
          </div>
        </section>

         {/* How It Works Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sanctuary-slate font-quicksand">Get started in 3 simple steps</h2>
            <p className="text-md text-sanctuary-slate/70 mt-2 font-nunito">Your journey to a better mind is just moments away.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div initial={{y: 20, opacity: 0}} whileInView={{y: 0, opacity: 1}} transition={{delay: 0.1}} viewport={{ once: true }}>
              <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-white rounded-full shadow-sanctuary border border-sanctuary-misty/30">
                <UserPlus size={32} className="text-sanctuary-sage" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-sanctuary-slate font-quicksand">1. Create Account</h3>
              <p className="text-sanctuary-slate/80 font-nunito">Sign up for free and tell us a little about your goals.</p>
            </motion.div>
            <motion.div initial={{y: 20, opacity: 0}} whileInView={{y: 0, opacity: 1}} transition={{delay: 0.2}} viewport={{ once: true }}>
              <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-white rounded-full shadow-sanctuary border border-sanctuary-misty/30">
                <PencilLine size={32} className="text-[#52796F]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-sanctuary-slate font-quicksand">2. Log Your Moods</h3>
              <p className="text-sanctuary-slate/80 font-nunito">Start tracking your feelings and activities to find patterns.</p>
            </motion.div>
            <motion.div initial={{y: 20, opacity: 0}} whileInView={{y: 0, opacity: 1}} transition={{delay: 0.3}} viewport={{ once: true }}>
              <div className="flex justify-center items-center mb-4 h-16 w-16 mx-auto bg-white rounded-full shadow-sanctuary border border-sanctuary-misty/30">
                <BotMessageSquare size={32} className="text-sanctuary-sage-light" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-sanctuary-slate font-quicksand">3. Chat with Buddy</h3>
              <p className="text-sanctuary-slate/80 font-nunito">Talk to your AI companion anytime you need support or guidance.</p>
            </motion.div>
          </div>
        </section>

      </main>
    </div>
  );
}