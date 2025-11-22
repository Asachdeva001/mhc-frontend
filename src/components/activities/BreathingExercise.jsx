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
    <div className="w-64 h-64 relative flex items-center justify-center">
      <motion.div
        animate={!isPaused ? { scale: [1, 1.4, 1] } : (breathPhase === 'in' ? { scale: 1.4 } : { scale: 1 })}
        transition={!isPaused ? { duration: 12, times: [0, 0.5, 1], ease: 'easeInOut', repeat: Infinity } : { duration: 0 }}
        className="w-48 h-48 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center shadow-lg"
      >
        <div className="text-2xl font-semibold text-slate-800 select-none">
          {breathPhase === 'in' ? 'Breathe in' : 'Breathe out'}
        </div>
      </motion.div>
    </div>
  );
}
