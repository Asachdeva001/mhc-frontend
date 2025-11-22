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
    <div className="w-full flex flex-col items-center justify-center h-full gap-4">
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
          className="flex justify-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl font-bold text-teal-600 tabular-nums">
            {formatTime(timeRemaining)}
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {durationSet && !showRestartInput && (
        <div className="w-full max-w-sm px-4">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-400 to-sky-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'linear' }}
            />
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
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Pause / Resume Button */}
          <motion.button
            onClick={isPaused ? handleResume : handlePause}
            className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-full transition-all duration-200 transform hover:scale-105 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? (
              <>
                <Play size={18} />
                Resume
              </>
            ) : (
              <>
                <Pause size={18} />
                Pause
              </>
            )}
          </motion.button>

          {/* Restart Button */}
          <motion.button
            onClick={() => setShowRestartInput(true)}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full transition-all duration-200 transform hover:scale-105 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={18} />
            Restart
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
