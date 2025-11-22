'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind } from 'lucide-react';

// --- Helper Data & Functions ---
const PREP_STEPS = [
  "Take a moment to settle in.",
  "Find a comfortable position.",
  "Gently soften your gaze.",
  "You're ready to begin.",
];

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};


// --- The Breathing Animation Component ---
const BreathingAnimation = ({ children }) => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer pulsing glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-full h-full bg-sanctuary-sage/30 rounded-full"
      />
      {/* Main breathing circle */}
      <motion.div
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-48 h-48 bg-gradient-to-br from-sanctuary-misty to-sanctuary-sage/30 rounded-full shadow-sanctuary"
      />
      {/* Static inner circle for contrast */}
      <div className="absolute w-40 h-40 bg-sanctuary-sand/80 rounded-full backdrop-blur-sm" />
      {/* Content (Timer and Text) */}
      <div className="relative z-10 text-center">
        {children}
      </div>
    </div>
  );
};


// --- Main Activity Modal Component ---
export default function ActivityModal({ activity, onComplete, onClose }) {
  const [phase, setPhase] = useState('prepare'); // 'prepare', 'active'
  const [prepStepIndex, setPrepStepIndex] = useState(0);
  
  // Using your original logic to parse duration
  const durationInSeconds = (() => {
    const match = activity?.duration?.match(/(\d+)/);
    return match ? Number(match[1]) * 60 : 300; // Default to 5 mins if parse fails
  })();
  
  const [timeRemaining, setTimeRemaining] = useState(durationInSeconds);

  // Effect for the preparation phase instruction sequence
  useEffect(() => {
    if (phase === 'prepare' && prepStepIndex < PREP_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setPrepStepIndex(prepStepIndex + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, prepStepIndex]);
  
  // Effect for the main activity timer
  useEffect(() => {
    if (phase === 'active' && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (phase === 'active' && timeRemaining === 0) {
      onComplete(activity.id);
      onClose();
    }
  }, [phase, timeRemaining, activity.id, onComplete, onClose]);

  // Effect for 'Escape' key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative w-full max-w-lg neumorphic rounded-3xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-sanctuary-slate/60 hover:text-sanctuary-slate transition-sanctuary touch-target">
          <X size={24} />
        </button>
        
        <div className="flex justify-center items-center gap-3 mb-2">
            <Wind className="text-sanctuary-sage" />
            <h2 className="text-3xl font-bold text-sanctuary-slate font-quicksand">{activity.title}</h2>
        </div>
        <p className="text-sanctuary-slate/70 mb-8 max-w-md mx-auto font-nunito">{activity.description}</p>
        
        <div className="h-64 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'prepare' ? (
              <motion.div key="prepare" /* ... (Preparation phase unchanged) ... */ >
                 <AnimatePresence mode="wait">
                   <motion.p
                     key={prepStepIndex}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.5 }}
                     className="text-2xl text-sanctuary-slate font-nunito"
                   >
                     {PREP_STEPS[prepStepIndex]}
                   </motion.p>
                 </AnimatePresence>
                 {prepStepIndex === PREP_STEPS.length - 1 && (
                   <motion.button
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 1 }}
                     onClick={() => setPhase('active')}
                     className="mt-8 bg-[#52796F] hover:bg-[#3d5a52] text-white font-bold py-3 px-8 rounded-full transition-sanctuary transform hover:scale-105 shadow-sanctuary touch-target font-quicksand"
                   >
                     Begin
                   </motion.button>
                 )}
              </motion.div>
            ) : (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BreathingAnimation>
                  <p className="font-mono text-5xl font-bold text-sanctuary-slate tracking-tighter">
                    {formatTime(timeRemaining)}
                  </p>
                  <AnimatePresence mode="wait">
                  </AnimatePresence>
                </BreathingAnimation>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}