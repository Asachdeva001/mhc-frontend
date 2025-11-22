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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        className="relative w-full max-w-md"
        initial={{ scale: 0, rotateZ: -20 }}
        animate={{ scale: 1, rotateZ: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Main celebration circle */}
        <motion.div
          className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl relative"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Checkmark */}
          <motion.svg
            className="w-32 h-32 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.div>

        {/* Victory text */}
        <motion.h2
          className="text-4xl font-bold text-center mt-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          🎉 Great Job! 🎉
        </motion.h2>

        <motion.p
          className="text-center text-white/90 mt-3 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Activity Completed!
        </motion.p>

        {/* Confetti-like particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'][i % 5],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{
              opacity: 0,
              y: Math.random() * 200 - 100,
              x: Math.random() * 200 - 100,
              scale: [1, 0.5],
            }}
            transition={{
              duration: 2,
              ease: 'easeOut',
              delay: Math.random() * 0.5,
            }}
          />
        ))}

        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 w-64 h-64 mx-auto rounded-full border-4 border-emerald-400"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
        />
      </motion.div>
    </motion.div>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={showVictory ? undefined : handleClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-50 rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
          
          <div className="flex justify-center items-center gap-3 mb-2">
            <Wind className="text-teal-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{activity.title}</h2>
          </div>
          <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm sm:text-base">{activity.description}</p>
          
          <div className="flex-1 overflow-y-auto flex items-center justify-center min-h-64">
            <AnimatePresence mode="wait">
              {isTimed ? (
                // Timed activities use wrapper
                <motion.div
                  key="timed-activity"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <TimedActivityWrapper
                    activity={activity}
                    ActivityComponent={getActivityComponent(activity.id)}
                    initialDuration={defaultDuration}
                    onComplete={handleActivityComplete}
                    onClose={handleClose}
                    isResuming={isResuming}
                    savedState={savedState}
                  />
                </motion.div>
              ) : phase === 'prepare' ? (
                // Preparation phase (for breathing & meditation if needed)
                <motion.div key="prepare" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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