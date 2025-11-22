'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * BreathingExercise - Visualization component only
 * No state management - all handled by TimedActivityWrapper
 * 
 * Props from wrapper:
 * - activity: Activity object
 * - timeRemaining: Current time in seconds
 * - totalTime: Total duration in seconds
 * - isPaused: Whether activity is paused
 * - formatTime: Time formatter function
 */
export default function BreathingExercise({
  activity,
  timeRemaining,
  totalTime,
  isPaused,
  formatTime,
}) {
  const [breathPhase, setBreathPhase] = useState('in');
  const phaseRef = useRef(breathPhase);

  useEffect(() => {
    phaseRef.current = breathPhase;
  }, [breathPhase]);

  // Breathing cycle: toggle inhale/exhale every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setBreathPhase(prev => (prev === 'in' ? 'out' : 'in'));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="w-full max-w-md mx-auto relative flex flex-col items-center justify-center gap-8 py-8">
      {/* Outer glow ring */}
      <motion.div
        animate={!isPaused ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
        transition={!isPaused ? { duration: 12, times: [0, 0.5, 1], ease: 'easeInOut', repeat: Infinity } : { duration: 0 }}
        className="absolute w-80 h-80 rounded-full bg-gradient-to-br from-sanctuary-sage/20 to-teal-500/20 blur-2xl"
      />
      
      {/* Main breathing circle */}
      <motion.div
        animate={!isPaused ? { scale: [1, 1.3, 1] } : (breathPhase === 'in' ? { scale: 1.3 } : { scale: 1 })}
        transition={!isPaused ? { duration: 12, times: [0, 0.5, 1], ease: 'easeInOut', repeat: Infinity } : { duration: 0 }}
        className="relative w-64 h-64 rounded-full bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border-4 border-white/60 shadow-2xl flex items-center justify-center"
      >
        {/* Inner gradient circle */}
        <motion.div
          animate={!isPaused ? { rotate: 360 } : {}}
          transition={!isPaused ? { duration: 20, ease: 'linear', repeat: Infinity } : {}}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-sanctuary-sage/30 via-teal-400/20 to-sky-400/30"
        />
        
        {/* Center text */}
        <div className="relative z-10 text-center">
          <motion.div
            key={breathPhase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sanctuary-sage to-teal-600 bg-clip-text text-transparent select-none font-nunito"
          >
            {breathPhase === 'in' ? 'Breathe In' : 'Breathe Out'}
          </motion.div>
          <div className="text-sm text-sanctuary-slate/60 mt-2 font-quicksand">
            {breathPhase === 'in' ? 'Inhale slowly...' : 'Exhale gently...'}
          </div>
        </div>
      </motion.div>

      {/* Phase indicator */}
      <div className="flex gap-3">
        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
          breathPhase === 'in' ? 'bg-sanctuary-sage scale-125 shadow-lg' : 'bg-sanctuary-slate/20'
        }`} />
        <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
          breathPhase === 'out' ? 'bg-teal-500 scale-125 shadow-lg' : 'bg-sanctuary-slate/20'
        }`} />
      </div>
    </div>
  );
}
