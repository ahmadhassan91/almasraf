"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (canvasEl === null) return;
    const canvas: HTMLCanvasElement = canvasEl;

    const ctx = canvasEl.getContext("2d");
    if (ctx === null) return;
    const context: CanvasRenderingContext2D = ctx;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = [
      "rgba(200,168,75,",
      "rgba(240,200,100,",
      "rgba(26,110,224,",
      "rgba(77,159,255,",
      "rgba(255,255,255,",
    ];

    const particles: Particle[] = [];
    const MAX_PARTICLES = 80;

    function spawnParticle(): Particle {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const maxLife = 200 + Math.random() * 300;
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.3 + Math.random() * 0.8),
        radius: 1 + Math.random() * 2.5,
        opacity: 0,
        color,
        life: 0,
        maxLife,
      };
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    let animId: number;

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      context.strokeStyle = "rgba(255,255,255,0.015)";
      context.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }

      particles.forEach((p, i) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Fade in/out
        const progress = p.life / p.maxLife;
        if (progress < 0.2) p.opacity = progress / 0.2;
        else if (progress > 0.8) p.opacity = (1 - progress) / 0.2;
        else p.opacity = 1;

        // Draw particle
        context.beginPath();
        const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `${p.color}${p.opacity * 0.8})`);
        gradient.addColorStop(1, `${p.color}0)`);
        context.fillStyle = gradient;
        context.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        context.fill();

        // Core dot
        context.beginPath();
        context.fillStyle = `${p.color}${p.opacity})`;
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();

        // Reset particle when done
        if (p.life >= p.maxLife || p.y < -20) {
          particles[i] = spawnParticle();
        }
      });

      // Connection lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            context.beginPath();
            context.strokeStyle = `rgba(200,168,75,${(1 - dist / 100) * 0.06})`;
            context.lineWidth = 0.5;
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
