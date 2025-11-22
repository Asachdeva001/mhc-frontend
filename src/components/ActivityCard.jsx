'use client';

import { useState } from 'react';

export default function ActivityCard({ activity, onComplete }) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timer, setTimer] = useState(null);

  const getActivityEmoji = (category) => {
    const emojiMap = {
      'Mindfulness': '🧘',
      'Reflection': '🙏',
      'Physical': '🚶',
      'Breathing': '🌬️',
      'Journaling': '📝',
      'Meditation': '🧘'
    };
    return emojiMap[category] || '✨';
  };

  const getActivityDuration = (title) => {
    if (title.includes('5-Minute')) return 5;
    if (title.includes('10-Minute')) return 10;
    if (title.includes('15-Minute')) return 15;
    if (title.includes('Breathing')) return 3;
    if (title.includes('Gratitude')) return 5;
    if (title.includes('Journal')) return 10;
    return 5; // Default duration
  };

  const startActivity = () => {
    const duration = getActivityDuration(activity.title);
    setIsActive(true);
    setTimeRemaining(duration * 60); // Convert to seconds

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          onComplete(activity.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimer(interval);
  };

  const endActivity = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setIsActive(false);
    setTimeRemaining(0);
    onComplete(activity.id);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getActivityInstructions = (title) => {
    const instructions = {
      '5-Minute Breathing Exercise': 'Find a comfortable position. Inhale for 4 counts, hold for 4 counts, exhale for 4 counts. Focus on your breath.',
      'Gratitude Journaling': 'Write down three things you\'re grateful for today. Be specific and reflect on why you appreciate them.',
      'Take a Walk Outside': 'Take a gentle walk outdoors. Notice the sights, sounds, and sensations around you. Stay present.',
      'Guided Meditation': 'Close your eyes and focus on your breathing. When thoughts arise, gently return your attention to your breath.',
      'Mindful Walking': 'Walk slowly and deliberately. Pay attention to each step and how your body moves.',
      'Journal Prompt': 'Reflect on: "What emotions am I feeling right now?" Write freely without judgment.'
    };
    return instructions[title] || 'Take a moment to focus on this activity and be present in the moment.';
  };

  return (
    <div className={`rounded-xl shadow-lg transition-all duration-300 p-6 border-2 ${
      activity.completed 
        ? 'bg-green-50 border-green-200' 
        : isActive 
          ? 'bg-blue-50 border-blue-300 shadow-xl' 
          : 'bg-white border-gray-100 hover:shadow-xl'
    }`}>
      <div className="text-center">
        <div className="text-5xl mb-4">{getActivityEmoji(activity.category)}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{activity.title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{activity.description}</p>
        
        {/* Activity Info */}
        <div className="flex justify-center items-center space-x-4 mb-6 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {activity.duration}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {activity.category}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {activity.difficulty}
          </span>
        </div>

        {/* Timer Display */}
        {isActive && (
          <div className="mb-6 p-4 bg-blue-100 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-blue-700">Time Remaining</div>
          </div>
        )}

        {/* Instructions */}
        {isActive && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
            <p className="text-sm text-gray-600">{getActivityInstructions(activity.title)}</p>
          </div>
        )}

        {/* Status Badge */}
        {activity.completed && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completed
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {activity.completed ? (
            <div className="text-green-600 font-medium py-2">
              ✅ Great job! Activity completed
            </div>
          ) : isActive ? (
            <button
              onClick={endActivity}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              End Activity
            </button>
          ) : (
            <button
              onClick={startActivity}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
            >
              Start Activity
            </button>
          )}
        </div>
      </div>
    </div>
  );
}