"use client";

import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { calculateEmotionalState } from '@/lib/emotionLogic';

/**
 * BioSensor Component - Analyzes facial expressions using MediaPipe
 * Runs hidden camera feed and detects emotional states
 * 
 * @param {Object} props
 * @param {boolean} props.isActive - Whether to start/stop camera and analysis
 * @param {Function} props.onEmotionUpdate - Callback when emotion changes (receives emotionData object)
 */
export default function BioSensor({ isActive = false, onEmotionUpdate }) {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastAnalysisTimeRef = useRef(0);
  const lastEmotionRef = useRef(null);

  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Analysis throttle interval (500ms for better real-time detection)
  const ANALYSIS_INTERVAL = 500;

  /**
   * Initialize MediaPipe FaceLandmarker model
   */
  useEffect(() => {
    let isMounted = true;

    const initializeFaceLandmarker = async () => {
      try {
        // Load MediaPipe vision tasks
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        // Create FaceLandmarker instance
        const faceLandmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: false,
            runningMode: 'VIDEO',
            numFaces: 1
          }
        );

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          setIsModelLoaded(true);
          console.log('FaceLandmarker model loaded successfully');
        }
      } catch (err) {
        console.error('Error loading FaceLandmarker:', err);
        if (isMounted) {
          setError('Failed to load face analysis model. Please refresh the page.');
        }
      }
    };

    initializeFaceLandmarker();

    return () => {
      isMounted = false;
      // Cleanup on unmount
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  /**
   * Start camera stream
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            resolve();
          };
        });

        console.log('Camera started successfully');
        // Start analysis loop
        startAnalysisLoop();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please grant camera permissions.');
    }
  };

  /**
   * Stop camera stream
   */
  const stopCamera = () => {
    // Stop video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    console.log('Camera stopped');
  };

  /**
   * Analysis loop using requestAnimationFrame
   */
  const startAnalysisLoop = () => {
    const analyzeFrame = async () => {
      const currentTime = Date.now();

      // Throttle analysis to once every 2 seconds
      if (currentTime - lastAnalysisTimeRef.current >= ANALYSIS_INTERVAL) {
        if (
          faceLandmarkerRef.current &&
          videoRef.current &&
          videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
        ) {
          try {
            // Detect face landmarks and blendshapes
            const results = faceLandmarkerRef.current.detectForVideo(
              videoRef.current,
              currentTime
            );

            // Process blendshapes if face is detected
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
              const blendshapes = results.faceBlendshapes[0].categories;
              
              // Calculate emotional state
              const emotionalState = calculateEmotionalState(blendshapes);

              // Only trigger callback if emotion has changed
              if (
                !lastEmotionRef.current ||
                lastEmotionRef.current.dominant !== emotionalState.dominant
              ) {
                lastEmotionRef.current = emotionalState;
                
                if (onEmotionUpdate) {
                  onEmotionUpdate(emotionalState);
                }

                console.log('Emotion detected:', emotionalState);
              }
            }
          } catch (err) {
            console.error('Error analyzing frame:', err);
          }
        }

        lastAnalysisTimeRef.current = currentTime;
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    };

    analyzeFrame();
  };

  /**
   * Handle isActive prop changes
   */
  useEffect(() => {
    if (isActive && isModelLoaded) {
      startCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount or when isActive becomes false
    return () => {
      stopCamera();
    };
  }, [isActive, isModelLoaded]);

  return (
    <div className="biosensor-container">
      {/* Hidden video element - user should NOT see their feed */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        style={{ display: 'none' }}
      />

      {/* Error display (optional) */}
      {error && (
        <div className="biosensor-error text-red-500 text-sm p-2">
          {error}
        </div>
      )}

      {/* Status indicator (optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="biosensor-status text-xs text-gray-500 p-2">
          <div>Model: {isModelLoaded ? '✓ Loaded' : '⏳ Loading...'}</div>
          <div>Camera: {streamRef.current ? '✓ Active' : '○ Inactive'}</div>
          <div>Last Emotion: {lastEmotionRef.current?.dominant || 'None'}</div>
        </div>
      )}
    </div>
  );
}
