'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause } from 'lucide-react';

/**
 * DanceBreak - Dance activity with music playback
 * Encourages movement with music
 * 
 * Props from wrapper:
 * - activity: Activity object
 * - timeRemaining: Current time in seconds
 * - totalTime: Total duration in seconds
 * - isPaused: Whether activity is paused
 * - formatTime: Time formatter function
 */
export default function DanceBreak({
  activity,
  timeRemaining,
  totalTime,
  isPaused,
  formatTime,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Sync audio with activity pause state
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPaused && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (!isPaused && isPlaying && audioReady) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [isPaused, isPlaying, audioReady]);

  // Auto-stop when activity completes
  useEffect(() => {
    if (timeRemaining === 0 && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [timeRemaining, isPlaying]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !audioReady) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.log('Audio play failed:', err));
      setIsPlaying(true);
    }
  };

  const handleAudioCanPlay = () => {
    setAudioReady(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md rounded-lg p-6 bg-gradient-to-br from-pink-50 to-orange-50 text-center flex flex-col items-center">
        <div className="text-2xl font-bold mb-3 text-slate-800">Get Moving! 🎉</div>
        <div className="text-slate-700 mb-4">
          Play music and dance! Keep moving to the beat.
        </div>

        {/* Music Icon */}
        <div className="mb-4">
          <motion.div
            animate={isPlaying ? { rotate: 360, scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
          >
            <Music className="w-12 h-12 text-orange-500" />
          </motion.div>
        </div>

        {/* Timer */}
        <div className="text-5xl font-bold text-orange-600 mb-4 tabular-nums">
          {formatTime(timeRemaining)}
        </div>

        {/* Music Control */}
        <button
          onClick={togglePlayback}
          disabled={isPaused || !audioReady}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all transform hover:scale-105 mb-3"
        >
          {isPlaying ? (
            <>
              <Pause size={20} />
              Stop Music
            </>
          ) : (
            <>
              <Play size={20} />
              Play Music
            </>
          )}
        </button>

        <div className="text-sm text-slate-600 italic">
          {isPlaying ? '🎵 Keep dancing!' : audioReady ? 'Ready to dance' : 'Loading...'}
        </div>

        <audio
          ref={audioRef}
          src="/audio/upbeat-dance.mp3"
          loop
          onCanPlay={handleAudioCanPlay}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            console.error('Audio failed to load');
            setAudioReady(false);
          }}
        />
      </div>
    </div>
  );
}
