'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

// --- Theme Constants (Standard Tailwind Emerald/Gray) ---
const COLORS = {
    primary: 'text-emerald-600',
    primaryBg: 'bg-emerald-600',
    hoverBg: 'hover:bg-emerald-700',
    textDark: 'text-gray-800',
    subtleText: 'text-gray-500',
    cardBg: 'bg-white',
    cardBorder: 'border-gray-100',
};

export default function GameCard({ game, onPlay }) {
    return (
        <motion.div
            layout
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            // Standardized Card Style: White/Glass Background, Stronger Shadow, Clear Border
            className={`
                rounded-2xl shadow-xl ${COLORS.cardBorder} border 
                ${COLORS.cardBg}
                hover:shadow-2xl hover:border-emerald-200 
                transition-all duration-300
                flex flex-col justify-between p-6 text-center
            `}
        >
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">{game.emoji}</div>
                <h3 className={`text-xl font-bold ${COLORS.textDark} leading-tight mb-2`}>{game.title}</h3>
                <p className={`text-sm ${COLORS.subtleText}`}>{game.description}</p>
            </div>

            <motion.button
                onClick={() => onPlay(game)}
                className={`
                    flex-shrink-0 w-full 
                    ${COLORS.primaryBg} ${COLORS.hoverBg} text-white 
                    font-semibold py-3 rounded-full 
                    transition transform 
                    hover:scale-[1.02] 
                    flex items-center justify-center gap-2 mt-4
                    shadow-lg shadow-emerald-300/50
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Play size={16} fill="white" />
                <span>Play Now</span>
            </motion.button>
        </motion.div>
    );
}