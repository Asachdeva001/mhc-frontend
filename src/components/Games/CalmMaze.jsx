'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const isSolvable = (maze) => {
  const visited = Array(10).fill().map(() => Array(10).fill(false));
  const queue = [[1, 1]];
  visited[1][1] = true;
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x === 8 && y === 8) return true;
    for (const [dx, dy] of directions) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10 && maze[ny][nx] === 0 && !visited[ny][nx]) {
        visited[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }
  return false;
};

const generateMaze = () => {
  let maze;
  do {
    maze = Array(10).fill().map(() => Array(10).fill(0));
    // Set borders
    for (let i = 0; i < 10; i++) {
      maze[0][i] = 1;
      maze[9][i] = 1;
      maze[i][0] = 1;
      maze[i][9] = 1;
    }
    // Start and end
    maze[1][1] = 0;
    maze[8][8] = 0;
    // Random walls
    for (let y = 1; y < 9; y++) {
      for (let x = 1; x < 9; x++) {
        if ((x === 1 && y === 1) || (x === 8 && y === 8)) continue;
        if (Math.random() < 0.3) maze[y][x] = 1;
      }
    }
  } while (!isSolvable(maze));
  return maze;
};

const CalmMaze = () => {
  const [maze, setMaze] = useState(() => generateMaze());
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [completed, setCompleted] = useState(false);

  const playMoveSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playCompleteSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Chime sound
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2); // E5
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4); // G5

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  };

  useEffect(() => {
    const handleKey = (e) => {
      const { x, y } = playerPos;
      let newX = x, newY = y;
      if (e.key === 'ArrowUp') newY = y - 1;
      if (e.key === 'ArrowDown') newY = y + 1;
      if (e.key === 'ArrowLeft') newX = x - 1;
      if (e.key === 'ArrowRight') newX = x + 1;

      if (maze[newY] && maze[newY][newX] === 0) {
        setPlayerPos({ x: newX, y: newY });
        playMoveSound();
        if (newX === 8 && newY === 8) { // Goal position
          setCompleted(true);
          playCompleteSound();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerPos, maze]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute top-2 left-2 text-white text-xs bg-black/50 px-1 py-0.5 rounded">
          Use arrow keys to reach the goal
        </div>
        <div className="grid grid-cols-10 gap-1 bg-gradient-to-br from-green-200 to-blue-200 p-4 rounded shadow-lg">
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <motion.div
                key={`${x}-${y}`}
                className={`w-8 h-8 rounded ${
                  cell === 1 ? 'bg-slate-700' : 'bg-white/50'
                } ${x === playerPos.x && y === playerPos.y ? 'bg-red-500 rounded-full shadow-lg' : ''} ${x === 8 && y === 8 ? 'bg-yellow-400 rounded-full animate-pulse' : ''}`}
                animate={x === playerPos.x && y === playerPos.y ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))
          )}
        </div>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded text-white font-bold"
          >
            🎉 Maze Completed!
          </motion.div>
        )}
      </div>
      <p className="mt-4 text-slate-600 text-center">
        Navigate with arrow keys to the glowing goal<br />
        Relax and take your time
      </p>
    </div>
  );
};

export default CalmMaze;
