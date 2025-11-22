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
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-lg p-6 text-center">
        {/* Header */}
        <div className="mb-4">
          <div className="text-sm text-slate-600 font-medium">
            Exercise {stretchIndex + 1} of {TOTAL_STRETCHES}
            {totalRounds > 1 && <span className="ml-2">• Round {currentRound}/{totalRounds}</span>}
          </div>
        </div>

        {/* Exercise Name with Emoji */}
        <div className="text-5xl mb-3">{currentStretch.emoji}</div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{currentStretch.name}</h3>
        <p className="text-slate-600 text-sm mb-6 px-2">{currentStretch.description}</p>

        {/* Circular Time Display */}
        <div className="mb-6 flex justify-center">
          <motion.div
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-4xl font-bold text-white tabular-nums">
              {Math.ceil(timeForCurrentStretch)}
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 opacity-50" />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex gap-1">
            {STRETCHES.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < stretchIndex
                    ? 'bg-emerald-500'
                    : i === stretchIndex
                    ? 'bg-emerald-400'
                    : 'bg-slate-200'
                }`}
                animate={i === stretchIndex ? { scaleX: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-500 italic">
          {isPaused ? 'Paused - Resume when ready' : 'Hold this stretch gently'}
        </div>
      </div>
    </div>
  );
}
