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
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md rounded-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 flex flex-col items-center shadow-lg">
        <div className="mb-6">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0 }}
          >
            <Music className="w-12 h-12 text-purple-500" />
          </motion.div>
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Music Therapy</h3>
          <p className="text-sm text-slate-600">{activity.description}</p>
        </div>

        <div className="mb-6 text-5xl font-bold text-purple-600 tabular-nums">
          {formatTime(timeRemaining)}
        </div>

        <button
          onClick={togglePlayback}
          disabled={isPaused || !audioReady}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all transform hover:scale-105"
        >
          {isPlaying ? (
            <>
              <Pause size={20} />
              Now Playing
            </>
          ) : (
            <>
              <Play size={20} />
              Start Music
            </>
          )}
        </button>

        <div className="mt-4 text-xs text-slate-600">
          {isPlaying ? '🎵 Music is playing...' : audioReady ? 'Ready to listen' : 'Loading audio...'}
        </div>

        {/* Hidden audio element with proper event handlers */}
        <audio
          ref={audioRef}
          src="/audio/calm-loop.mp3"
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
