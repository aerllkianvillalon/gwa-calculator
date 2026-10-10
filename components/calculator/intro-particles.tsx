"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DIST = 110; // px: particles closer than this are joined by a line
const MOUSE_DIST = 150; // px: cursor influence radius

/** Reads the theme's neutral text color (`--ink-500`, space-separated RGB) so it follows light/dark mode. */
function readColor(): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--ink-500").trim();
  return raw || "91 100 120";
}

/**
 * Decorative particle field for the calculator intro. It is wider than the page
 * column (up to 80rem, viewport permitting) so it is not boxed in by `max-w-3xl`. Particles drift slowly, join
 * with faint lines when close, and are pushed away from (and linked to) the cursor or
 * finger. Purely visual: it ignores pointer events so it never blocks scrolling or
 * clicks, pauses when off-screen or the tab is hidden, and renders a single still
 * frame for people who prefer reduced motion.
 */
export function IntroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let color = readColor();
    let mouse: { x: number; y: number } | null = null;
    let raf = 0;
    let visible = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area, capped so phones stay light.
      const count = Math.max(22, Math.min(80, Math.round((width * height) / 9000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1 + Math.random() * 1.4,
      }));
      if (reduceMotion) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Push away from the cursor, then ease back to the slow drift.
        if (mouse) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_DIST && d > 0.01) {
            const force = (1 - d / MOUSE_DIST) * 0.6;
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }
        p.vx *= 0.97;
        p.vy *= 0.97;
        // Keep a gentle baseline drift so the field never goes still.
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      // Lines between nearby particles.
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgb(${color} / ${(1 - d / LINK_DIST) * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Lines from the cursor to nearby particles.
      if (mouse) {
        for (const p of particles) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < MOUSE_DIST) {
            ctx.strokeStyle = `rgb(${color} / ${(1 - d / MOUSE_DIST) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      // Dots.
      ctx.fillStyle = `rgb(${color} / 0.5)`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (visible && !document.hidden) draw();
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height ? { x, y } : null;
    };
    const onPointerLeave = () => {
      mouse = null;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Re-read the color when the theme class on <html> changes.
    const mo = new MutationObserver(() => {
      color = readColor();
      if (reduceMotion) draw();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let io: IntersectionObserver | undefined;
    if (!reduceMotion) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(canvas);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointercancel", onPointerLeave);
      document.addEventListener("pointerleave", onPointerLeave);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      io?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointercancel", onPointerLeave);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 h-full w-[min(calc(100vw-1rem),80rem)] -translate-x-1/2"
      style={{
        // Fade the edges out so there is no visible box.
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 90% at 50% 45%, #000 40%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 70% 90% at 50% 45%, #000 40%, transparent 100%)",
      }}
    />
  );
}