import React, { useEffect, useState } from 'react';
import type { MemoryGameAdapter } from '../../games/MemoryGameAdapter';

export function MemoryGameView({ adapter }: { adapter: MemoryGameAdapter }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onAny = () => setTick(t => t + 1);
    adapter.on('stateChange', onAny);
    adapter.on('scoreUpdate', onAny);
    adapter.on('gameOver', onAny);
    return () => {
      adapter.off('stateChange', onAny);
      adapter.off('scoreUpdate', onAny);
      adapter.off('gameOver', onAny);
    };
  }, [adapter]);

  const cards = adapter.getCards();

  return (
    <div className="w-full h-full flex items-center justify-center" aria-label={`tick-${tick}`}>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 90px))' }}>
        {cards.map(c => (
          <button
            key={c.id}
            onClick={() => adapter.flipCard(c.id)}
            className={`w-[90px] h-[90px] rounded-3xl border border-white/10 text-4xl font-black transition-all ${c.matched ? 'bg-green-500/20' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {c.revealed || c.matched ? c.value : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
