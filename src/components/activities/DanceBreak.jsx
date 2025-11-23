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
    <div className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-6">
      {/* Animated glow */}
      <motion.div
        animate={isPlaying ? { 
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1]
        } : { opacity: 0.3 }}
        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
        className="absolute w-96 h-96 bg-gradient-to-r from-pink-400/20 via-orange-400/20 to-red-400/20 rounded-full blur-3xl"
      />
      
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border-2 border-white/60 shadow-2xl p-8 text-center flex flex-col items-center">
        {/* Header with emoji */}
        <motion.div 
          className="text-6xl mb-4"
          animate={isPlaying ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
        >
          🎉
        </motion.div>
        <div className="text-3xl font-bold mb-3 text-sanctuary-slate font-nunito">Get Moving!</div>
        <div className="text-sanctuary-slate/70 mb-6 font-quicksand text-lg">
          Play music and dance! Keep moving to the beat.
        </div>

        {/* Animated Music Icon */}
        <motion.div
          animate={isPlaying ? { 
            rotate: [0, 360],
            scale: [1, 1.15, 1]
          } : {}}
          transition={{ 
            rotate: { duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' },
            scale: { duration: 0.8, repeat: isPlaying ? Infinity : 0 }
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl mb-6"
        >
          <Music className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Dancing emoji animation */}
        {isPlaying && (
          <motion.div
            className="flex gap-4 mb-6 text-4xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <span>💃</span>
            <span>🕺</span>
          </motion.div>
        )}

        {/* Music Control Button */}
        <motion.button
          onClick={togglePlayback}
          disabled={isPaused || !audioReady}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl text-lg font-quicksand mb-4"
        >
          {isPlaying ? (
            <>
              <Pause size={24} fill="currentColor" />
              <span>Stop Music</span>
            </>
          ) : (
            <>
              <Play size={24} fill="currentColor" />
              <span>Play Music</span>
            </>
          )}
        </motion.button>

        <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/80 shadow-sm">
          <div className="text-sm font-medium text-sanctuary-slate/70 font-quicksand">
            {isPlaying ? '🎵 Keep dancing!' : audioReady ? '✅ Ready to dance' : '⏳ Loading...'}
          </div>
        </div>

        <audio
          ref={audioRef}
          src="/mario_bros.mp3"
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
