'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const EMOJI_MAP = {
  Mindfulness: '🧘',
  Reflection: '🙏',
  Physical: '🚶',
  Breathing: '🌬️',
  Journaling: '📝',
  Meditation: '🧘',
  default: '✨',
};

export default function ActivityCard({ activity, onStart }) {
  const isCompleted = activity.completed;
  const isIncomplete = activity.isIncomplete;

  const cardStateStyles = isCompleted
    ? 'bg-sanctuary-sage/10 border-sanctuary-sage/20'
    : 'neumorphic hover:shadow-sanctuary-hover';

  const buttonText = isIncomplete ? 'Resume' : isCompleted ? 'Repeat' : 'Begin';
  const buttonStyles = isIncomplete
    ? 'flex-shrink-0 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-2.5 rounded-full transition transform hover:scale-105'
    : isCompleted
    ? 'flex-shrink-0 w-full bg-white/90 text-slate-800 font-semibold py-2.5 rounded-full border border-slate-200 transition transform hover:scale-105'
    : 'flex-shrink-0 w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-full transition transform hover:scale-105';

  return (
    <motion.div
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className={`aspect-square rounded-3xl transition-sanctuary flex flex-col justify-between p-5 text-center ${cardStateStyles}`}
    >
      {/* Status badges */}
      {isIncomplete && (
        <div className="absolute top-3 right-3 bg-yellow-200 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 border border-yellow-300">
          <span>In Progress</span>
        </div>
      )}
      {isCompleted && !isIncomplete && (
        <div className="absolute top-3 right-3 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 border border-teal-100">
          <Check size={14} />
          <span>Completed</span>
        </div>
      )}

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-5xl mb-3">{EMOJI_MAP[activity.category] || EMOJI_MAP.default}</div>
        <h3 className="text-lg font-bold text-sanctuary-slate leading-tight font-quicksand">{activity.title}</h3>
        <div className="flex items-center justify-center gap-1.5 text-sm text-sanctuary-slate/70 mt-2 font-nunito">
          <Clock size={14} />
          <span>{activity.duration} min</span>
        </div>
      </div>

      {isCompleted ? (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 text-sm font-semibold text-sanctuary-sage bg-sanctuary-sage/20 rounded-full py-2.5 font-quicksand">
            <Check size={16} />
            <span>Completed</span>
        </div>
      ) : (
        <button
          onClick={() => onStart(activity)}
          className="flex-shrink-0 w-full bg-[#52796F] hover:bg-[#3d5a52] text-white font-semibold py-2.5 rounded-full transition-sanctuary transform hover:scale-105 shadow-sanctuary touch-target font-quicksand"
        >
          Begin
        </button>
      )}
    </motion.div>
  );
}