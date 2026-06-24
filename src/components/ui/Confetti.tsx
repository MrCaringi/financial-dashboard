"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  wobbleSpeed: number;
  wobble: number;
  shape: "rect" | "circle";
  opacity: number;
}

const COLORS = [
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#facc15", // Yellow
];

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Spawn dual cannons from bottom corners shooting upward and inward
    const spawnParticles = () => {
      const count = 120; // total particles
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const fromLeft = Math.random() > 0.5;
        const x = fromLeft ? 0 : canvas.width;
        const y = canvas.height;

        // Angle: Left cannon shoots up-right (40 to 75 deg), Right shoots up-left (105 to 140 deg)
        const angle = fromLeft
          ? (Math.random() * 35 + 40) * (Math.PI / 180)
          : (Math.random() * 35 + 105) * (Math.PI / 180);

        const velocity = Math.random() * 14 + 14;

        newParticles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: -Math.sin(angle) * velocity,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 6 + 6,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          wobbleSpeed: Math.random() * 0.08 + 0.04,
          wobble: Math.random() * Math.PI * 2,
          shape: Math.random() > 0.4 ? "rect" : "circle",
          opacity: 1,
        });
      }
      particles = newParticles;
    };

    spawnParticles();

    const gravity = 0.35;
    const drag = 0.985;

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        // Physics
        p.vx *= drag;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Fade out as it falls or moves off-screen
        if (p.y > canvas.height * 0.65) {
          p.opacity -= 0.015;
        }

        if (p.opacity > 0 && p.x >= -20 && p.x <= canvas.width + 20 && p.y <= canvas.height + 20) {
          active = true;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          // Wobble flutter size calculation
          const currentSize = p.size * (1 + Math.sin(p.wobble) * 0.2);

          if (p.shape === "rect") {
            ctx.fillRect(-currentSize / 2, -currentSize / 4, currentSize, currentSize / 2);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(updateAndDraw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
}
