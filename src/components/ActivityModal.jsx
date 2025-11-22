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
      if (onComplete) {
        onComplete(activityId);
      }
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 50);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete, onClose, activityId]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center z-50 bg-sanctuary-sand/80 backdrop-blur-sm rounded-3xl"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h3 className="text-2xl font-bold text-sanctuary-slate font-nunito mb-2">Well Done!</h3>
        <p className="text-sanctuary-slate/70 font-quicksand">Activity completed</p>
      </div>
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

// Helper to get activity component
const getActivityComponent = (activityId) => {
  switch (activityId) {
    case 'breathing-exercise':
      return BreathingExercise;
    case 'meditation':
      return Meditation;
    case 'music-listening':
      return MusicListening;
    case 'stretching':
      return Stretching;
    case 'dance-break':
      return DanceBreak;
    case 'doodle':
      return Doodle;
    default:
      return null;
  }
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
  
  // Get the component for this activity
  const ActivityComponent = getActivityComponent(activity.id);

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
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative w-full max-w-2xl max-h-[90vh] frosted-glass rounded-3xl p-6 sm:p-8 md:p-10 text-center border-2 border-white/40 shadow-2xl overflow-y-auto my-4"
          onClick={(e) => e.stopPropagation()}
        >
        <motion.button 
          onClick={onClose} 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-sanctuary-slate/60 hover:text-sanctuary-slate hover:bg-white transition-all shadow-lg"
        >
          <X size={20} />
        </motion.button>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sanctuary-sage/30 to-sanctuary-misty/40 flex items-center justify-center shadow-lg">
              <Wind className="text-sanctuary-sage" size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-sanctuary-slate font-nunito text-center sm:text-left">{activity.title}</h2>
        </div>
        <p className="text-sanctuary-slate/70 mb-8 max-w-2xl mx-auto font-quicksand text-base sm:text-lg px-4">{activity.description}</p>
        
        <div className="h-64 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'prepare' ? (
              <motion.div key="prepare" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
            ) : phase === 'active' ? (
              isTimed ? (
                <TimedActivityWrapper
                  activity={activity}
                  ActivityComponent={ActivityComponent}
                  initialDuration={defaultDuration}
                  onComplete={handleActivityComplete}
                  onClose={onClose}
                  isResuming={isResuming}
                  savedState={savedState}
                />
              ) : (
                <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {ActivityComponent && <ActivityComponent onComplete={() => handleActivityComplete(activity.id)} />}
                </motion.div>
              )
            ) : null}
          </AnimatePresence>
        </div>
        </motion.div>
      </motion.div>
    </>
  );
}