'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import GameModal from '../../components/GameModal';

// List of anti-stress games
const games = [
  {
    id: 'bubble-popper',
    title: 'Bubble Popper',
    description: 'Click on floating bubbles to pop them. Relaxing popping sounds.',
    emoji: '🫧',
  },
  {
    id: 'color-splash',
    title: 'Color Splash',
    description: 'Click anywhere to create expanding color splashes.',
    emoji: '🎨',
  },
  {
    id: 'calm-maze',
    title: 'Calm Maze',
    description: 'Navigate through relaxing mazes with soothing music.',
    emoji: '🌀',
  },
  {
    id: 'fidget-spinner',
    title: 'Fidget Spinner',
    description: 'Spin the fidget spinner with different designs.',
    emoji: '🌀',
  },
  {
    id: 'stress-ball',
    title: 'Stress Ball Clicker',
    description: 'Click and squish the stress ball for relief.',
    emoji: '⚽',
  },
  {
    id: 'cloud-push',
    title: 'Cloud Push',
    description: 'Push fluffy clouds around the screen.',
    emoji: '☁️',
  },
];

export default function AntiStressGamesPage() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-violet-50">
        <Navigation currentPage="anti-stress-games" />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
        >
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800">Anti-Stress Games</h1>
            <p className="text-slate-500 mt-1">Play relaxing games to unwind and reduce stress.</p>
          </header>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="visible"
          >
            {games.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onPlay={setSelectedGame}
              />
            ))}
          </motion.div>
        </motion.main>
      </div>

      <AnimatePresence>
        {selectedGame && (
          <GameModal
            game={selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
