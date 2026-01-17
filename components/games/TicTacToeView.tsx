import React, { useEffect, useState } from 'react';
import type { TicTacToeAdapter } from '../../games/TicTacToeAdapter';

export function TicTacToeView({ adapter }: { adapter: TicTacToeAdapter }) {
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

  const board = adapter.getBoard();
  const current = adapter.getCurrentPlayer();
  const winner = adapter.getWinner();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.35em]">Turno</div>
        <div className="text-3xl font-orbitron font-black text-white" aria-label={`tick-${tick}`}> 
          {winner ? (winner === 'DRAW' ? 'EMPATE' : `GANA ${winner}`) : current}
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 110px))' }}>
        {board.flatMap((row, y) =>
          row.map((cell, x) => (
            <button
              key={`${x}:${y}`}
              onClick={() => adapter.play(x, y)}
              className="w-[110px] h-[110px] rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-5xl font-orbitron font-black"
            >
              {cell ?? ''}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
