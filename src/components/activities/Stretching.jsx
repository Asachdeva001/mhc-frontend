'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STRETCHES = [
  {
    name: 'Neck Rolls',
    description: 'Slowly roll your head in circles. 15 seconds each direction.',
    duration: 30,
    emoji: '🧠',
  },
  {
    name: 'Shoulder Rolls',
    description: 'Roll your shoulders backward and forward. Feel the tension release.',
    duration: 30,
    emoji: '💪',
  },
  {
    name: 'Touch Your Toes',
    description: 'Bend forward gently, let gravity do the work. Hold and breathe.',
    duration: 30,
    emoji: '🙏',
  },
  {
    name: 'Side Stretches',
    description: 'Reach one arm up and over to the opposite side. 15 seconds each.',
    duration: 30,
    emoji: '🤸',
  },
  {
    name: 'Quad Stretch',
    description: 'Pull one knee toward your chest, hold gently. Alternate legs.',
    duration: 30,
    emoji: '🦵',
  },
  {
    name: 'Wrist Circles',
    description: 'Extend arms and rotate your wrists in both directions.',
    duration: 30,
    emoji: '🫀',
  },
];

const TOTAL_STRETCHES = 6;
const SECONDS_PER_STRETCH = 30;

/**
 * Stretching - Guided stretching with timed exercises
 * 6 exercises × 30 seconds each = 3 minutes
 * If time exceeds 3 minutes, exercises repeat
 * 
 * Props from wrapper:
 * - activity: Activity object
 * - timeRemaining: Current time in seconds
 * - totalTime: Total duration in seconds
 * - isPaused: Whether activity is paused
 * - formatTime: Time formatter function
 */
export default function Stretching({
  activity,
  timeRemaining,
  totalTime,
  isPaused,
  formatTime,
}) {
  const [stretchIndex, setStretchIndex] = useState(0);
  const [timeForCurrentStretch, setTimeForCurrentStretch] = useState(SECONDS_PER_STRETCH);

  // Update current stretch based on timeRemaining
  useEffect(() => {
    if (timeRemaining > 0) {
      // Calculate which stretch we're on (cycles through if time > 3 minutes)
      const elapsedTime = totalTime - timeRemaining;
      const stretchPosition = elapsedTime % (TOTAL_STRETCHES * SECONDS_PER_STRETCH);
      const currentIndex = Math.floor(stretchPosition / SECONDS_PER_STRETCH);
      const timeInCurrentStretch = SECONDS_PER_STRETCH - (stretchPosition % SECONDS_PER_STRETCH);

      setStretchIndex(Math.min(currentIndex, TOTAL_STRETCHES - 1));
      setTimeForCurrentStretch(timeInCurrentStretch);
    }
  }, [timeRemaining, totalTime]);

  const currentStretch = STRETCHES[stretchIndex];
  const totalRounds = Math.ceil(totalTime / (TOTAL_STRETCHES * SECONDS_PER_STRETCH));
  const currentRound = Math.floor((totalTime - timeRemaining) / (TOTAL_STRETCHES * SECONDS_PER_STRETCH)) + 1;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-6">
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border-2 border-white/60 shadow-2xl p-8 text-center">
        {/* Header with badge */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold rounded-full shadow-lg font-quicksand">
            <span>Exercise {stretchIndex + 1} / {TOTAL_STRETCHES}</span>
            {totalRounds > 1 && <span>• Round {currentRound}/{totalRounds}</span>}
          </div>
        </div>

        {/* Exercise emoji with glow */}
        <motion.div 
          className="relative mb-6 flex justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-xl" />
          <div className="relative text-7xl">{currentStretch.emoji}</div>
        </motion.div>
        
        <h3 className="text-3xl font-bold text-sanctuary-slate mb-3 font-nunito">{currentStretch.name}</h3>
        <p className="text-sanctuary-slate/70 text-base mb-8 px-4 font-quicksand leading-relaxed">{currentStretch.description}</p>

        {/* Circular Time Display */}
        <div className="mb-8 flex justify-center">
          <motion.div
            className="relative w-36 h-36 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
            <div className="relative text-5xl font-bold text-white tabular-nums font-nunito">
              {Math.ceil(timeForCurrentStretch)}
            </div>
            <div className="absolute bottom-3 text-xs text-white/80 font-quicksand">seconds</div>
          </motion.div>
        </div>

        {/* Progress indicators */}
        <div className="mb-6">
          <div className="flex gap-2 justify-center">
            {STRETCHES.map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < stretchIndex
                    ? 'w-8 bg-emerald-500 shadow-lg'
                    : i === stretchIndex
                    ? 'w-12 bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xl'
                    : 'w-6 bg-sanctuary-slate/20'
                }`}
                animate={i === stretchIndex ? { scaleX: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Status message */}
        <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/80 shadow-sm inline-block">
          <div className="text-sm font-medium text-sanctuary-slate/70 font-quicksand">
            {isPaused ? '⏸ Paused - Resume when ready' : '✨ Hold this stretch gently'}
          </div>
        </div>
      </div>
    </div>
  );
}
