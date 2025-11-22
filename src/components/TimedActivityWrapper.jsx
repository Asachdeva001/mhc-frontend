'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, RotateCcw } from 'lucide-react';
import TimerInput from './TimerInput';
import { api } from '../lib/api';

/**
 * TimedActivityWrapper - Central component managing all timed activities
 * Handles: timer logic, pause/resume, restart with input, state persistence
 * 
 * Activity components only need to handle visualization, not state management
 * 
 * Props:
 * - activity: Activity object with id, title, description
 * - ActivityComponent: The component to render (BreathingExercise, Meditation, etc.)
 * - initialDuration: Initial time in seconds (default 300)
 * - onComplete: Callback when activity finishes
 * - onClose: Callback to close modal
 * - isResuming: Whether resuming from saved state
 * - savedState: Saved state object {timeRemaining, totalTime}
 */
export default function TimedActivityWrapper({
  activity,
  ActivityComponent,
  initialDuration = 300,
  onComplete,
  onClose,
  isResuming = false,
  savedState = null,
}) {
  // Timer state
  const [totalTime, setTotalTime] = useState(isResuming ? savedState.totalTime : initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(isResuming ? savedState.timeRemaining : initialDuration);
  const [isPaused, setIsPaused] = useState(isResuming ? true : false);
  const [showRestartInput, setShowRestartInput] = useState(false);
  const [durationSet, setDurationSet] = useState(isResuming ? true : false);
  const [showInitialInput, setShowInitialInput] = useState(!isResuming);
  
  // Track if activity has been started
  const isActivityStarted = useRef(false);
  const sessionIdRef = useRef(null);

  // Initialize session ID on mount
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `${activity.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [activity.id]);

  // Timer countdown effect
  useEffect(() => {
    if (isPaused || timeRemaining <= 0 || !durationSet) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Activity complete
          onComplete(activity.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeRemaining, durationSet, activity.id, onComplete]);

  // Auto-save state periodically when activity is active (every 5 seconds)
  useEffect(() => {
    if (isPaused || !isActivityStarted.current || !durationSet) return;

    const saveInterval = setInterval(async () => {
      try {
        await api.activities.saveActivitySession({
          activityId: activity.id,
          sessionId: sessionIdRef.current,
          timeRemaining,
          totalTime,
          isPaused: false,
          timestamp: new Date().toISOString(),
        });
        console.log('✅ Activity state auto-saved to backend');
      } catch (err) {
        console.error('⚠️ Failed to auto-save activity state:', err);
        // Still save to localStorage as fallback
        saveToLocalStorage();
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [isPaused, timeRemaining, totalTime, activity.id, durationSet]);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    const today = new Date();
    const incompleteKey = `activity_incomplete_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}_${activity.id}`;
    
    if (isActivityStarted.current && timeRemaining > 0) {
      localStorage.setItem(incompleteKey, JSON.stringify({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        timeRemaining,
        totalTime,
        sessionId: sessionIdRef.current,
        savedAt: new Date().toISOString(),
      }));
    } else {
      localStorage.removeItem(incompleteKey);
    }
  }, [activity, timeRemaining, totalTime]);

  // Handle initial start (when duration is first set)
  const handleStart = (newDuration) => {
    setTotalTime(newDuration);
    setTimeRemaining(newDuration);
    setDurationSet(true);
    setShowInitialInput(false);
    setIsPaused(false);
    isActivityStarted.current = true;
  };

  // Handle pause
  const handlePause = () => {
    setIsPaused(true);
    saveToLocalStorage();
    // Also save to backend
    api.activities.saveActivitySession({
      activityId: activity.id,
      sessionId: sessionIdRef.current,
      timeRemaining,
      totalTime,
      isPaused: true,
      timestamp: new Date().toISOString(),
    }).catch(err => console.error('Failed to save paused state:', err));
  };

  // Handle resume
  const handleResume = () => {
    setIsPaused(false);
  };

  // Handle restart - reset everything and clear incomplete marker
  const handleRestart = (newDuration) => {
    const today = new Date();
    const incompleteKey = `activity_incomplete_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}_${activity.id}`;
    localStorage.removeItem(incompleteKey); // Clear incomplete marker - ensures activity shows as fresh/default
    
    setTimeRemaining(newDuration);
    setTotalTime(newDuration);
    setIsPaused(false);
    setShowRestartInput(false);
    setShowInitialInput(false); // Keep initial input closed to show fresh timer
    isActivityStarted.current = true;
    sessionIdRef.current = `${activity.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle close - save state before closing (activity shows as incomplete/default)
  const handleClose = () => {
    saveToLocalStorage(); // Saves incomplete state only if timer was started and not complete
    onClose();
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
      {/* Initial Duration Input */}
      {showInitialInput && (
        <motion.div
          className="w-full bg-slate-50 p-4 rounded-lg border border-slate-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <TimerInput
            initialSeconds={totalTime}
            onConfirm={handleStart}
            onCancel={handleClose}
          />
        </motion.div>
      )}

      {/* Restart Duration Input */}
      {showRestartInput && (
        <motion.div
          className="w-full bg-slate-50 p-4 rounded-lg border border-slate-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <TimerInput
            initialSeconds={timeRemaining}
            onConfirm={handleRestart}
            onCancel={() => setShowRestartInput(false)}
          />
        </motion.div>
      )}

      {/* Single Timer Display (Only when duration is set) */}
      {durationSet && !showRestartInput && (
        <motion.div
          className="flex justify-center mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl rounded-3xl px-10 py-6 border-2 border-white/60 shadow-2xl">
            <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-sanctuary-sage to-teal-600 bg-clip-text text-transparent tabular-nums font-nunito">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-center mt-2 text-sm font-medium text-sanctuary-slate/60 font-quicksand uppercase tracking-wider">
              Time Remaining
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {durationSet && !showRestartInput && (
        <div className="w-full max-w-md px-4">
          <div className="relative">
            <div className="h-3 bg-sanctuary-misty/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/40 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-sanctuary-sage via-teal-500 to-teal-600 shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-sanctuary-slate/60 font-quicksand">
              <span>Started</span>
              <span>{Math.round(progressPercent)}%</span>
              <span>Complete</span>
            </div>
          </div>
        </div>
      )}

      {/* Activity Visualization Component */}
      {durationSet && !showInitialInput && !showRestartInput && (
        <div className="w-full flex-1 flex items-center justify-center">
          <ActivityComponent
            activity={activity}
            timeRemaining={timeRemaining}
            totalTime={totalTime}
            isPaused={isPaused}
            formatTime={formatTime}
          />
        </div>
      )}

      {/* Control Buttons (only when duration is set) */}
      {durationSet && !showInitialInput && !showRestartInput && (
        <motion.div
          className="flex flex-wrap gap-3 justify-center mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Pause / Resume Button */}
          <motion.button
            onClick={isPaused ? handleResume : handlePause}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sanctuary-sage to-teal-600 hover:from-teal-600 hover:to-sanctuary-sage text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl font-quicksand backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? (
              <>
                <Play size={20} fill="currentColor" />
                <span className="text-base">Resume</span>
              </>
            ) : (
              <>
                <Pause size={20} fill="currentColor" />
                <span className="text-base">Pause</span>
              </>
            )}
          </motion.button>

          {/* Restart Button */}
          <motion.button
            onClick={() => setShowRestartInput(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl font-quicksand backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} />
            <span className="text-base">Restart</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
