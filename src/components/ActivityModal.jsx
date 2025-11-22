'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind } from 'lucide-react';

// Import activity-specific components
import BreathingExercise from './activities/BreathingExercise';
import Meditation from './activities/Meditation';
import Doodle from './activities/Doodle';
import MusicListening from './activities/MusicListening';
import Stretching from './activities/Stretching';
import DanceBreak from './activities/DanceBreak';
import TimedActivityWrapper from './TimedActivityWrapper';

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

// --- Victory Animation Component ---
const VictoryAnimation = ({ onComplete, onClose, activityId }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // First record the activity completion, then close
      if (onComplete) {
        onComplete(activityId);
      }
      // Immediately close to show victory screen clearly
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 50); // Reduced from 100ms for faster close
    }, 3500); // Reduced from 4000ms to show victory longer relative to screen
    return () => clearTimeout(timer);
  }, [onComplete, onClose, activityId]);

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

// Define which activities use TimedActivityWrapper
const TIMED_ACTIVITIES = ['breathing-exercise', 'meditation', 'music-listening', 'dance-break', 'stretching'];
const ACTIVITY_DEFAULTS = {
  'breathing-exercise': { duration: 300, prepPhase: true },     // 5 minutes
  'meditation': { duration: 300, prepPhase: true },              // 5 minutes (default)
  'music-listening': { duration: 300, prepPhase: false },        // 5 minutes (default)
  'dance-break': { duration: 300, prepPhase: false },            // 5 minutes
  'stretching': { duration: 300, prepPhase: false },             // 5 minutes
  'doodle': { duration: 0, prepPhase: false },
};

// --- Main Activity Modal Component ---
export default function ActivityModal({ activity, onComplete, onClose }) {
  const isTimed = TIMED_ACTIVITIES.includes(activity.id);
  const showPrepPhase = isTimed && ACTIVITY_DEFAULTS[activity.id]?.prepPhase;
  const defaultDuration = ACTIVITY_DEFAULTS[activity.id]?.duration || 300;

  const [phase, setPhase] = useState(showPrepPhase ? 'prepare' : 'active'); // 'prepare', 'active'
  const [prepStepIndex, setPrepStepIndex] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  
  // Check if activity is incomplete (resuming from saved state)
  const isResuming = activity.isIncomplete && activity.incompleteSavedState;
  const savedState = isResuming ? activity.incompleteSavedState : null;

  // Effect for the preparation phase instruction sequence (only for breathing & meditation)
  useEffect(() => {
    if (!showPrepPhase) return;
    if (phase === 'prepare' && prepStepIndex < PREP_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setPrepStepIndex(prepStepIndex + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, prepStepIndex, showPrepPhase]);

  // Handle close - no additional cleanup needed (TimedActivityWrapper or components handle it)
  const handleClose = () => {
    onClose();
  };

  // Handle completion with victory animation for timed activities
  const handleActivityComplete = (activityId) => {
    if (isTimed) {
      setShowVictory(true);
    } else {
      // Non-timed activities complete immediately
      onComplete(activityId);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {showVictory && (
          <VictoryAnimation onComplete={onComplete} onClose={onClose} activityId={activity.id} />
        )}
      </AnimatePresence>
      
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
                    <motion.p
                      key={prepStepIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="text-xl sm:text-2xl text-slate-600"
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
                      className="mt-8 bg-gradient-to-r from-teal-500 to-sky-600 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-lg text-sm sm:text-base"
                    >
                      Begin
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                // Non-timed activities (doodle, etc.)
                <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {getActivityComponent(activity.id)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// Helper to get activity component
function getActivityComponent(activityId) {
  switch (activityId) {
    case 'breathing-exercise':
      return BreathingExercise;
    case 'meditation':
      return Meditation;
    case 'doodle':
      return Doodle;
    case 'music-listening':
      return MusicListening;
    case 'stretching':
      return Stretching;
    case 'dance-break':
      return DanceBreak;
    default:
      return null;
  }
}