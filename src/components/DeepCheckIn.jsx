"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BioSensor from './BioSensor';

/**
 * DeepCheckIn Component - One-Minute Voice + Emotion Analysis
 * Digital Sanctuary themed with glassmorphism and breathing orb visualizer
 * 
 * @param {Object} props
 * @param {Function} props.onComplete - Callback when check-in completes (receives transcript array)
 * @param {Function} props.onCancel - Callback when user cancels
 * @param {boolean} props.isOpen - Controls modal visibility
 */
export default function DeepCheckIn({ onComplete, onCancel, isOpen = true }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Refs for persistent data across renders
  const recognitionRef = useRef(null);
  const emotionBufferRef = useRef([]);
  const emotionSamplingIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const currentEmotionRef = useRef({ dominant: 'Neutral', score: 0 });
  const startTimeRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioAnimationRef = useRef(null);

  /**
   * Handle emotion updates from BioSensor
   */
  const handleEmotionUpdate = useCallback((emotionData) => {
    currentEmotionRef.current = emotionData;
    console.log('🎭 Current emotion:', emotionData.dominant);
  }, []);

  /**
   * Sample emotion and add to buffer (every 100ms while speaking)
   */
  const sampleEmotion = useCallback(() => {
    if (currentEmotionRef.current && currentEmotionRef.current.dominant !== 'Neutral') {
      emotionBufferRef.current.push(currentEmotionRef.current.dominant);
      console.log('📊 Emotion sampled:', currentEmotionRef.current.dominant, '| Buffer size:', emotionBufferRef.current.length);
    }
  }, []);

  /**
   * Calculate dominant emotion from buffer
   */
  const getDominantEmotion = useCallback(() => {
    if (emotionBufferRef.current.length === 0) {
      return 'Neutral';
    }

    // Count frequency of each emotion
    const emotionCounts = {};
    emotionBufferRef.current.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Find most frequent
    let dominantEmotion = 'Neutral';
    let maxCount = 0;

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    });

    console.log('🏆 Dominant emotion calculated:', dominantEmotion, 'from', emotionBufferRef.current.length, 'samples');
    return dominantEmotion;
  }, []);

  /**
   * Initialize Speech Recognition
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // On interim results (while speaking)
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          // Final result - sentence completed
          finalTranscript = result[0].transcript.trim();
          
          if (finalTranscript) {
            console.log('✅ Final transcript:', finalTranscript);
            
            // Calculate dominant emotion from buffer
            const dominantEmotion = getDominantEmotion();
            
            // Add to transcript with emotion
            const transcriptEntry = {
              text: finalTranscript,
              emotion: dominantEmotion,
              timestamp: new Date().toISOString()
            };
            
            setTranscript(prev => [...prev, transcriptEntry]);
            
            // Clear emotion buffer for next sentence
            emotionBufferRef.current = [];
            console.log('🧹 Buffer cleared for next sentence');
          }
        } else {
          // Interim result - still speaking
          interimTranscript = result[0].transcript;
        }
      }

      // Update current text display
      if (interimTranscript) {
        setCurrentText(interimTranscript);
      } else if (finalTranscript) {
        setCurrentText('');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else if (event.error === 'network') {
        setError('Network error. Please check your connection.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Restart if still recording and time remaining
      if (isRecording && timeRemaining > 0) {
        console.log('Restarting speech recognition...');
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [isRecording, timeRemaining, getDominantEmotion]);

  /**
   * Initialize audio visualization
   */
  const initializeAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 256;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start audio level monitoring
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalized = Math.min(average / 128, 1);
        
        setAudioLevel(normalized);
        audioAnimationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      console.log('🎵 Audio visualization initialized');
    } catch (err) {
      console.error('Failed to initialize audio visualization:', err);
    }
  }, []);

  /**
   * Start recording session
   */
  const startRecording = useCallback(async () => {
    setError(null);
    
    // Initialize audio visualization
    await initializeAudioVisualization();
    
    // Initialize speech recognition
    if (!initializeSpeechRecognition()) {
      return;
    }

    // Start speech recognition
    try {
      recognitionRef.current.start();
      console.log('🎤 Speech recognition started');
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
      return;
    }

    // Start emotion sampling (every 100ms)
    emotionSamplingIntervalRef.current = setInterval(() => {
      sampleEmotion();
    }, 100);

    // Start 60-second timer
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        console.log('⏰ Time expired, stopping recording');
        stopRecording();
      }
    }, 1000);

    setIsRecording(true);
    console.log('✅ Deep Check-In started');
  }, [initializeSpeechRecognition, sampleEmotion, initializeAudioVisualization]);

  /**
   * Stop recording session
   */
  const stopRecording = useCallback(() => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop emotion sampling
    if (emotionSamplingIntervalRef.current) {
      clearInterval(emotionSamplingIntervalRef.current);
      emotionSamplingIntervalRef.current = null;
    }

    // Stop timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Stop audio visualization
    if (audioAnimationRef.current) {
      cancelAnimationFrame(audioAnimationRef.current);
      audioAnimationRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioLevel(0);
    setIsRecording(false);
    console.log('🛑 Deep Check-In stopped');
  }, []);

  /**
   * Complete check-in and send results
   */
  const completeCheckIn = useCallback(() => {
    stopRecording();
    
    if (onComplete) {
      onComplete(transcript);
    }
  }, [transcript, stopRecording, onComplete]);

  /**
   * Cancel check-in
   */
  const handleCancel = useCallback(() => {
    stopRecording();
    setTranscript([]);
    setCurrentText('');
    setTimeRemaining(60);
    emotionBufferRef.current = [];
    
    if (onCancel) {
      onCancel();
    }
  }, [stopRecording, onCancel]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (emotionSamplingIntervalRef.current) {
        clearInterval(emotionSamplingIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioAnimationRef.current) {
        cancelAnimationFrame(audioAnimationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Get orb color based on emotion (RGB format for gradients)
   */
  const getOrbColor = (emotion) => {
    const colors = {
      Anger: { from: 'rgba(220, 38, 38, 0.8)', to: 'rgba(239, 68, 68, 0.6)', glow: 'rgba(220, 38, 38, 0.4)' },
      Sadness: { from: 'rgba(59, 130, 246, 0.8)', to: 'rgba(96, 165, 250, 0.6)', glow: 'rgba(59, 130, 246, 0.4)' },
      Crying: { from: 'rgba(79, 70, 229, 0.8)', to: 'rgba(99, 102, 241, 0.6)', glow: 'rgba(79, 70, 229, 0.4)' },
      Fear: { from: 'rgba(167, 139, 250, 0.8)', to: 'rgba(196, 181, 253, 0.6)', glow: 'rgba(167, 139, 250, 0.4)' },
      Disgust: { from: 'rgba(77, 124, 15, 0.8)', to: 'rgba(101, 163, 13, 0.6)', glow: 'rgba(77, 124, 15, 0.4)' },
      Surprise: { from: 'rgba(234, 179, 8, 0.8)', to: 'rgba(250, 204, 21, 0.6)', glow: 'rgba(234, 179, 8, 0.4)' },
      Joy: { from: 'rgba(16, 185, 129, 0.8)', to: 'rgba(52, 211, 153, 0.6)', glow: 'rgba(16, 185, 129, 0.4)' },
      Neutral: { from: 'rgba(148, 163, 184, 0.8)', to: 'rgba(203, 213, 225, 0.6)', glow: 'rgba(148, 163, 184, 0.4)' }
    };
    return colors[emotion] || colors.Neutral;
  };

  /**
   * Get emotion color for text display
   */
  const getEmotionTextColor = (emotion) => {
    const colors = {
      Anger: 'text-red-400',
      Sadness: 'text-blue-400',
      Crying: 'text-indigo-400',
      Fear: 'text-violet-400',
      Disgust: 'text-lime-400',
      Surprise: 'text-yellow-400',
      Joy: 'text-emerald-400',
      Neutral: 'text-slate-400'
    };
    return colors[emotion] || 'text-slate-400';
  };

  const currentEmotion = currentEmotionRef.current.dominant;
  const orbColors = getOrbColor(currentEmotion);
  const progress = ((60 - timeRemaining) / 60) * 283; // 283 = circumference of circle with r=45

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Hidden BioSensor - only active while recording */}
          <BioSensor 
            isActive={isRecording}
            onEmotionUpdate={handleEmotionUpdate}
          />

          {/* Glassmorphism Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-purple-900/30 to-emerald-900/30 backdrop-blur-xl"
            onClick={!isRecording ? onCancel : undefined}
          />

          {/* Main Content Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative z-10 w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Welcome State */}
            {!isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl">
                  <motion.h2 
                    className="text-5xl font-bold text-white mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Deep Check-In
                  </motion.h2>
                  <motion.p 
                    className="text-xl text-white/80 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Take a moment to share what's on your mind
                  </motion.p>

                  {/* Privacy Notice */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center space-x-2 mb-8 text-emerald-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      Analysis happens on-device. Video is NOT saved.
                    </span>
                  </motion.div>

                  {/* Start Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="group relative px-12 py-5 bg-gradient-to-r from-purple-600 to-emerald-600 text-white text-lg font-semibold rounded-full shadow-2xl overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="relative flex items-center space-x-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      <span>Begin Deep Check-In</span>
                    </span>
                  </motion.button>

                  {/* Error Display */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Recording State */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Breathing Emotion Orb */}
                <motion.div
                  className="relative mb-12"
                  animate={{
                    scale: 1 + (audioLevel * 0.3)
                  }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Outer Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full blur-3xl opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${orbColors.glow}, transparent)`,
                      width: '400px',
                      height: '400px',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Main Orb */}
                  <motion.div
                    className="relative w-80 h-80 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${orbColors.from}, ${orbColors.to})`,
                      boxShadow: `0 0 100px ${orbColors.glow}, inset 0 0 80px rgba(255,255,255,0.1)`
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 100px ${orbColors.glow}, inset 0 0 80px rgba(255,255,255,0.1)`,
                        `0 0 150px ${orbColors.glow}, inset 0 0 100px rgba(255,255,255,0.2)`,
                        `0 0 100px ${orbColors.glow}, inset 0 0 80px rgba(255,255,255,0.1)`
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {/* Emotion Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        key={currentEmotion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        <div className="text-white text-5xl font-bold drop-shadow-2xl tracking-wide">
                          {currentEmotion}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Stop Button with Progress Ring */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      {/* Progress Ring */}
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="45"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="3"
                          fill="none"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="45"
                          stroke="rgba(16, 185, 129, 0.8)"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="283"
                          strokeDashoffset={283 - progress}
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 283 }}
                          animate={{ strokeDashoffset: 283 - progress }}
                        />
                      </svg>

                      {/* Stop Button */}
                      <button
                        onClick={completeCheckIn}
                        className="absolute inset-0 m-4 bg-white/10 backdrop-blur-xl hover:bg-white/20 rounded-lg border-2 border-white/30 transition-all shadow-xl flex items-center justify-center group"
                      >
                        <div className="w-6 h-6 bg-white/80 group-hover:bg-white rounded-sm" />
                      </button>
                    </div>
                    <div className="text-white text-sm text-center mt-3 font-medium">
                      {timeRemaining}s
                    </div>
                  </motion.div>
                </motion.div>

                {/* Listening Message */}
                <motion.div
                  className="mt-32 w-full max-w-3xl px-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
                    animate={{
                      borderColor: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <p className="text-white text-2xl text-center leading-relaxed font-light">
                      I'm listening... feel free to express
                    </p>
                    <p className="text-white/60 text-base text-center mt-4">
                      Share whatever's on your mind
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
