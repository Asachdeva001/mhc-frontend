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
    ? 'bg-sanctuary-sage/10 border-sanctuary-sage/20'
    : 'neumorphic hover:shadow-sanctuary-hover';

  return (
    <motion.div
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className={`aspect-square rounded-3xl transition-sanctuary flex flex-col justify-between p-5 text-center ${cardStateStyles}`}
    >
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