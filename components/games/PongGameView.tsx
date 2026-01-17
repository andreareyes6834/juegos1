import React, { useEffect, useRef } from 'react';
import type { PongGameAdapter } from '../../games/PongGameAdapter';

export function PongGameView({ adapter }: { adapter: PongGameAdapter }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height } = adapter.getField();
      const { playerY, aiY, paddleW, paddleH } = adapter.getPaddles();
      const ball = adapter.getBall();

      ctx.canvas.width = width;
      ctx.canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.setLineDash([6, 10]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#00F6FF';
      ctx.fillRect(24, playerY, paddleW, paddleH);

      ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
      ctx.fillRect(width - 24 - paddleW, aiY, paddleW, paddleH);

      ctx.fillStyle = '#EAB308';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [adapter]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="p-8 bg-black/40 rounded-[40px] border border-white/10">
        <canvas ref={canvasRef} className="rounded-3xl shadow-2xl" />
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em] mt-6 text-center">
          Flechas arriba/abajo
        </div>
      </div>
    </div>
  );
}
