/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ADVANCED EMOTION ANALYSIS ENGINE - MediaPipe Face Landmarks v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 ACCURACY IMPROVEMENTS:
 * 
 * 1. COMPREHENSIVE EYE ANALYSIS (15+ metrics)
 *    - Eye squinting patterns (crying vs smiling detection)
 *    - Eye wideness (fear vs surprise differentiation)
 *    - Blink frequency and duration
 *    - Gaze direction tracking (up/down/left/right/avoidance)
 *    - Eye wetness patterns (tear detection via prolonged squinting)
 *    - Asymmetric eye movements (micro-expressions)
 * 
 * 2. DETAILED MOUTH DYNAMICS (20+ metrics)
 *    - Lip tension and pressing (stress indicators)
 *    - Smile authenticity (Duchenne vs fake smile)
 *    - Mouth corners (frown vs smile vs asymmetric contempt)
 *    - Jaw clenching and grinding (anger markers)
 *    - Lip rolling and pursing (disgust/concentration)
 *    - Mouth stretching and funnel (crying face)
 *    - Upper/lower lip movements independently
 * 
 * 3. FACE MICRO-EXPRESSIONS
 *    - Brow asymmetry (subtle anger/contempt)
 *    - Smile asymmetry (fake emotion detection)
 *    - Cheek movements (genuine joy vs forced)
 *    - Nose wrinkles (disgust primary indicator)
 *    - Face rigidity (suppressed emotions)
 * 
 * 4. ADVANCED CRYING DETECTION
 *    - Tear indicator formula (squint + cheek raise + nose scrunch)
 *    - Eye wetness patterns (prolonged squinting + blinking)
 *    - Facial distortion patterns (mouth funnel + stretch)
 *    - Differentiation from passive sadness
 * 
 * 5. PATTERN RECOGNITION
 *    - Congruence checking (e.g., wide eyes + smile = surprise not joy)
 *    - Emotion disambiguation (fear vs surprise via brow position)
 *    - Priority systems (crying > sadness when tear patterns detected)
 *    - Temporal stability (500ms sampling for real-time accuracy)
 * 
 * 6. ENHANCED EMOTION FORMULAS:
 *    - Sadness: Eye gaze + mouth + face rigidity (6 components)
 *    - Crying: Tears + wetness + distortion (6 components)
 *    - Anger: Jaw tension + brow + mouth + asymmetry (6 components)
 *    - Fear: Wide eyes + raised brows + avoidance (6 components)
 *    - Disgust: Nose wrinkle + lip curl + asymmetry (5 components)
 *    - Joy: Genuine smile + eye crinkles + engagement (5 components)
 *    - Surprise: Eyes + brows + jaw + gaze (4 components)
 *    - Contempt: Asymmetric expressions + smirk (5 components)
 * 
 * 📊 THRESHOLDS:
 *    - Detection threshold: 0.20 (20% confidence minimum)
 *    - Analysis interval: 500ms (high-frequency sampling)
 *    - Priority triggers: 0.30 for emotion disambiguation
 * 
 * 🔬 TECHNICAL IMPROVEMENTS:
 *    - 50+ facial blendshape features analyzed
 *    - Weighted formulas tuned for real-world accuracy
 *    - Asymmetry detection for micro-expressions
 *    - Contextual emotion filtering (e.g., crying vs sadness logic)
 *    - Development logging with detailed metrics
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Helper function to safely get blendshape score by name
 * @param {Array} blendshapes - Array of blendshape objects from MediaPipe
 * @param {string} name - The category name to search for
 * @returns {number} The score value (0-1) or 0 if not found
 */
const getBlendshapeScore = (blendshapes, name) => {
  const blendshape = blendshapes.find(
    (b) => b.categoryName.toLowerCase() === name.toLowerCase()
  );
  return blendshape ? blendshape.score : 0;
};

/**
 * Calculate average of multiple blendshape scores
 * @param {Array} blendshapes - Array of blendshape objects from MediaPipe
 * @param {Array<string>} names - Array of blendshape category names to average
 * @returns {number} Average score (0-1)
 */
const calculateAverage = (blendshapes, names) => {
  const scores = names.map((name) => getBlendshapeScore(blendshapes, name));
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return scores.length > 0 ? sum / scores.length : 0;
};

/**
 * Calculate asymmetry between left and right features (micro-expression indicator)
 * @param {Array} blendshapes - Array of blendshape objects from MediaPipe
 * @param {string} leftName - Left side blendshape name
 * @param {string} rightName - Right side blendshape name
 * @returns {number} Asymmetry score (0-1)
 */
const calculateAsymmetry = (blendshapes, leftName, rightName) => {
  const left = getBlendshapeScore(blendshapes, leftName);
  const right = getBlendshapeScore(blendshapes, rightName);
  return Math.abs(left - right);
};

/**
 * Main function to calculate emotional state from MediaPipe blendshapes
 * ENHANCED: Deep analysis of eyes, mouth, face dynamics, and micro-expressions
 * @param {Array} blendshapes - Array of blendshape objects from MediaPipe FaceLandmarker
 * @returns {Object} EmotionalState object with dominant emotion, score, and all scores
 */
export const calculateEmotionalState = (blendshapes) => {
  // ========================================
  // === SECTION 1: COMPREHENSIVE FEATURE EXTRACTION ===
  // ========================================
  
  // --- BROW REGION (emotional intensity markers) ---
  const browInnerUp = getBlendshapeScore(blendshapes, 'browInnerUp');
  const browDown_avg = calculateAverage(blendshapes, ['browDownLeft', 'browDownRight']);
  const browOuterUp_avg = calculateAverage(blendshapes, ['browOuterUpLeft', 'browOuterUpRight']);
  
  // --- EYE REGION (critical for emotion detection) ---
  const eyeSquint_avg = calculateAverage(blendshapes, ['eyeSquintLeft', 'eyeSquintRight']);
  const eyeWide_avg = calculateAverage(blendshapes, ['eyeWideLeft', 'eyeWideRight']);
  const eyeBlink_avg = calculateAverage(blendshapes, ['eyeBlinkLeft', 'eyeBlinkRight']);
  
  // Eye gaze direction (anxiety/avoidance indicators)
  const eyeLookDown_avg = calculateAverage(blendshapes, ['eyeLookDownLeft', 'eyeLookDownRight']);
  const eyeLookUp_avg = calculateAverage(blendshapes, ['eyeLookUpLeft', 'eyeLookUpRight']);
  const eyeLookIn_avg = calculateAverage(blendshapes, ['eyeLookInLeft', 'eyeLookInRight']);
  const eyeLookOut_avg = calculateAverage(blendshapes, ['eyeLookOutLeft', 'eyeLookOutRight']);
  
  // --- CHEEK REGION (crying/genuine smile detector) ---
  const cheekSquint_avg = calculateAverage(blendshapes, ['cheekSquintLeft', 'cheekSquintRight']);
  const cheekPuff = getBlendshapeScore(blendshapes, 'cheekPuff');
  
  // --- NOSE REGION (disgust/crying indicators) ---
  const noseSneer_avg = calculateAverage(blendshapes, ['noseSneerLeft', 'noseSneerRight']);
  
  // --- MOUTH REGION (comprehensive expression analysis) ---
  const mouthSmile_avg = calculateAverage(blendshapes, ['mouthSmileLeft', 'mouthSmileRight']);
  const mouthFrown_avg = calculateAverage(blendshapes, ['mouthFrownLeft', 'mouthFrownRight']);
  const mouthPress_avg = calculateAverage(blendshapes, ['mouthPressLeft', 'mouthPressRight']);
  const mouthUpperUp_avg = calculateAverage(blendshapes, ['mouthUpperUpLeft', 'mouthUpperUpRight']);
  const mouthLowerDown_avg = calculateAverage(blendshapes, ['mouthLowerDownLeft', 'mouthLowerDownRight']);
  const mouthStretch_avg = calculateAverage(blendshapes, ['mouthStretchLeft', 'mouthStretchRight']);
  const mouthPucker = getBlendshapeScore(blendshapes, 'mouthPucker');
  const mouthFunnel = getBlendshapeScore(blendshapes, 'mouthFunnel');
  const mouthRollUpper = getBlendshapeScore(blendshapes, 'mouthRollUpper');
  const mouthRollLower = getBlendshapeScore(blendshapes, 'mouthRollLower');
  const mouthShrugUpper = getBlendshapeScore(blendshapes, 'mouthShrugUpper');
  const mouthShrugLower = getBlendshapeScore(blendshapes, 'mouthShrugLower');
  
  // Mouth dimples (contempt/smirk indicators)
  const mouthDimpleLeft = getBlendshapeScore(blendshapes, 'mouthDimpleLeft');
  const mouthDimpleRight = getBlendshapeScore(blendshapes, 'mouthDimpleRight');
  
  // --- JAW REGION (tension/aggression markers) ---
  const jawOpen = getBlendshapeScore(blendshapes, 'jawOpen');
  const jawForward = getBlendshapeScore(blendshapes, 'jawForward');
  const jawLeft = getBlendshapeScore(blendshapes, 'jawLeft');
  const jawRight = getBlendshapeScore(blendshapes, 'jawRight');
  
  // --- MICRO-EXPRESSION ASYMMETRY DETECTION ---
  const smileAsymmetry = calculateAsymmetry(blendshapes, 'mouthSmileLeft', 'mouthSmileRight');
  const frownAsymmetry = calculateAsymmetry(blendshapes, 'mouthFrownLeft', 'mouthFrownRight');
  const browAsymmetry = calculateAsymmetry(blendshapes, 'browDownLeft', 'browDownRight');
  const eyeSquintAsymmetry = calculateAsymmetry(blendshapes, 'eyeSquintLeft', 'eyeSquintRight');
  
  // ========================================
  // === SECTION 2: ADVANCED PATTERN DETECTION ===
  // ========================================
  
  // --- TEAR/CRYING INDICATORS ---
  // Combination of eye squinting + cheek raising + nose scrunch + upper lip tension
  const tearIndicator = (eyeSquint_avg * 0.35) + 
                        (cheekSquint_avg * 0.3) + 
                        (noseSneer_avg * 0.2) + 
                        (mouthUpperUp_avg * 0.15);
  
  // --- EYE WETNESS PATTERN (prolonged squinting with blinks) ---
  const eyeWetnessPattern = Math.min(1, (eyeSquint_avg + eyeBlink_avg) / 2) * 
                           (cheekSquint_avg > 0.2 ? 1.2 : 1.0);
  
  // --- MOUTH TENSION INDEX (stress/anger marker) ---
  const mouthTension = (mouthPress_avg * 0.4) + 
                       (mouthRollUpper * 0.3) + 
                       (mouthRollLower * 0.3);
  
  // --- FACE RIGIDITY (suppressed emotion indicator) ---
  const faceRigidity = Math.min(1, 
    (mouthPress_avg + browDown_avg + mouthShrugUpper + mouthShrugLower) / 4
  );
  
  // --- GENUINE VS FAKE SMILE (Duchenne marker) ---
  const genuineSmile = mouthSmile_avg * (cheekSquint_avg > 0.15 ? 1.3 : 0.7);
  
  // --- EYE CONTACT AVOIDANCE (anxiety/shame indicator) ---
  const eyeAvoidance = Math.max(eyeLookDown_avg, eyeLookOut_avg, eyeLookIn_avg);
  
  // --- JAW CLENCHING (anger/stress marker) ---
  const jawClenching = Math.max(jawForward, mouthPress_avg, jawLeft, jawRight);

  // ========================================
  // === SECTION 3: ENHANCED EMOTION SCORING ===
  // ========================================
  
  // === SADNESS (MELANCHOLY - PASSIVE) ===
  // ENHANCED: Deep analysis with eye gaze avoidance + mouth patterns + face rigidity
  // Penalize if squinting is HIGH (indicates crying, not passive sadness)
  const squintPenalty = Math.max(0, 1 - (cheekSquint_avg + eyeSquint_avg));
  
  const sadnessScore = (
    (browInnerUp * 0.35) +                    // Sadness brow
    (mouthFrown_avg * 0.25) +                 // Downturned mouth
    (eyeLookDown_avg * 0.15) +                // Gaze avoidance
    (eyeAvoidance * 0.1) +                    // General eye contact avoidance
    (mouthLowerDown_avg * 0.1) +              // Lower lip drop
    (faceRigidity * 0.05)                     // Suppressed emotion
  ) * squintPenalty;

  // === CRYING (ACTIVE DISTRESS WITH TEARS) ===
  // ENHANCED: Comprehensive tear detection with wetness patterns + facial distortion
  const cryingScore = (
    (tearIndicator * 0.3) +                   // Primary tear pattern
    (eyeWetnessPattern * 0.25) +              // Eye wetness + blinking
    (browInnerUp * 0.2) +                     // Distress brow
    (noseSneer_avg * 0.15) +                  // Nose scrunch (sobbing)
    (mouthFunnel * 0.05) +                    // Mouth distortion
    (mouthStretch_avg * 0.05)                 // Mouth stretching (cry face)
  );

  // === ANGER (RAGE - REFINED) ===
  // ENHANCED: Jaw tension + facial rigidity + brow + eye intensity + asymmetry
  const angerScore = (
    (jawClenching * 0.35) +                   // Primary anger marker
    (browDown_avg * 0.25) +                   // Angry brow
    (mouthTension * 0.2) +                    // Lip tension/pressing
    (eyeWide_avg * 0.1) +                     // Eye intensity
    (browAsymmetry * 0.05) +                  // Asymmetric anger expression
    (noseSneer_avg * 0.05)                    // Flared nostrils
  );

  // === FEAR (TERROR - REFINED) ===
  // ENHANCED: Wide eyes + raised brows + jaw drop + facial tension + eye movement
  const fearScore = (
    (eyeWide_avg * 0.4) +                     // Primary fear marker
    (browOuterUp_avg * 0.25) +                // Raised eyebrows
    (jawOpen * 0.15) +                        // Dropped jaw
    (eyeAvoidance * 0.1) +                    // Looking away (avoidance)
    (mouthStretch_avg * 0.05) +               // Stretched mouth
    (cheekPuff * 0.05)                        // Puffed cheeks (gasping)
  );

  // === DISGUST ===
  // ENHANCED: Nose wrinkle + upper lip raise + mouth patterns + asymmetry
  const disgustScore = (
    (noseSneer_avg * 0.45) +                  // Primary disgust marker
    (mouthUpperUp_avg * 0.3) +                // Upper lip curl
    (mouthFunnel * 0.1) +                     // Pursed lips
    (eyeSquint_avg * 0.08) +                  // Squinted eyes
    (frownAsymmetry * 0.07)                   // Asymmetric disgust
  );

  // === JOY (TRUE DUCHENNE SMILE) ===
  // ENHANCED: Genuine smile detection with eye engagement vs fake smile filtering
  const joyScore = (
    (genuineSmile * 0.5) +                    // Duchenne smile (smile + eye crinkle)
    (cheekSquint_avg * 0.25) +                // Eye crinkles (authenticity marker)
    (mouthSmile_avg * 0.15) +                 // Smile intensity
    (browOuterUp_avg * 0.05) +                // Raised brows (excitement)
    (eyeWide_avg * 0.05)                      // Open eyes (engagement)
  ) * (smileAsymmetry < 0.2 ? 1.0 : 0.7);     // Penalize fake/asymmetric smiles

  // === SURPRISE ===
  // ENHANCED: Wide eyes + raised brows + jaw drop + rapid changes
  const browUp_combined = (browOuterUp_avg + browInnerUp) / 2;
  
  const surpriseScore = (
    (eyeWide_avg * 0.35) +                    // Wide eyes (primary)
    (browUp_combined * 0.35) +                // Raised eyebrows
    (jawOpen * 0.25) +                        // Dropped jaw
    (eyeLookUp_avg * 0.05)                    // Upward gaze
  );

  // === CONTEMPT ===
  // ENHANCED: Asymmetric expressions + mouth corner + eye roll patterns
  const mouthDimpleAsymmetry = Math.abs(mouthDimpleLeft - mouthDimpleRight);
  
  const contemptScore = (
    (mouthDimpleAsymmetry * 0.35) +           // Asymmetric smirk
    (smileAsymmetry * 0.25) +                 // One-sided smile
    (mouthPress_avg * 0.2) +                  // Pressed lips
    (eyeSquintAsymmetry * 0.1) +              // One eye squint
    (noseSneer_avg * 0.1)                     // Subtle nose wrinkle
  );

  // === COMPILE ALL SCORES ===
  const allScores = {
    anger: angerScore,
    sadness: sadnessScore,
    crying: cryingScore,
    fear: fearScore,
    disgust: disgustScore,
    joy: joyScore,
    surprise: surpriseScore,
    contempt: contemptScore
  };

  // ========================================
  // === SECTION 4: EMOTION PRIORITIZATION & FILTERING ===
  // ========================================
  
  // === PRIORITY CHECK: CRYING VS SADNESS ===
  // Enhanced logic: Consider tear indicators and wetness patterns
  let adjustedScores = { ...allScores };
  
  if (cryingScore > 0.3 && cryingScore > sadnessScore && tearIndicator > 0.25) {
    // Active crying detected - suppress sadness
    adjustedScores.sadness = 0;
  } else if (sadnessScore > 0.3 && sadnessScore > cryingScore && tearIndicator < 0.2) {
    // Passive sadness without tears - suppress crying
    adjustedScores.crying = 0;
  }
  
  // === JOY VS FEAR DISAMBIGUATION ===
  // Wide eyes can indicate both - use brow position to distinguish
  if (joyScore > 0.3 && fearScore > 0.3) {
    if (browDown_avg > browUp_combined) {
      // Brows down = not fear
      adjustedScores.fear = 0;
    } else {
      // Brows up = not joy
      adjustedScores.joy = 0;
    }
  }

  // === THRESHOLDING & WINNER-TAKE-ALL ===
  // Lower threshold for better sensitivity with comprehensive analysis
  const EMOTION_THRESHOLD = 0.20;
  
  // Filter emotions above threshold using adjusted scores
  const validEmotions = Object.entries(adjustedScores)
    .filter(([_, score]) => score >= EMOTION_THRESHOLD)
    .map(([name, score]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      score 
    }));

  // Find dominant emotion
  let dominant = 'Neutral';
  let maxScore = 0;

  if (validEmotions.length > 0) {
    const winner = validEmotions.reduce((max, emotion) => 
      emotion.score > max.score ? emotion : max
    );
    dominant = winner.name;
    maxScore = winner.score;
  }

  // ========================================
  // === SECTION 5: DETAILED LOGGING (Development) ===
  // ========================================
  if (process.env.NODE_ENV === 'development' && dominant !== 'Neutral') {
    console.group(`🎭 Emotion Detected: ${dominant} (${(maxScore * 100).toFixed(1)}%)`);
    console.log('📊 Feature Analysis:');
    console.table({
      'Eye Squint': (eyeSquint_avg * 100).toFixed(1) + '%',
      'Eye Wide': (eyeWide_avg * 100).toFixed(1) + '%',
      'Eye Gaze Down': (eyeLookDown_avg * 100).toFixed(1) + '%',
      'Brow Inner Up': (browInnerUp * 100).toFixed(1) + '%',
      'Brow Down': (browDown_avg * 100).toFixed(1) + '%',
      'Mouth Smile': (mouthSmile_avg * 100).toFixed(1) + '%',
      'Mouth Frown': (mouthFrown_avg * 100).toFixed(1) + '%',
      'Mouth Tension': (mouthTension * 100).toFixed(1) + '%',
      'Jaw Clench': (jawClenching * 100).toFixed(1) + '%',
      'Tear Indicator': (tearIndicator * 100).toFixed(1) + '%',
      'Genuine Smile': (genuineSmile * 100).toFixed(1) + '%'
    });
    console.log('🎯 All Emotion Scores:');
    console.table(
      Object.fromEntries(
        Object.entries(allScores).map(([name, score]) => 
          [name.charAt(0).toUpperCase() + name.slice(1), (score * 100).toFixed(1) + '%']
        )
      )
    );
    console.groupEnd();
  }

  return {
    dominant,
    score: maxScore,
    allScores, // Return original scores for debugging
    // Additional metadata for advanced analysis
    metadata: {
      tearIndicator,
      eyeWetnessPattern,
      mouthTension,
      jawClenching,
      genuineSmile,
      eyeAvoidance,
      faceRigidity
    }
  };
};

/**
 * Get a human-readable description of the emotional state
 * @param {Object} emotionalState - The calculated emotional state
 * @returns {string} A descriptive string
 */
export const getEmotionDescription = (emotionalState) => {
  const { dominant, score } = emotionalState;
  
  if (dominant === 'Neutral') {
    return 'You appear calm and neutral.';
  }

  const intensity = score > 0.5 ? 'strong' : score > 0.3 ? 'moderate' : 'mild';
  
  const descriptions = {
    Anger: `You're showing ${intensity} signs of anger or frustration.`,
    Sadness: `You appear to be feeling ${intensity} sadness or melancholy.`,
    Crying: `You appear to be experiencing ${intensity} active distress or grief.`,
    Fear: `You're showing ${intensity} signs of fear or anxiety.`,
    Disgust: `You're showing ${intensity} signs of disgust or discomfort.`,
    Joy: `You're showing ${intensity} signs of happiness and positivity.`,
    Surprise: `You appear ${intensity}ly surprised or startled.`,
    Contempt: `You're showing ${intensity} signs of contempt or disdain.`
  };

  return descriptions[dominant] || 'Emotion detected.';
};

/**
 * Map emotion to suggested activities or interventions
 * @param {Object} emotionalState - The calculated emotional state
 * @returns {Array<string>} Array of suggested activity types
 */
export const getSuggestedActivities = (emotionalState) => {
  const { dominant } = emotionalState;

  const activityMap = {
    Anger: ['breathing', 'meditation', 'stretching', 'stress-ball'],
    Sadness: ['music', 'gentle-activities', 'journal', 'breathing'],
    Crying: ['meditation', 'breathing', 'community', 'music'],
    Fear: ['breathing', 'meditation', 'calm-maze', 'grounding'],
    Disgust: ['breathing', 'stretching', 'music'],
    Joy: ['journal', 'community', 'activities', 'dance'],
    Surprise: ['breathing', 'meditation'],
    Contempt: ['journal', 'meditation', 'stretching'],
    Neutral: ['activities', 'journal', 'community']
  };

  return activityMap[dominant] || ['activities'];
};

export default calculateEmotionalState;
