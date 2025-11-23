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

  return (
    <motion.div
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
        isCompleted 
          ? 'bg-gradient-to-br from-sanctuary-sage/20 to-sanctuary-misty/30 border-sanctuary-sage/30 shadow-lg' 
          : 'bg-white/40 border-white/60 shadow-xl hover:shadow-2xl'
      }`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-sanctuary-sage/10 pointer-events-none" />
      
      {/* Status badges */}
      {isIncomplete && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
        >
          In Progress
        </motion.div>
      )}
      {isCompleted && !isIncomplete && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 z-10 bg-gradient-to-r from-sanctuary-sage to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
        >
          <Check size={12} />
          Done
        </motion.div>
      )}

      {/* Card content */}
      <div className="relative p-6 sm:p-8 flex flex-col items-center justify-between min-h-[280px] sm:min-h-[320px]">
        {/* Icon with breathing animation */}
        <motion.div 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-sanctuary-sage/30 to-sanctuary-misty/40 flex items-center justify-center mb-4 shadow-inner"
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-4xl sm:text-5xl">{EMOJI_MAP[activity.category] || EMOJI_MAP.default}</span>
        </motion.div>

        {/* Title */}
        <div className="flex-grow flex flex-col items-center justify-center text-center mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-sanctuary-slate leading-tight font-nunito px-2">
            {activity.title}
          </h3>
        </div>

        {/* Action button */}
        <motion.button
          onClick={() => onStart(activity)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-3 sm:py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-lg ${
            isCompleted
              ? 'bg-gradient-to-r from-sanctuary-sage/80 to-teal-600/80 text-white hover:from-sanctuary-sage hover:to-teal-600'
              : isIncomplete
              ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600'
              : 'bg-gradient-to-r from-sanctuary-sage to-teal-600 text-white hover:from-teal-600 hover:to-sanctuary-sage'
          }`}
        >
          {isIncomplete ? '▶ Resume' : isCompleted ? '↻ Repeat' : '→ Begin'}
        </motion.button>
      </div>
    </motion.div>
  );
}