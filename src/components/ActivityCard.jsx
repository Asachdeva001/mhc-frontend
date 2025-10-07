'use client';

import { motion } from 'framer-motion';
import { Check, Clock } from 'lucide-react';

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

  const cardStateStyles = isCompleted
    ? 'bg-teal-500/10 border-teal-500/20'
    : 'bg-white/60 border-slate-200/80 hover:border-slate-400/50 hover:shadow-md';

  return (
    <motion.div
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className={`aspect-square rounded-2xl shadow-sm border transition-all duration-300 backdrop-blur-lg flex flex-col justify-between p-5 text-center ${cardStateStyles}`}
    >
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-5xl mb-3">{EMOJI_MAP[activity.category] || EMOJI_MAP.default}</div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight">{activity.title}</h3>
        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 mt-2">
          <Clock size={14} />
          <span>{activity.duration} min</span>
        </div>
      </div>

      {isCompleted ? (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 text-sm font-semibold text-teal-700 bg-teal-100/80 rounded-full py-2.5">
            <Check size={16} />
            <span>Completed</span>
        </div>
      ) : (
        <button
          onClick={() => onStart(activity)}
          className="flex-shrink-0 w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-full transition transform hover:scale-105"
        >
          Begin
        </button>
      )}
    </motion.div>
  );
}