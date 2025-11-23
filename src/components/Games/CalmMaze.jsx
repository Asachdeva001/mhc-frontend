'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Handle movement (keyboard and button clicks)
  const movePlayer = (direction) => {
    const { x, y } = playerPos;
    let newX = x, newY = y;

    if (direction === 'up') newY = y - 1;
    if (direction === 'down') newY = y + 1;
    if (direction === 'left') newX = x - 1;
    if (direction === 'right') newX = x + 1;

    if (maze[newY] && maze[newY][newX] === 0) {
      setPlayerPos({ x: newX, y: newY });
      playMoveSound();
      if (newX === 8 && newY === 8) {
        setCompleted(true);
        playCompleteSound();
      }
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') movePlayer('up');
      if (e.key === 'ArrowDown') movePlayer('down');
      if (e.key === 'ArrowLeft') movePlayer('left');
      if (e.key === 'ArrowRight') movePlayer('right');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playerPos, maze]);

  const handleNewLevel = () => {
    setMaze(generateMaze());
    setPlayerPos({ x: 1, y: 1 });
    setCompleted(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full overflow-hidden px-2 sm:px-4">
      {/* Maze Grid */}
      <div className="relative w-full flex justify-center">
        <div className="absolute top-2 left-2 text-white text-xs sm:text-sm bg-black/50 px-2 sm:px-3 py-1 rounded z-10">
          Use arrow keys or buttons to reach the goal
        </div>
        {/* Responsive maze grid */}
        <div className="grid gap-0.5 sm:gap-1 bg-gradient-to-br from-green-200 to-blue-200 p-2 sm:p-4 rounded-lg shadow-lg" style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}>
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <motion.div
                key={`${x}-${y}`}
                className={`rounded w-4 h-4 sm:w-8 sm:h-8 ${
                  cell === 1 ? 'bg-slate-700' : 'bg-white/50'
                } ${x === playerPos.x && y === playerPos.y ? 'bg-gray-400 rounded-full shadow-lg' : ''} ${x === 8 && y === 8 ? 'bg-yellow-400 rounded-full animate-pulse' : ''}`}
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
            className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded-lg text-white font-bold text-lg sm:text-xl"
          >
            🎉 Maze Completed!
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <p className="text-slate-600 text-center text-xs sm:text-sm max-w-full">
        Navigate with arrow keys or use the buttons below to reach the glowing goal<br />
        <span className="text-xs text-slate-500">Relax and take your time</span>
      </p>

      {/* Mobile Control Buttons - D-Pad Style (Mobile Only) */}
      <div className="sm:hidden flex flex-col items-center gap-2 w-full justify-center">
        {/* Up Button */}
        <motion.button
          onClick={() => movePlayer('up')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
          aria-label="Move Up"
        >
          <ChevronUp size={20} strokeWidth={3} />
        </motion.button>

        {/* Left, Down, Right Buttons in Row */}
        <div className="flex gap-2 items-center justify-center">
          <motion.button
            onClick={() => movePlayer('left')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
            aria-label="Move Left"
          >
            <ChevronLeft size={20} strokeWidth={3} />
          </motion.button>

          <motion.button
            onClick={() => movePlayer('down')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
            aria-label="Move Down"
          >
            <ChevronDown size={20} strokeWidth={3} />
          </motion.button>

          <motion.button
            onClick={() => movePlayer('right')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
            aria-label="Move Right"
          >
            <ChevronRight size={20} strokeWidth={3} />
          </motion.button>
        </div>
      </div>

      {/* New Level Button */}
      <motion.button
        onClick={handleNewLevel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm sm:text-base rounded-full hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all flex-shrink-0"
      >
        New Level
      </motion.button>
    </div>
  );
};

export default CalmMaze;
