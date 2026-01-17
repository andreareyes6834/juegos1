import React, { useEffect, useState } from 'react';
import type { SnakeGameAdapter } from '../../games/SnakeGameAdapter';

export function SnakeGameView({ adapter }: { adapter: SnakeGameAdapter }) {
  const [{ width, height }, setSize] = useState(adapter.getGridSize());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSize(adapter.getGridSize());
  }, [adapter]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setTick(t => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const snake = adapter.getSnake();
  const food = adapter.getFood();
  const occupied = new Set(snake.map(c => `${c.x}:${c.y}`));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="grid gap-[2px] p-6 bg-black/40 rounded-[40px] border border-white/10"
        style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 16px))` }}
        aria-label={`tick-${tick}`}
      >
        {Array.from({ length: width * height }).map((_, idx) => {
          const x = idx % width;
          const y = Math.floor(idx / width);
          const key = `${x}:${y}`;
          const isSnake = occupied.has(key);
          const isFood = food.x === x && food.y === y;

          let cls = 'w-4 h-4 rounded-[4px] bg-white/5';
          if (isSnake) cls = 'w-4 h-4 rounded-[4px] bg-cyan-500';
          if (isFood) cls = 'w-4 h-4 rounded-[4px] bg-yellow-500';

          return <div key={key} className={cls} />;
        })}
      </div>
    </div>
  );
}
