"use client";

import { useCallback, useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
};

const COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
];

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const spawnFirework = useCallback((x: number, y: number) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 0,
        maxLife: 60 + Math.random() * 30,
      });
    }
  }, []);

  const runAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life += 1;

      const alpha = 1 - p.life / p.maxLife;
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(alpha, 0);
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(runAnimation);
    } else {
      animationRef.current = null;
    }
  }, []);

  const launchFireworks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bursts = 5;
    for (let i = 0; i < bursts; i++) {
      window.setTimeout(() => {
        const x = canvas.width * (0.2 + Math.random() * 0.6);
        const y = canvas.height * (0.2 + Math.random() * 0.4);
        spawnFirework(x, y);
        if (animationRef.current === null) {
          animationRef.current = requestAnimationFrame(runAnimation);
        }
      }, i * 300);
    }
  }, [spawnFirework, runAnimation]);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center overflow-hidden bg-zinc-50 font-sans dark:bg-black">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10"
      />
      <main className="z-0 flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
          歡迎大家,我們開始上課囉!
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          按下下面的按鈕,一起放煙火慶祝吧
        </p>
        <button
          type="button"
          onClick={launchFireworks}
          className="rounded-full bg-foreground px-8 py-4 text-lg font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          放煙火 🎆
        </button>
      </main>
    </div>
  );
}
