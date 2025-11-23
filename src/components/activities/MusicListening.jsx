'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause } from 'lucide-react';

/**
 * MusicListening - Music therapy with audio playback
 * Handles audio playback with pause/resume syncing
 * 
 * Props from wrapper:
 * - activity: Activity object
 * - timeRemaining: Current time in seconds
 * - totalTime: Total duration in seconds
 * - isPaused: Whether activity is paused
 * - formatTime: Time formatter function
 */
export default function MusicListening({
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
      {/* Glow effect */}
      <motion.div
        animate={isPlaying ? { opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] } : { opacity: 0.3 }}
        transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
        className="absolute w-96 h-96 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-indigo-400/20 rounded-full blur-3xl"
      />
      
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border-2 border-white/60 shadow-2xl p-8 flex flex-col items-center">
        {/* Animated music icon */}
        <motion.div
          animate={isPlaying ? { 
            rotate: 360, 
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ 
            rotate: { duration: 4, repeat: isPlaying ? Infinity : 0, ease: 'linear' },
            scale: { duration: 1, repeat: isPlaying ? Infinity : 0 }
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl mb-6"
        >
          <Music className="w-12 h-12 text-white" strokeWidth={2.5} />
        </motion.div>
        
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-sanctuary-slate mb-3 font-nunito">Music Therapy</h3>
          <p className="text-base text-sanctuary-slate/70 font-quicksand">{activity.description}</p>
        </div>

        {/* Animated visualizer bars */}
        {isPlaying && (
          <div className="flex gap-1.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [1, 2, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
                className="w-2 h-8 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full origin-bottom"
              />
            ))}
          </div>
        )}

        <motion.button
          onClick={togglePlayback}
          disabled={isPaused || !audioReady}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl text-lg font-quicksand"
        >
          {isPlaying ? (
            <>
              <Pause size={24} fill="currentColor" />
              <span>Now Playing</span>
            </>
          ) : (
            <>
              <Play size={24} fill="currentColor" />
              <span>Start Music</span>
            </>
          )}
        </motion.button>

        <div className="mt-6 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/80 shadow-sm">
          <div className="text-sm font-medium text-sanctuary-slate/70 font-quicksand">
            {isPlaying ? '🎵 Music is playing...' : audioReady ? '✅ Ready to listen' : '⏳ Loading audio...'}
          </div>
        </div>

        {/* Hidden audio element with proper event handlers */}
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
