'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import BubblePopper from './Games/BubblePopper';
import ColorSplash from './Games/ColorSplash';
import CalmMaze from './Games/CalmMaze';
import FidgetSpinner from './Games/FidgetSpinner';
import StressBall from './Games/StressBall';
import CloudPush from './Games/CloudPush';

const gameComponents = {
  'bubble-popper': BubblePopper,
  'color-splash': ColorSplash,
  'calm-maze': CalmMaze,
  'fidget-spinner': FidgetSpinner,
  'stress-ball': StressBall,
  'cloud-push': CloudPush,
};

export default function GameModal({ game, onClose }) {
  const GameComponent = gameComponents[game.id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative w-full max-w-4xl bg-slate-50 rounded-2xl shadow-xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
          <X size={24} />
        </button>

        <div className="flex justify-center items-center gap-3 mb-6">
          <span className="text-4xl">{game.emoji}</span>
          <h2 className="text-3xl font-bold text-slate-800">{game.title}</h2>
        </div>

        <div className="h-96 flex items-center justify-center">
          {GameComponent ? <GameComponent /> : <p>Game not found</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}
