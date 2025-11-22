'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function GameCard({ game, onPlay }) {
  return (
    <motion.div
      layout
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className="aspect-square rounded-2xl shadow-sm border border-slate-200/80 hover:border-slate-400/50 hover:shadow-md transition-all duration-300 backdrop-blur-lg bg-white/60 flex flex-col justify-between p-5 text-center"
    >
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-5xl mb-3">{game.emoji}</div>
        <h3 className="text-lg font-bold text-slate-800 leading-tight">{game.title}</h3>
        <p className="text-sm text-slate-500 mt-2">{game.description}</p>
      </div>

      <button
        onClick={() => onPlay(game)}
        className="flex-shrink-0 w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-full transition transform hover:scale-105 flex items-center justify-center gap-2"
      >
        <Play size={16} />
        <span>Play</span>
      </button>
    </motion.div>
  );
}
