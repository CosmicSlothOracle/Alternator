import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LEARNING_UNITS, SHOP_ITEMS, PROGRESS_LEVELS, GEOMETRY_DEFINITIONS } from './constants';
import { LearningUnit, User, Task, ShopItem, ChatMessage, CategoryGroup, BattleRequest, ToastMessage, ToastType } from './types';
import { AuthService, DataService, SocialService } from './services/apiService';
import { getMatheHint } from './services/geminiService';
import { TaskFactory } from './services/taskFactory';
import { 
  Button, GlassCard, SectionHeading, CardTitle, Badge, DifficultyStars, 
  ToastContainer, Skeleton, ModalOverlay, PullToRefresh, ProgressBar, CoinFlightAnimation,
  CalculatorWidget
} from './ui-components';

// --- Theme Helpers ---
const GROUP_THEME: Record<CategoryGroup, { color: string; bg: string; text: string; border: string; darkBg: string }> = {
  'A': { color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', darkBg: 'bg-indigo-600' },
  'B': { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', darkBg: 'bg-emerald-600' },
  'C': { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', darkBg: 'bg-amber-600' }
};

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'A': 'Raum & Form',
  'B': 'Messen & Berechnen',
  'C': 'Funktionen & Kontext'
};

const RARITY_COLORS = {
  common: 'border-slate-200 text-slate-400',
  rare: 'border-blue-400 text-blue-500 bg-blue-50/10',
  epic: 'border-purple-500 text-purple-600 bg-purple-50/10',
  legendary: 'border-amber-500 text-amber-600 bg-amber-50/20'
};

// --- Custom Hooks ---
const useContainerSize = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      }
    });
    observer.observe(ref.current);
    // Force initial size if zero (fixes shop effect bug)
    if (ref.current.clientWidth > 0) {
        setSize({ width: ref.current.clientWidth, height: ref.current.clientHeight });
    }
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

// --- Visual Effect Components ---
const MatrixRain: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fix: Fallback to window dimensions if size is 0
    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    const fontSize = Math.max(10, Math.min(14, canvas.width / 50));
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1);
    const chars = "0123456789+-*/=√πΣΔΩ";

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] opacity-20">
      <canvas ref={canvasRef} />
    </div>
  );
};

const ElectricStorm: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    interface Bolt {
      path: {x: number, y: number}[];
      life: number;
      width: number;
      color: string;
    }

    interface Pulse {
      x: number;
      y: number;
      radius: number;
      life: number;
    }

    const bolts: Bolt[] = [];
    const pulses: Pulse[] = [];
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let lastMouse = { ...mouse };

    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
        // Radial discharge on click
        pulses.push({ x: e.clientX, y: e.clientY, radius: 10, life: 1.0 });
        // Burst of bolts
        for (let i = 0; i < 6; i++) {
            createBolt(e.clientX, e.clientY, 40 + Math.random() * 40);
        }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchmove', handleTouchMove);

    function createBolt(x: number, y: number, length: number) {
        const path = [{x, y}];
        const angle = Math.random() * Math.PI * 2;
        let currX = x;
        let currY = y;
        // Jagged segments
        const segments = Math.floor(length / 5);
        
        for(let i=0; i<segments; i++) {
            const step = 5;
            currX += Math.cos(angle) * step + (Math.random() - 0.5) * 8; // Random deviation
            currY += Math.sin(angle) * step + (Math.random() - 0.5) * 8;
            path.push({x: currX, y: currY});
        }
        
        bolts.push({
            path,
            life: 1.0,
            width: 1 + Math.random(),
            color: Math.random() > 0.8 ? '#ffffff' : '#60a5fa' // White or bright blue
        });
    }

    const draw = () => {
      // Fade out trailing effect using destination-out to keep background transparent
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade speed
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Calculation motion
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);

      // Generate micro-arcs based on speed and random idle
      if (speed > 2 || Math.random() < 0.05) {
          const count = speed > 10 ? 2 : 1;
          for (let k = 0; k < count; k++) {
              createBolt(mouse.x, mouse.y, 20 + Math.random() * 30);
          }
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      // Draw Bolts
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i];
        ctx.beginPath();
        if (b.path.length > 0) {
            ctx.moveTo(b.path[0].x, b.path[0].y);
            for (let j = 1; j < b.path.length; j++) {
                ctx.lineTo(b.path[j].x, b.path[j].y);
            }
        }
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width * b.life;
        ctx.shadowBlur = 8 * b.life;
        ctx.shadowColor = '#3b82f6'; // Blue glow
        ctx.stroke();
        ctx.shadowBlur = 0;

        b.life -= 0.08; // Decay
        if (b.life <= 0) bolts.splice(i, 1);
      }

      // Draw Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(147, 197, 253, ${p.life})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          p.radius += 8; // Expand speed
          p.life -= 0.05;
          if (p.life <= 0) pulses.splice(i, 1);
      }
      
      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[100] mix-blend-screen">
      <canvas ref={canvasRef} />
    </div>
  );
};

const VoidProtocol: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let lastMouse = { ...mouse };
    let ripples: { x: number, y: number, r: number, alpha: number, lw: number }[] = [];
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      time += 0.005;
      
      // Clear
      ctx.fillStyle = '#050505'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Idle "Breathing" - Subtle expansion/contraction of void
      const breath = Math.sin(time) * 0.5 + 0.5; // 0 to 1
      const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * (0.6 + breath * 0.1)
      );
      // Very subtle dark blue/purple tint in the black
      grad.addColorStop(0, 'rgba(10, 10, 15, 1)'); 
      grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Gravitational Ripples on Movement
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);
      
      if (speed > 2) {
          ripples.push({
              x: mouse.x,
              y: mouse.y,
              r: 10,
              alpha: Math.min(speed / 50, 0.15),
              lw: 1
          });
      }
      lastMouse = { ...mouse };

      // Draw Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          // "Dark Light" - faint white/cyan
          ctx.strokeStyle = `rgba(200, 220, 255, ${r.alpha})`;
          ctx.lineWidth = r.lw;
          ctx.stroke();
          
          r.r += 1.5; // Slow expansion
          r.alpha *= 0.95; // Fade
          
          if (r.alpha < 0.005) ripples.splice(i, 1);
      }

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[0]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const UnicornMagic: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let particles: {
      x: number; y: number; vx: number; vy: number; 
      size: number; hue: number; life: number; type: 'trail' | 'sparkle'
    }[] = [];
    
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let lastMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let tick = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);
      
      // Interpolate hues for iridescent feel: Cyan -> Purple -> Pink
      const baseHue = 180 + Math.sin(tick * 0.02) * 60 + (speed * 2);

      // Create trail particles
      if (speed > 2) {
        const count = Math.min(Math.floor(speed / 3), 4);
        for(let i=0; i<count; i++) {
           particles.push({
             x: mouse.x + (Math.random() - 0.5) * 20,
             y: mouse.y + (Math.random() - 0.5) * 20,
             vx: (Math.random() - 0.5) * 1, // Slow drift
             vy: (Math.random() - 0.5) * 1,
             size: Math.random() * 4 + 2,
             hue: baseHue + (Math.random() * 40 - 20),
             life: 1.0,
             type: 'trail'
           });
        }
      }

      // Occasional Sparkles
      if (Math.random() < 0.03) {
         particles.push({
             x: Math.random() * canvas.width,
             y: canvas.height + 20, // Start from bottom or random? "emerge, drift upward"
             vx: (Math.random() - 0.5) * 0.5,
             vy: -Math.random() * 1 - 0.5, // Upward drift
             size: Math.random() * 6 + 4,
             hue: Math.random() * 360,
             life: 1.0,
             type: 'sparkle'
         });
         // Also random sparkles in the middle
         if (Math.random() < 0.5) {
             particles[particles.length-1].y = Math.random() * canvas.height;
         }
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(tick * 0.05 + p.y * 0.01) * 0.5; // Arcing drift
        p.y += p.vy;
        p.life -= 0.015;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        // Crystal/Pastel style
        const alpha = p.life * 0.8;
        
        if (p.type === 'sparkle') {
            // Star/Diamond shape
            const s = p.size * (0.5 + Math.sin(p.life * Math.PI) * 0.5);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 90%, ${alpha})`;
            ctx.shadowColor = `hsla(${p.hue}, 90%, 80%, ${alpha})`;
            ctx.shadowBlur = 15;
            
            ctx.moveTo(p.x, p.y - s);
            ctx.lineTo(p.x + s*0.6, p.y);
            ctx.lineTo(p.x, p.y + s);
            ctx.lineTo(p.x - s*0.6, p.y);
            ctx.fill();
        } else {
            // Soft Bokeh for trail
            ctx.fillStyle = `hsla(${p.hue}, 70%, 85%, ${alpha})`;
            ctx.shadowBlur = 0;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {/* Subtle iridescent overlay for the "seen through crystal" feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 mix-blend-overlay" />
      <canvas ref={canvasRef} />
    </div>
  );
};

const NeonDreams: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let time = 0;
    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let interactionEnergy = 0;

    const handleMouseMove = (e: MouseEvent) => {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;
        interactionEnergy = Math.min(interactionEnergy + 5, 100);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
        interactionEnergy = Math.min(interactionEnergy + 5, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      // Smooth decay
      interactionEnergy *= 0.95;
      
      // Smooth mouse follow
      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;

      // Time moves faster with high energy
      time += 0.002 + (interactionEnergy * 0.0005);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Background Gradient (Slow diagonal drift)
      // We define points that orbit slowly
      const x1 = (Math.sin(time * 0.5) * 0.5 + 0.5) * canvas.width;
      const y1 = (Math.cos(time * 0.3) * 0.5 + 0.5) * canvas.height;
      const x2 = (Math.sin(time * 0.4 + Math.PI) * 0.5 + 0.5) * canvas.width;
      const y2 = (Math.cos(time * 0.6 + Math.PI) * 0.5 + 0.5) * canvas.height;

      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      
      // Vaporwave Colors: Cyan, Pink, Purple
      // Shift hue slightly over time for "nostalgic" feel
      gradient.addColorStop(0, `hsla(${180 + Math.sin(time)*20}, 70%, 60%, 0.15)`); // Cyan-ish
      gradient.addColorStop(0.5, `hsla(${280 + Math.cos(time)*20}, 70%, 60%, 0.15)`); // Purple-ish
      gradient.addColorStop(1, `hsla(${320 + Math.sin(time*0.8)*20}, 80%, 60%, 0.15)`); // Pink-ish

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Cursor Bloom / Halo
      // Size breathes with energy and time
      const radius = 150 + (Math.sin(time * 3) * 20) + (interactionEnergy * 2);
      const bloomGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
      
      // Halo color shifts based on energy
      bloomGrad.addColorStop(0, `hsla(${300 + interactionEnergy}, 100%, 80%, ${0.2 + interactionEnergy/300})`);
      bloomGrad.addColorStop(1, 'hsla(300, 100%, 70%, 0)');

      ctx.globalCompositeOperation = 'screen'; // Additive blending for that "Neon Glow" look
      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const GalaxyMode: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    // --- CONFIG ---
    const STAR_COUNT = 300;
    const NEBULA_COUNT = 3;
    const LENS_RADIUS = 200;
    const LENS_FORCE = 15; // Pixels of max distortion

    // --- TYPES ---
    interface Star {
      x: number;
      y: number;
      z: number; // 0.1 (far) to 1.0 (near)
      size: number;
      baseColor: string;
      alpha: number;
    }

    interface Nebula {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }

    // --- INITIALIZATION ---
    const stars: Star[] = [];
    const colors = ['#ffffff', '#e0f2fe', '#fffbeb', '#c7d2fe']; // White, light blue, warm white, soft purple
    
    for (let i = 0; i < STAR_COUNT; i++) {
        const z = Math.random();
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: 0.1 + z * 0.9, // Avoid z=0
            size: Math.random() * 1.2 + (z * 1.0),
            baseColor: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.2 + Math.random() * 0.6
        });
    }

    const nebulae: Nebula[] = [];
    const nebulaColors = [
        'rgba(30, 27, 75, 0.4)', // Dark Indigo
        'rgba(49, 46, 129, 0.3)', // Indigo
        'rgba(88, 28, 135, 0.2)', // Purple
        'rgba(15, 23, 42, 0.5)'   // Slate
    ];
    
    for(let i=0; i<NEBULA_COUNT; i++) {
        nebulae.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.min(canvas.width, canvas.height) * (0.4 + Math.random() * 0.3),
            color: nebulaColors[i % nebulaColors.length],
            vx: (Math.random() - 0.5) * 0.05, // Very slow
            vy: (Math.random() - 0.5) * 0.05
        });
    }

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      // Cosmic inertia
      mouse.x += (targetMouse.x - mouse.x) * 0.03;
      mouse.y += (targetMouse.y - mouse.y) * 0.03;

      // Parallax camera offset (stars move opposite to mouse)
      const camX = (mouse.x - canvas.width / 2) * 0.05;
      const camY = (mouse.y - canvas.height / 2) * 0.05;

      // 1. Background
      ctx.fillStyle = '#020617'; // Slate 950/Black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Nebulae (Deep depth)
      nebulae.forEach(n => {
          n.x += n.vx;
          n.y += n.vy;
          
          // Parallax for nebula (very slight)
          const drawX = n.x - camX * 0.1;
          const drawY = n.y - camY * 0.1;

          const g = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, n.radius);
          g.addColorStop(0, n.color);
          g.addColorStop(1, 'transparent');
          
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(drawX, drawY, n.radius, 0, Math.PI * 2);
          ctx.fill();
      });

      // 3. Stars
      stars.forEach(s => {
          // Parallax: closer stars (higher z) move more
          let sx = s.x - camX * s.z * 10;
          let sy = s.y - camY * s.z * 10;

          // Infinite scrolling wrap
          sx = (sx % canvas.width + canvas.width) % canvas.width;
          sy = (sy % canvas.height + canvas.height) % canvas.height;

          // Lensing (Distortion)
          const dx = sx - mouse.x;
          const dy = sy - mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          let lx = sx;
          let ly = sy;

          if (dist < LENS_RADIUS) {
              // Push stars slightly away to create a "bubble" or "lens" effect
              // Or pull them in. "Gravitational lensing" often bends light around a mass.
              // Let's do a simple "magnify" distortion: push away from center.
              const force = (1 - dist / LENS_RADIUS) * LENS_FORCE;
              const angle = Math.atan2(dy, dx);
              lx += Math.cos(angle) * force;
              ly += Math.sin(angle) * force;
          }

          ctx.fillStyle = s.baseColor;
          ctx.globalAlpha = s.alpha * (0.8 + 0.2 * Math.random()); // Subtle twinkle
          ctx.beginPath();
          ctx.arc(lx, ly, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      });

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[0]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const FireBlaze: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      life: number; decay: number; size: number;
      type: 'ember' | 'flame';
      turbulence: number;
    }

    let particles: Particle[] = [];
    let mouse = { x: canvas.width / 2, y: canvas.height + 100 };
    let lastMouse = { ...mouse };

    const spawnParticles = (x: number, y: number, count: number, type: 'ember' | 'flame', spread: number) => {
      for(let i=0; i<count; i++) {
        const isFlame = type === 'flame';
        const speed = isFlame ? 5 : 1.5;
        // Flames burst upward faster, embers drift
        const vy = isFlame ? -Math.random() * speed - 2 : -Math.random() * speed - 0.5;
        
        particles.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: (Math.random() - 0.5) * speed * (isFlame ? 1 : 0.5),
          vy: vy, 
          life: 1.0,
          decay: Math.random() * 0.03 + 0.015,
          size: Math.random() * (isFlame ? 50 : 5) + 2,
          type,
          turbulence: Math.random() * 0.1 // Individual wiggle offset
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    };

    const handleMouseDown = () => {
      // Explosion burst!
      spawnParticles(mouse.x, mouse.y, 60, 'flame', 40); 
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchmove', handleTouchMove);

    const draw = () => {
      // Clear with dark trail for that "burned into retina" look
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5, 2, 0, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn embers on move
      const dx = mouse.x - lastMouse.x;
      const dy = mouse.y - lastMouse.y;
      const speed = Math.sqrt(dx*dx + dy*dy);
      
      if (speed > 2) {
        // More speed = more embers
        spawnParticles(mouse.x, mouse.y, Math.min(Math.floor(speed / 3), 6), 'ember', 15);
      }
      
      // Bottom Idle Fire
      if (Math.random() < 0.3) {
         spawnParticles(Math.random() * canvas.width, canvas.height + 20, 2, 'ember', 20);
      }

      lastMouse = { ...mouse };

      ctx.globalCompositeOperation = 'screen'; // Additive blending for glow intensity

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Heat distortion: Sine wave + random turbulence
        p.x += p.vx + Math.sin(p.y * 0.02 + p.turbulence) * 0.8;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= 0.96; // Shrink as it cools

        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        
        if (p.type === 'flame') {
           // White hot core -> Gold -> Orange -> Red -> Transp
           gradient.addColorStop(0, `rgba(255, 255, 220, ${p.life})`);
           gradient.addColorStop(0.2, `rgba(255, 200, 50, ${p.life * 0.9})`);
           gradient.addColorStop(0.5, `rgba(255, 80, 0, ${p.life * 0.6})`);
           gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);
        } else {
           // Embers: Yellow -> Red -> Grey/Ash
           const r = 255;
           const g = Math.floor(180 * p.life);
           gradient.addColorStop(0, `rgba(${r}, ${g}, 50, ${p.life})`);
           gradient.addColorStop(1, `rgba(${r}, 0, 0, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[5] overflow-hidden mix-blend-screen">
      <canvas ref={canvasRef} />
    </div>
  );
};

const ChromaAura: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let velocity = { x: 0, y: 0 };
    let auraIntensity = 0; // 0 (calm) to 1 (focus/click)
    let time = 0;
    let isMouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
    };

    const handleMouseDown = () => { isMouseDown = true; };
    const handleMouseUp = () => { isMouseDown = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleMouseDown);
    window.addEventListener('touchend', handleMouseUp);

    const draw = () => {
      time += 0.02;
      
      // Physics: Smooth follow
      const dx = targetMouse.x - mouse.x;
      const dy = targetMouse.y - mouse.y;
      
      // Lag factor for RGB separation
      mouse.x += dx * 0.15;
      mouse.y += dy * 0.15;
      
      velocity.x = dx * 0.12;
      velocity.y = dy * 0.12;

      // Aura Logic: Becomes intense on click, relaxes when idle
      const targetIntensity = isMouseDown ? 1.0 : 0.0;
      auraIntensity += (targetIntensity - auraIntensity) * 0.1;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- LAYER 1: AURA (Organic, Soft, Protective) ---
      // Pulse breathes slowly when idle
      const breathe = Math.sin(time) * 0.1 + 0.9; 
      const auraRadius = 80 + (auraIntensity * 40) + (Math.sin(time * 2) * 10);
      
      const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, auraRadius * 2);
      // Spectral white/cyan glow
      auraGrad.addColorStop(0, `rgba(200, 240, 255, ${0.15 + auraIntensity * 0.2})`); 
      auraGrad.addColorStop(0.5, `rgba(200, 220, 255, ${0.05 + auraIntensity * 0.1})`);
      auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // --- LAYER 2: CHROMA (Technical, Precision, RGB Split) ---
      // Use exclusion for that inverted, high-tech look
      ctx.save();
      ctx.globalCompositeOperation = 'exclusion';
      ctx.lineWidth = 1.5;

      // Micro-shift when idle (breathing effect)
      const idleShiftX = Math.cos(time * 3) * 1.5;
      const idleShiftY = Math.sin(time * 3) * 1.5;

      const shiftX = Math.max(-15, Math.min(15, velocity.x)) + idleShiftX;
      const shiftY = Math.max(-15, Math.min(15, velocity.y)) + idleShiftY;

      const reticleSize = 25 - (auraIntensity * 5); // Tighten focus on click

      // RED CHANNEL (Lagging / Minus Shift)
      ctx.strokeStyle = `rgba(255, 50, 50, 0.9)`;
      ctx.beginPath();
      // Crosshair parts
      ctx.moveTo(mouse.x - shiftX - reticleSize, mouse.y - shiftY);
      ctx.lineTo(mouse.x - shiftX - (reticleSize/2), mouse.y - shiftY);
      ctx.moveTo(mouse.x - shiftX + (reticleSize/2), mouse.y - shiftY);
      ctx.lineTo(mouse.x - shiftX + reticleSize, mouse.y - shiftY);
      // Ring part
      ctx.arc(mouse.x - shiftX, mouse.y - shiftY, reticleSize * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // GREEN CHANNEL (Center / Anchor)
      ctx.strokeStyle = `rgba(50, 255, 100, 0.9)`;
      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y - reticleSize);
      ctx.lineTo(mouse.x, mouse.y - (reticleSize/2));
      ctx.moveTo(mouse.x, mouse.y + (reticleSize/2));
      ctx.lineTo(mouse.x, mouse.y + reticleSize);
      ctx.arc(mouse.x, mouse.y, reticleSize * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // BLUE CHANNEL (Leading / Plus Shift)
      ctx.strokeStyle = `rgba(50, 100, 255, 0.9)`;
      ctx.beginPath();
      // Box corners for blue channel
      const corner = reticleSize * 0.6;
      ctx.moveTo(mouse.x + shiftX - corner, mouse.y + shiftY - corner);
      ctx.lineTo(mouse.x + shiftX + corner, mouse.y + shiftY - corner);
      ctx.lineTo(mouse.x + shiftX + corner, mouse.y + shiftY + corner);
      ctx.lineTo(mouse.x + shiftX - corner, mouse.y + shiftY + corner);
      ctx.closePath();
      ctx.stroke();

      // Connecting "Data Lines" if moving fast
      const speed = Math.sqrt(shiftX*shiftX + shiftY*shiftY);
      if (speed > 4) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(speed/30, 0.4)})`;
          ctx.setLineDash([2, 4]);
          ctx.moveTo(mouse.x - shiftX, mouse.y - shiftY);
          ctx.lineTo(mouse.x + shiftX, mouse.y + shiftY);
          ctx.stroke();
          ctx.setLineDash([]);
      }

      ctx.restore();
      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchstart', handleMouseDown);
        window.removeEventListener('touchend', handleMouseUp);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[100] mix-blend-exclusion">
      <canvas ref={canvasRef} />
    </div>
  );
};

const SingularityEngine: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = useContainerSize(containerRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width || window.innerWidth;
    canvas.height = size.height || window.innerHeight;

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let targetMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    // Grid Setup
    const GRID_SIZE = 40;
    const cols = Math.ceil(canvas.width / GRID_SIZE) + 2;
    const rows = Math.ceil(canvas.height / GRID_SIZE) + 2;
    const points: {x: number, y: number, ox: number, oy: number}[] = [];
    
    for(let y = 0; y < rows; y++) {
        for(let x = 0; x < cols; x++) {
            points.push({
                x: x * GRID_SIZE - GRID_SIZE,
                y: y * GRID_SIZE - GRID_SIZE,
                ox: x * GRID_SIZE - GRID_SIZE, // Original Position
                oy: y * GRID_SIZE - GRID_SIZE
            });
        }
    }

    // Particle Setup (Photons)
    const particles: {x: number, y: number, vx: number, vy: number, history: {x: number, y: number}[]}[] = [];
    const PARTICLE_COUNT = 50;

    for(let i=0; i<PARTICLE_COUNT; i++) {
        particles.push(spawnParticle());
    }

    function spawnParticle() {
        // Spawn at edges
        const side = Math.floor(Math.random() * 4);
        let x = 0, y = 0, vx = 0, vy = 0;
        const speed = 2 + Math.random() * 2;
        
        if(side === 0) { // Top
            x = Math.random() * canvas.width; y = -10; vy = speed; vx = (Math.random()-0.5)*2;
        } else if(side === 1) { // Right
            x = canvas.width + 10; y = Math.random() * canvas.height; vx = -speed; vy = (Math.random()-0.5)*2;
        } else if(side === 2) { // Bottom
            x = Math.random() * canvas.width; y = canvas.height + 10; vy = -speed; vx = (Math.random()-0.5)*2;
        } else { // Left
            x = -10; y = Math.random() * canvas.height; vx = speed; vy = (Math.random()-0.5)*2;
        }
        return {x, y, vx, vy, history: []};
    }

    // Ripple Logic
    let ripple = { active: false, x: 0, y: 0, radius: 0, strength: 0 };

    const handleMouseMove = (e: MouseEvent) => {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
    };

    const handleMouseDown = () => {
        ripple = { active: true, x: mouse.x, y: mouse.y, radius: 0, strength: 100 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('touchstart', handleMouseDown);

    const draw = () => {
      // Physics: Smooth cursor movement (Singularity Center)
      mouse.x += (targetMouse.x - mouse.x) * 0.1;
      mouse.y += (targetMouse.y - mouse.y) * 0.1;

      // Update Ripple
      if (ripple.active) {
          ripple.radius += 10;
          ripple.strength *= 0.92;
          if (ripple.strength < 1) ripple.active = false;
      }

      ctx.fillStyle = '#000000'; // Void
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- 1. DRAW DISTORTED GRID ---
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.15)'; // Slate 700 low opacity
      ctx.lineWidth = 1;
      ctx.beginPath();

      points.forEach(p => {
          // Calculate Distortion Vector
          const dx = mouse.x - p.ox;
          const dy = mouse.y - p.oy;
          const distSq = dx*dx + dy*dy;
          const dist = Math.sqrt(distSq);
          
          // Inverse distance distortion (Singularity pull)
          // Limit singularity strength to avoid infinite folding
          const force = Math.min(100, 8000 / (dist + 50)); 
          const angle = Math.atan2(dy, dx);
          
          let displaceX = Math.cos(angle) * force;
          let displaceY = Math.sin(angle) * force;

          // Ripple effect (pushes out then pulls in)
          if (ripple.active) {
              const rdx = p.ox - ripple.x;
              const rdy = p.oy - ripple.y;
              const rDist = Math.sqrt(rdx*rdx + rdy*rdy);
              const wave = Math.sin((rDist - ripple.radius) * 0.05);
              const rForce = wave * ripple.strength * Math.exp(-Math.abs(rDist - ripple.radius)/50);
              const rAngle = Math.atan2(rdy, rdx);
              displaceX += Math.cos(rAngle) * rForce;
              displaceY += Math.sin(rAngle) * rForce;
          }

          p.x = p.ox + displaceX;
          p.y = p.oy + displaceY;
      });

      // Draw horizontal lines
      for(let y=0; y<rows; y++) {
          const startIdx = y * cols;
          ctx.moveTo(points[startIdx].x, points[startIdx].y);
          for(let x=1; x<cols; x++) {
              const p = points[startIdx + x];
              ctx.lineTo(p.x, p.y);
          }
      }
      // Draw vertical lines
      for(let x=0; x<cols; x++) {
          ctx.moveTo(points[x].x, points[x].y);
          for(let y=1; y<rows; y++) {
              const p = points[x + y * cols];
              ctx.lineTo(p.x, p.y);
          }
      }
      ctx.stroke();

      // --- 2. PHOTON PARTICLES (Geodesics) ---
      particles.forEach((p, idx) => {
          // Update velocity based on gravity
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx*dx + dy*dy;
          const dist = Math.sqrt(distSq);

          // Event Horizon Absorption
          if (dist < 20) {
              particles[idx] = spawnParticle();
              return;
          }

          // Gravitational Acceleration (Perpendicular component changes direction, parallel changes speed)
          // We want light bending, so modify velocity vector towards mass
          const gForce = 500 / distSq; 
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * gForce;
          p.vy += Math.sin(angle) * gForce;

          // Limit max speed (speed of light constant-ish)
          const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
          if (speed > 8) {
              p.vx = (p.vx / speed) * 8;
              p.vy = (p.vy / speed) * 8;
          }

          p.x += p.vx;
          p.y += p.vy;

          // History trail
          p.history.push({x: p.x, y: p.y});
          if(p.history.length > 10) p.history.shift();

          // Respawn if out of bounds
          if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
              particles[idx] = spawnParticle();
          }

          // Draw Trail
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, 200/distSq + 0.2)})`; // Brighten near singularity
          ctx.lineWidth = 1;
          if(p.history.length > 0) ctx.moveTo(p.history[0].x, p.history[0].y);
          for(let h of p.history) ctx.lineTo(h.x, h.y);
          ctx.stroke();
      });

      // --- 3. SINGULARITY CORE ---
      // Accretion Halo
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 15, mouse.x, mouse.y, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)'); // Photon Ring
      grad.addColorStop(0.25, 'rgba(100, 200, 255, 0.3)');
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
      ctx.fill();

      // Absolute Void Center
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(draw);
    };

    const anim = requestAnimationFrame(draw);
    return () => {
        cancelAnimationFrame(anim);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('touchstart', handleMouseDown);
    };
  }, [size]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[0]">
      <canvas ref={canvasRef} />
    </div>
  );
};

const GeometryVisual: React.FC<{ type: string; highlight?: string }> = ({ type, highlight }) => {
  if (type === 'pythagoras') return (
    <svg viewBox="0 0 200 150" className="w-full h-auto max-w-[150px] mx-auto opacity-80">
      <path d="M 40,110 L 160,110 L 40,30 Z" fill="none" stroke="#6366f1" strokeWidth="4" />
      <rect x="40" y="100" width="10" height="10" fill="none" stroke="#6366f1" strokeWidth="2" />
    </svg>
  );
  if (type === 'shapes') return (
    <svg viewBox="0 0 200 120" className="w-full h-auto max-w-[150px] mx-auto opacity-80">
      <path d="M 40,30 L 140,30 L 160,90 L 60,90 Z" fill="none" stroke="#10b981" strokeWidth="3" />
    </svg>
  );
  if (type === 'angles') return (
    <svg viewBox="0 0 200 100" className="w-full h-auto max-w-[150px] mx-auto opacity-80">
      <line x1="20" y1="80" x2="180" y2="80" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="100" y1="80" x2="160" y2="20" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
  return null;
};

// --- Sub-Components ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const user = await AuthService.login(name);
    onLogin(user);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-black italic uppercase mb-2 text-indigo-600">MathMaster</h1>
        <p className="text-slate-400 mb-8 font-medium">Dein Name, Legende?</p>
        <input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name eingeben..."
          className="w-full p-4 bg-slate-100 rounded-xl mb-4 font-bold text-center outline-none focus:ring-2 focus:ring-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <Button onClick={handleLogin} isLoading={loading} className="w-full">Starten 🚀</Button>
      </div>
    </div>
  );
};

const ChatView: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  
  const loadChat = async () => {
    const msgs = await SocialService.getChatMessages();
    setChat(msgs);
  };

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 5000);
    return () => clearInterval(interval);
  }, []);

  const send = async () => {
    if (!msg.trim()) return;
    await SocialService.sendMessage(currentUser, msg);
    setMsg('');
    loadChat();
  };

  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden col-span-2">
      <div className="p-4 border-b bg-slate-50/50 backdrop-blur-md">
        <CardTitle>Klassen-Chat</CardTitle>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col-reverse">
        {[...chat].reverse().map(c => (
          <div key={c.id} className={`flex gap-3 ${c.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-lg shadow-sm border border-white">
                {c.avatar}
             </div>
             <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                c.type === 'system' ? 'bg-amber-50 text-amber-800 border border-amber-100 w-full text-center italic' :
                c.userId === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
             }`}>
                {c.type !== 'system' && <div className={`text-[10px] font-black uppercase mb-1 opacity-50 ${c.userId === currentUser.id ? 'text-indigo-200' : 'text-slate-400'}`}>{c.username}</div>}
                {c.text}
             </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t flex gap-2">
        <input 
          className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Nachricht..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <Button size="sm" onClick={send}>→</Button>
      </div>
    </GlassCard>
  );
};

const LeaderboardView: React.FC<{ currentUser: User; onChallenge: (u: User) => void }> = ({ currentUser, onChallenge }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    SocialService.getLeaderboard().then(setUsers);
  }, []);

  return (
    <GlassCard className="h-full flex flex-col !p-0 overflow-hidden">
      <div className="p-4 border-b bg-slate-50/50 backdrop-blur-md">
        <CardTitle>Top Schüler</CardTitle>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {users.map((u, i) => (
          <div key={u.id} className={`flex items-center gap-3 p-3 rounded-xl border ${u.id === currentUser.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-amber-900' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-orange-800' : 'bg-slate-100 text-slate-400'}`}>
              {i + 1}
            </div>
            <div className="text-xl">{u.avatar}</div>
            <div className="flex-1 min-w-0">
               <div className="font-bold text-sm truncate">{u.username}</div>
               <div className="text-[10px] text-slate-400 font-bold uppercase">{u.xp} XP</div>
            </div>
            {u.id !== currentUser.id && (
               <Button size="sm" variant="secondary" className="!px-2 !py-1" onClick={() => onChallenge(u)}>⚔️</Button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

const ShopView: React.FC<{ user: User; onBuy: (item: ShopItem) => void; onPreview: (item: ShopItem) => void; previewEffect: string | null; isDarkMode: boolean }> = ({ user, onBuy, onPreview, previewEffect, isDarkMode }) => {
  const [filter, setFilter] = useState<'all' | 'avatar' | 'effect' | 'voucher'>('all');

  const filteredItems = SHOP_ITEMS.filter(i => filter === 'all' || i.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'avatar', 'effect', 'voucher'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all ${filter === f ? (isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white') : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500')}`}
          >
            {f === 'all' ? 'Alles' : f === 'avatar' ? 'Avatare' : f === 'effect' ? 'Effekte' : 'Gutscheine'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => {
           const owned = user.unlockedItems.includes(item.id) && item.type !== 'feature' && item.type !== 'voucher';
           const canAfford = user.coins >= item.cost;
           
           return (
             <GlassCard key={item.id} className={`!p-4 flex flex-col items-center text-center gap-3 ${owned ? 'opacity-50 grayscale' : ''}`}>
                <div className="text-4xl drop-shadow-md transition-transform hover:scale-110 duration-300">
                    {/* NEW: Use item.icon if available, else item.value */}
                    {item.icon || item.value}
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight mb-1">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium h-8 overflow-hidden">{item.description}</p>
                </div>
                
                <div className="mt-auto w-full flex flex-col gap-2">
                   <div className="font-black text-amber-500 text-sm">
                      {item.cost === 0 ? 'FREE' : `${item.cost} 🪙`}
                   </div>
                   {item.type === 'effect' && !owned && (
                      <Button size="sm" variant="secondary" onClick={() => onPreview(item)} className="w-full text-[10px]">
                        {previewEffect === item.value ? 'Stop' : 'Vorschau'}
                      </Button>
                   )}
                   <Button 
                      size="sm" 
                      variant={owned ? 'secondary' : canAfford ? 'primary' : 'secondary'} 
                      disabled={owned || !canAfford}
                      onClick={() => onBuy(item)}
                      className="w-full"
                   >
                      {owned ? 'Besitz' : 'Kaufen'}
                   </Button>
                </div>
             </GlassCard>
           );
        })}
      </div>
    </div>
  );
};

const UnitModal: React.FC<{ unit: LearningUnit; config: any; onConfigChange: (c: any) => void; onClose: () => void; onStart: () => void }> = ({ unit, config, onConfigChange, onClose, onStart }) => {
  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full mx-auto relative overflow-hidden">
         <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-colors">✕</button>
         
         <Badge color="indigo" className="mb-4">{unit.category}</Badge>
         <SectionHeading className="mb-4">{unit.title}</SectionHeading>
         <p className="text-slate-600 font-medium text-lg italic leading-relaxed">{unit.detailedInfo}</p>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
               <div className="font-black text-amber-600 uppercase text-xs tracking-widest mb-2">Belohnung</div>
               <div className="text-3xl font-black text-amber-500 mb-1">+{unit.coinsReward} 🪙</div>
               <div className="text-xs font-bold text-amber-400">bei Abschluss</div>
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
               <div className="font-black text-indigo-600 uppercase text-xs tracking-widest mb-2">Bounty (Perfekt)</div>
               <div className="text-3xl font-black text-indigo-500 mb-1">+{unit.bounty} 🏆</div>
               <div className="text-xs font-bold text-indigo-400">bei 100% ohne Hilfe</div>
            </div>
         </div>

         <div className="bg-slate-50 rounded-2xl p-6 mb-8">
            <h4 className="font-bold text-slate-900 uppercase text-sm mb-4">Einstellungen</h4>
            <div className="flex flex-col gap-3">
               <label className="flex items-center justify-between cursor-pointer group">
                  <span className="font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">⏱️ Zeitlimit (60s / Frage)</span>
                  <input type="checkbox" checked={config.timed} onChange={e => onConfigChange({...config, timed: e.target.checked})} className="w-6 h-6 accent-indigo-600" />
               </label>
               <label className="flex items-center justify-between cursor-pointer group">
                  <span className="font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">🚫 Kein Spickzettel (Hardcore)</span>
                  <input type="checkbox" checked={config.noCheatSheet} onChange={e => onConfigChange({...config, noCheatSheet: e.target.checked})} className="w-6 h-6 accent-indigo-600" />
               </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 italic">* Nur mit aktivierten Zeitlimit und ohne Spickzettel kannst du das Bounty gewinnen.</p>
         </div>

         <div className="flex gap-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">Zurück</Button>
            <Button onClick={onStart} className="flex-[2] text-lg">Quest Starten</Button>
         </div>
      </div>
    </ModalOverlay>
  );
};

const InventoryModal: React.FC<{ user: User; onClose: () => void; onToggleEffect: (id: string) => void; onAvatarChange: (val: string) => void }> = ({ user, onClose, onToggleEffect, onAvatarChange }) => {
  const ownedAvatars = SHOP_ITEMS.filter(i => i.type === 'avatar' && (i.cost === 0 || user.unlockedItems.includes(i.id)));
  const ownedEffects = SHOP_ITEMS.filter(i => i.type === 'effect' && user.unlockedItems.includes(i.id));

  return (
    <ModalOverlay onClose={onClose}>
       <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full mx-auto">
          <div className="flex justify-between items-center mb-8">
             <SectionHeading className="mb-0">Dein Inventar</SectionHeading>
             <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold">✕</button>
          </div>
          
          <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">Avatare</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-8">
             {ownedAvatars.map(av => (
                <button 
                  key={av.id} 
                  onClick={() => onAvatarChange(av.value)}
                  className={`aspect-square rounded-2xl text-2xl flex items-center justify-center border-2 transition-all ${user.avatar === av.value ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-lg' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                >
                   {av.icon || av.value}
                </button>
             ))}
          </div>

          <h3 className="font-bold text-slate-400 uppercase tracking-widest mb-4">Effekte</h3>
          {ownedEffects.length === 0 ? <p className="text-slate-400 italic mb-8">Noch keine Effekte gekauft.</p> : (
            <div className="grid grid-cols-2 gap-4 mb-8">
               {ownedEffects.map(ef => {
                  const isActive = user.activeEffects.includes(ef.value);
                  return (
                    <button 
                       key={ef.id}
                       onClick={() => onToggleEffect(ef.value)}
                       className={`p-4 rounded-xl border-2 flex justify-between items-center font-bold ${isActive ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-500'}`}
                    >
                       <span className="flex items-center gap-2"><span>{ef.icon}</span> <span>{ef.name}</span></span>
                       <span className="text-lg">{isActive ? 'ON' : 'OFF'}</span>
                    </button>
                  );
               })}
            </div>
          )}
       </div>
    </ModalOverlay>
  );
};

const QuestExecutionView: React.FC<{ 
  unit: LearningUnit; 
  config: { timed: boolean; noCheatSheet: boolean }; 
  onTaskSuccess: (coins: number) => void; 
  onComplete: (isPerfect: boolean) => void; 
  onCancel: () => void 
}> = ({ unit, config, onTaskSuccess, onComplete, onCancel }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null); // index or value
  const [textInput, setTextInput] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [wager, setWager] = useState<number>(0);

  useEffect(() => {
    let t = TaskFactory.generateTasks(unit.id, 5);
    if (config.timed && config.noCheatSheet) {
        t.push(TaskFactory.generateBountyTask(unit.id));
    }
    setTasks(t);
  }, [unit.id, config]);

  useEffect(() => {
    if (config.timed && !feedback && tasks.length > 0) {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setFeedback('wrong');
                    setMistakes(m => m + 1);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [config.timed, feedback, currentIdx, tasks.length]);

  const handleVerify = () => {
      const task = tasks[currentIdx];
      let isCorrect = false;

      if (task.type === 'choice' || task.type === 'wager') {
          isCorrect = selectedOption === task.correctAnswer;
      } else if (task.type === 'input') {
          isCorrect = textInput.trim().toLowerCase() === String(task.correctAnswer).toLowerCase();
      } else if (task.type === 'visualChoice') {
          isCorrect = selectedOption === task.correctAnswer;
      }

      if (isCorrect) {
          setFeedback('correct');
          let earned = 10;
          if (task.type === 'wager' && wager > 0) earned += wager;
          onTaskSuccess(earned);
      } else {
          setFeedback('wrong');
          setMistakes(m => m + 1);
          if (task.type === 'wager' && wager > 0) onTaskSuccess(-wager);
      }
  };

  const handleNext = () => {
      if (currentIdx < tasks.length - 1) {
          setCurrentIdx(p => p + 1);
          setFeedback(null);
          setSelectedOption(null);
          setTextInput('');
          setHint(null);
          setWager(0);
          setTimeLeft(60);
      } else {
          const isPerfect = mistakes === 0;
          onComplete(isPerfect);
      }
  };

  const requestHint = async () => {
      if (config.noCheatSheet) return;
      setLoadingHint(true);
      const h = await getMatheHint(unit.title, tasks[currentIdx].question);
      setHint(h);
      setLoadingHint(false);
      setMistakes(m => m + 1);
  };

  if (tasks.length === 0) return <div className="p-10 text-center">Lade Mission...</div>;

  const task = tasks[currentIdx];

  return (
    <div className="fixed inset-0 z-[120] bg-white flex flex-col">
       {/* Header */}
       <div className="p-4 border-b flex items-center justify-between bg-slate-50">
           <Button variant="ghost" onClick={onCancel}>Abbruch</Button>
           <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{unit.title}</span>
               <div className="flex gap-1">
                 {Array.from({length: tasks.length}).map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full ${i < currentIdx ? 'bg-emerald-400' : i === currentIdx ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                 ))}
               </div>
           </div>
           <div className={`font-mono font-bold ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
              {config.timed ? `${timeLeft}s` : '∞'}
           </div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full flex flex-col">
           {/* Question Card */}
           <div className="mb-8">
               <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-4">{task.question}</h3>
               {task.type === 'visualChoice' && task.visualData && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                      {task.visualData.map((v: any) => (
                          <div 
                            key={v.id} 
                            onClick={() => !feedback && setSelectedOption(v.id)}
                            className={`aspect-square rounded-xl border-2 flex items-center justify-center p-2 cursor-pointer transition-all ${selectedOption === v.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                          >
                             <svg viewBox="0 0 200 150" className="w-full h-full">
                                <path d={v.path} fill="none" stroke="currentColor" strokeWidth="3" className={selectedOption === v.id ? 'text-indigo-600' : 'text-slate-400'} />
                             </svg>
                          </div>
                      ))}
                  </div>
               )}
               {task.type === 'wager' && !feedback && (
                   <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100">
                       <div className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Wetteinsatz (Bonus Coins)</div>
                       <div className="flex gap-2">
                           {task.wagerOptions?.map(amt => (
                               <button 
                                 key={amt} 
                                 onClick={() => setWager(amt)}
                                 className={`px-4 py-2 rounded-lg font-bold text-xs border-2 transition-all ${wager === amt ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-amber-600 border-amber-200'}`}
                               >
                                   {amt}
                               </button>
                           ))}
                       </div>
                   </div>
               )}
           </div>

           {/* Input Area */}
           <div className="mb-8">
               {task.type === 'choice' || task.type === 'wager' ? (
                   <div className="grid grid-cols-1 gap-3">
                       {task.options?.map((opt, i) => (
                           <button 
                             key={i}
                             onClick={() => !feedback && setSelectedOption(i)}
                             className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${selectedOption === i ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-indigo-100'}`}
                           >
                               {opt}
                           </button>
                       ))}
                   </div>
               ) : task.type === 'input' ? (
                   <div>
                       <input 
                         type="text" 
                         value={textInput}
                         onChange={(e) => setTextInput(e.target.value)}
                         placeholder={task.placeholder || "Antwort..."}
                         disabled={!!feedback}
                         className="w-full p-4 text-lg font-bold rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500"
                       />
                   </div>
               ) : null}
           </div>

           {/* Hint Section */}
           {!config.noCheatSheet && !feedback && (
               <div className="mb-8">
                   {hint ? (
                       <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-800 italic border border-indigo-100">
                           💡 {hint}
                       </div>
                   ) : (
                       <button 
                         onClick={requestHint} 
                         disabled={loadingHint}
                         className="text-xs font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-2 transition-colors"
                       >
                           {loadingHint ? 'Mathelehrer denkt nach...' : '💡 Ich brauche einen Tipp (-1 Perfect)'}
                       </button>
                   )}
               </div>
           )}

           {/* Footer Action */}
           <div className="mt-auto pt-6 border-t">
               {!feedback ? (
                   <Button onClick={handleVerify} disabled={selectedOption === null && !textInput} className="w-full" size="lg">
                       Überprüfen
                   </Button>
               ) : (
                   <div className={`rounded-2xl p-6 mb-4 ${feedback === 'correct' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}`}>
                       <div className={`text-xl font-black uppercase italic mb-2 ${feedback === 'correct' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {feedback === 'correct' ? 'Richtig! 🎉' : 'Leider falsch 💀'}
                       </div>
                       <p className="text-slate-700 mb-6 font-medium">{task.explanation}</p>
                       <Button onClick={handleNext} variant={feedback === 'correct' ? 'success' : 'secondary'} className="w-full">
                           {currentIdx < tasks.length - 1 ? 'Weiter' : 'Abschließen'}
                       </Button>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

const BattleView: React.FC<{ 
  battle: BattleRequest; 
  onComplete: (score: number, perfect: boolean) => void; 
  onCancel: () => void 
}> = ({ battle, onComplete, onCancel }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    // Battle consists of 3 random tasks from the unit
    useEffect(() => {
        setTasks(TaskFactory.generateTasks(battle.unitId, 3));
    }, [battle]);

    const handleAnswer = (correct: boolean) => {
        if (correct) setScore(s => s + 1);
        
        if (idx < tasks.length - 1) {
            setIdx(i => i + 1);
        } else {
            // Wait a bit then finish
            setIsFinished(true);
            setTimeout(() => {
                onComplete(correct ? score + 1 : score, (correct ? score + 1 : score) === 3);
            }, 1500);
        }
    };

    if (tasks.length === 0) return <div>Loading Battle...</div>;
    
    const task = tasks[idx];

    if (isFinished) {
        return (
            <div className="fixed inset-0 z-[150] bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                <h2 className="text-3xl font-black italic uppercase mb-2">Battle Beendet!</h2>
                <div className="text-xl font-bold text-indigo-400 mb-8">Dein Score: {score} / 3</div>
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950 text-white flex flex-col">
            <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{battle.opponentAvatar}</div>
                    <div>
                        <div className="text-xs font-black uppercase text-slate-500">Gegner</div>
                        <div className="font-bold">{battle.opponentName}</div>
                    </div>
                </div>
                <div className="text-2xl font-black italic text-indigo-500">VS</div>
                <div className="text-right">
                    <div className="text-xs font-black uppercase text-slate-500">Runde</div>
                    <div className="font-bold">{idx + 1} / 3</div>
                </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center max-w-lg mx-auto w-full">
                <h3 className="text-xl font-bold mb-8 leading-relaxed">{task.question}</h3>
                
                {task.type === 'choice' || task.type === 'wager' ? (
                   <div className="grid gap-4">
                       {task.options?.map((opt, i) => (
                           <button 
                             key={i}
                             onClick={() => handleAnswer(i === task.correctAnswer)}
                             className="p-5 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 font-bold text-left transition-all active:scale-95"
                           >
                               {opt}
                           </button>
                       ))}
                   </div>
                ) : (
                   <div className="bg-slate-800 p-6 rounded-2xl text-center">
                       <p className="text-slate-400 italic mb-4">Eingabe-Aufgaben sind im Blitz-Battle deaktiviert.</p>
                       <Button onClick={() => handleAnswer(true)} className="w-full">Geschenkter Punkt (Demo)</Button>
                   </div>
                )}
            </div>
            
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                <button onClick={onCancel} className="text-xs font-bold text-slate-500 uppercase hover:text-white">Aufgeben</button>
            </div>
        </div>
    );
};

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(AuthService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'learn' | 'community' | 'shop'>('learn');
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [activeBattle, setActiveBattle] = useState<BattleRequest | null>(null);
  const [questConfig, setQuestConfig] = useState({ timed: false, noCheatSheet: false });
  const [isCoinPulsing, setIsCoinPulsing] = useState(false);
  const [isFlyingCoinActive, setIsFlyingCoinActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<ShopItem | null>(null);
  const [previewEffect, setPreviewEffect] = useState<string | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const activeEffect = (name: string) => user?.activeEffects.includes(name) || previewEffect === name;
  const isDarkMode = activeEffect('dark');
  const hasRainbow = activeEffect('rainbow');

  // Swipe logic state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  if (!user) return <AuthScreen onLogin={setUser} />;

  // --- Global Swipe Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    // Check if we are in a mode where swipe should be disabled
    if (isTaskMode || isBattleMode || isInventoryOpen || isRenameModalOpen || activeVoucher) return;

    const tabs = ['learn', 'community', 'shop'] as const;
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
        addToast(`Tab: ${tabs[currentIndex + 1].charAt(0).toUpperCase() + tabs[currentIndex + 1].slice(1)}`, 'info');
    }
    if (isRightSwipe && currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1]);
        addToast(`Tab: ${tabs[currentIndex - 1].charAt(0).toUpperCase() + tabs[currentIndex - 1].slice(1)}`, 'info');
    }
  };

  const triggerCoinAnimation = () => {
    setIsFlyingCoinActive(true);
    setTimeout(() => {
        setIsCoinPulsing(true);
        setTimeout(() => setIsCoinPulsing(false), 500);
    }, 900); // Pulse when animation lands
  };

  // Called immediately when a single task is solved correctly
  const handleTaskSuccess = async (coinsEarned: number) => {
     if (!user || coinsEarned === 0) return; // Allow negative changes? Current implementation of coin update below.
     // Handle coin updates (can be negative for wager loss)
     const newCoins = Math.max(0, user.coins + coinsEarned);
     const updated = { ...user, coins: newCoins, totalEarned: coinsEarned > 0 ? user.totalEarned + coinsEarned : user.totalEarned };
     
     // Optimistic Update
     setUser(updated);
     // Save to DB immediately
     await DataService.updateUser(updated);

     if(coinsEarned > 0) triggerCoinAnimation();
  };

  const handleQuestComplete = async (isPerfectRun: boolean) => {
    if (!selectedUnit || !user) return;
    
    // Base reward is always given for finishing
    let earnedCoins = selectedUnit.coinsReward;
    
    // Bounty is only given for perfect run (which includes passing the final boss task)
    if (isPerfectRun) {
        earnedCoins += selectedUnit.bounty;
    }

    const newCoins = user.coins + earnedCoins;
    const newXp = user.xp + (isPerfectRun ? 200 : 50);
    
    const updated = { 
      ...user, 
      coins: newCoins,
      xp: newXp, 
      completedUnits: [...new Set([...user.completedUnits, selectedUnit.id])],
      // Add to masteredUnits only if Perfect Run (Bounty Claimed)
      masteredUnits: isPerfectRun ? [...new Set([...(user.masteredUnits || []), selectedUnit.id])] : (user.masteredUnits || [])
    };
    
    // Optimistic Update
    setUser(updated);
    
    // Save to DB
    await DataService.updateUser(updated);
    
    triggerCoinAnimation();
    if (isPerfectRun) {
        addToast(`BOUNTY GEHOLT! +${selectedUnit.bounty} Coins`, 'success');
        await SocialService.broadcastEvent(user.username, `hat das Bounty (${selectedUnit.bounty}) für "${selectedUnit.title}" kassiert! 🏆`);
    } else {
        addToast(`Quest abgeschlossen! +${selectedUnit.coinsReward} Coins`, 'info');
    }

    setIsTaskMode(false);
    setSelectedUnit(null);
  };

  const startBattle = (opponent: User) => {
    if (user.coins < 100) {
      addToast("Nicht genug Coins! Du brauchst 100.", 'error');
      return;
    }
    const unit = LEARNING_UNITS[Math.floor(Math.random() * LEARNING_UNITS.length)];
    const battle: BattleRequest = {
      id: Math.random().toString(36).substr(2, 9),
      challengerId: user.id,
      opponentId: opponent.id,
      opponentName: opponent.username,
      opponentAvatar: opponent.avatar,
      unitId: unit.id,
      unitTitle: unit.title,
      wager: 100,
      status: 'active'
    };
    setActiveBattle(battle);
    setIsBattleMode(true);
    addToast(`Battle gegen ${opponent.username} gestartet!`, 'info');
  };

  const handleBattleComplete = async (score: number, perfect: boolean) => {
    if (!activeBattle || !user) return;
    const botSkill = activeBattle.opponentId === 'bot3' ? 5 : activeBattle.opponentId === 'bot2' ? 4 : 3;
    const opponentScore = Math.floor(Math.random() * (botSkill + 1));
    const win = score > opponentScore || (score === opponentScore && perfect);
    
    let newCoins = user.coins;
    let newXp = user.xp;
    let message = "";
    let type: ToastType = "info";

    if (win) {
      newCoins = user.coins + activeBattle.wager;
      newXp = user.xp + 300;
      message = `Sieg! Du hast ${activeBattle.wager} Coins gewonnen.`;
      type = "success";
      triggerCoinAnimation();
    } else {
      newCoins = user.coins - activeBattle.wager;
      message = `Verloren! ${activeBattle.wager} Coins sind weg.`;
      type = "error";
    }

    const updated = { ...user, coins: newCoins, xp: newXp };
    setUser(updated);
    await DataService.updateUser(updated);
    addToast(message, type);

    setIsBattleMode(false);
    setActiveBattle(null);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!user || user.coins < item.cost) {
      addToast("Nicht genug Coins!", 'error');
      return;
    }
    const isOwned = user.unlockedItems.includes(item.id);
    if (isOwned && (item.type !== 'feature' && item.type !== 'voucher')) return;

    await new Promise(r => setTimeout(r, 600));

    let updatedUser = { ...user, coins: user.coins - item.cost };
    if (item.type === 'voucher') {
       setActiveVoucher(item);
    } else if (item.type !== 'feature') {
      updatedUser.unlockedItems = [...new Set([...user.unlockedItems, item.id])];
      if (item.type === 'effect') {
         setPreviewEffect(null);
      }
    } else if (item.value === 'rename') {
      setTempName('');
      setIsRenameModalOpen(true);
    }
    setUser(updatedUser);
    await DataService.updateUser(updatedUser);
    addToast(`"${item.name}" gekauft!`, 'success');
  };

  const handleRename = async () => {
    if (!user || !tempName.trim()) return;
    const updated = { ...user, username: tempName.trim() };
    setUser(updated);
    await DataService.updateUser(updated);
    setIsRenameModalOpen(false);
    addToast(`Name geändert zu ${tempName}`, 'success');
  };

  // Calculate progress stats
  // Note: user is guaranteed to be non-null here because of the early return <AuthScreen /> above.
  const totalProgress = user ? (user.completedUnits.length / LEARNING_UNITS.length) * 100 : 0;

  const getGroupProgress = (group: CategoryGroup) => {
     if (!user) return 0;
     const groupUnits = LEARNING_UNITS.filter(u => u.group === group);
     if (groupUnits.length === 0) return 0;
     const completedCount = groupUnits.filter(u => user.completedUnits.includes(u.id)).length;
     return (completedCount / groupUnits.length) * 100;
  };

  return (
    <div 
      className={`min-h-screen transition-all ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#fcfdfe] text-slate-900'} overflow-x-hidden`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <ToastContainer toasts={toasts} />
      <CoinFlightAnimation isActive={isFlyingCoinActive} onComplete={() => setIsFlyingCoinActive(false)} />
      
      {/* Visual Effects */}
      {activeEffect('rain') && <MatrixRain />}
      {activeEffect('storm') && <ElectricStorm />}
      {activeEffect('unicorn') && <UnicornMagic />}
      {activeEffect('neon') && <NeonDreams />}
      {activeEffect('galaxy') && <GalaxyMode />}
      {activeEffect('fire') && <FireBlaze />}
      {activeEffect('rainbow') && <ChromaAura />}
      {activeEffect('singularity') && <SingularityEngine />}

      {/* Global Calculator Widget */}
      {isCalculatorOpen && <CalculatorWidget onClose={() => setIsCalculatorOpen(false)} />}

      {!isTaskMode && !isBattleMode && (
        <>
          <nav className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-2xl border p-2 rounded-full shadow-2xl flex items-center gap-1 ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
            {(['learn', 'community', 'shop'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white scale-105 shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}>
                {tab === 'learn' ? '📖 Quests' : tab === 'community' ? '🤝 Klasse' : '🛒 Shop'}
              </button>
            ))}
          </nav>

          <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-4 sm:px-8 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
            <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => setIsInventoryOpen(true)}>
              <div className={`relative text-2xl sm:text-3xl p-2 rounded-xl border transition-all duration-300 group-hover:scale-105 
                ${hasRainbow 
                  ? 'animate-pulse bg-gradient-to-tr from-pink-500 via-yellow-500 to-cyan-500 border-none ring-4 ring-offset-2 ring-transparent bg-clip-padding' 
                  : isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}
                ${hasRainbow ? 'shadow-[0_0_15px_rgba(236,72,153,0.5)]' : ''}
              `}>
                {user.avatar}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight italic uppercase group-hover:text-indigo-500 transition-colors truncate max-w-[120px] sm:max-w-none">{user.username}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   {PROGRESS_LEVELS[Math.min(Math.floor(user.xp / 100), PROGRESS_LEVELS.length - 1)].title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                 className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isCalculatorOpen ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               >
                 🧮
               </button>
               <div className={`px-4 py-1.5 bg-slate-900 text-white rounded-xl font-black text-xs transition-all shadow-lg ${isCoinPulsing ? 'scale-110 bg-amber-500' : ''}`}>🪙 {user.coins}</div>
               <div className="hidden xs:block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs uppercase tracking-tighter shadow-sm">{user.xp} XP</div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-32 relative z-10">
            {activeTab === 'learn' && (
              <>
                <div className="mb-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                    <div>
                      <SectionHeading className="mb-2">Geometry Map</SectionHeading>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {(['A', 'B', 'C'] as CategoryGroup[]).map(g => (
                          <div key={g} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${GROUP_THEME[g].color}-500`} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{GROUP_LABELS[g]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full md:w-80 relative group">
                      <input type="text" placeholder="Themen suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full px-6 py-4 rounded-2xl border-2 font-bold text-sm outline-none transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">🔍</div>
                    </div>
                  </div>

                  <GlassCard className="mb-8 !p-6">
                    <ProgressBar progress={totalProgress} label="Gesamtfortschritt" className="mb-6" />
                    <div className="grid grid-cols-3 gap-4">
                      <ProgressBar progress={getGroupProgress('A')} color="indigo" label="Raum & Form" />
                      <ProgressBar progress={getGroupProgress('B')} color="emerald" label="Messen" />
                      <ProgressBar progress={getGroupProgress('C')} color="amber" label="Kontext" />
                    </div>
                  </GlassCard>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {LEARNING_UNITS.filter(u => u.title.toLowerCase().includes(searchTerm.toLowerCase())).map(unit => {
                    const theme = GROUP_THEME[unit.group];
                    // Check mastery (Bounty claimed) for green checkmark
                    const isMastered = user.masteredUnits && user.masteredUnits.includes(unit.id);
                    return (
                      <GlassCard 
                        key={unit.id} 
                        onClick={() => setSelectedUnit(unit)} 
                        isInteractive={true}
                        className={`overflow-hidden border-b-4 !border-b-${theme.color}-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <Badge color="amber">
                             💎 {unit.coinsReward}
                          </Badge>
                          {isMastered ? <span className="text-emerald-500 font-black text-lg animate-in zoom-in">✔</span> : <DifficultyStars difficulty={unit.difficulty} />}
                        </div>
                        <CardTitle className="mb-2">{unit.title}</CardTitle>
                        <p className="text-slate-400 font-medium italic text-xs leading-relaxed mb-4 line-clamp-2">{unit.description}</p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{unit.tasks.length} Aufgaben</span>
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Bounty {unit.bounty} 🏆</span>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              </>
            )}
            
            {activeTab === 'community' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[70vh]"><ChatView currentUser={user} /><LeaderboardView currentUser={user} onChallenge={startBattle} /></div>}
            
            {activeTab === 'shop' && <ShopView user={user} onBuy={handleBuy} onPreview={(item: ShopItem) => setPreviewEffect(previewEffect === item.value ? null : item.value)} previewEffect={previewEffect} isDarkMode={isDarkMode} />}
          </main>
        </>
      )}

      {selectedUnit && !isTaskMode && <UnitModal unit={selectedUnit} config={questConfig} onConfigChange={setQuestConfig} onClose={() => setSelectedUnit(null)} onStart={() => setIsTaskMode(true)} />}
      
      {isTaskMode && selectedUnit && <QuestExecutionView unit={selectedUnit} config={questConfig} onTaskSuccess={handleTaskSuccess} onComplete={handleQuestComplete} onCancel={() => setIsTaskMode(false)} />}
      
      {isBattleMode && activeBattle && <BattleView battle={activeBattle} onComplete={handleBattleComplete} onCancel={() => { setIsBattleMode(false); setActiveBattle(null); }} />}

      {isInventoryOpen && <InventoryModal user={user} onClose={() => setIsInventoryOpen(false)} onToggleEffect={async (val) => {
        const isActive = user.activeEffects.includes(val);
        const updated = { ...user, activeEffects: isActive ? user.activeEffects.filter(e => e !== val) : [...user.activeEffects, val] };
        setUser(updated);
        await DataService.updateUser(updated);
      }} onAvatarChange={async (val) => {
        const updated = { ...user, avatar: val };
        setUser(updated);
        await DataService.updateUser(updated);
      }} />}

      {isRenameModalOpen && (
        <ModalOverlay onClose={() => setIsRenameModalOpen(false)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-slate-950 text-center">
            <h3 className="text-xl font-black uppercase italic mb-6">Neuer Name</h3>
            <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl mb-6 font-black text-center outline-none border-2 border-transparent focus:border-indigo-500" placeholder="Cooler Name..." />
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setIsRenameModalOpen(false)} className="flex-1">Abbruch</Button>
              <Button onClick={handleRename} className="flex-1">Ändern</Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {activeVoucher && (
        <ModalOverlay onClose={() => setActiveVoucher(null)}>
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center animate-in zoom-in">
              <div className="text-8xl mb-6">🎁</div>
              <h2 className="text-3xl font-black uppercase italic mb-4">Gutschein Gekauft!</h2>
              <p className="text-slate-600 font-medium italic mb-8 leading-relaxed">Du hast den {activeVoucher.name} erfolgreich erworben.</p>
              <div className="bg-slate-100 p-6 rounded-2xl font-mono text-indigo-600 font-bold mb-8 select-all">AMZN-{activeVoucher.value}-{Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              <Button onClick={() => setActiveVoucher(null)} size="lg" className="w-full">Super!</Button>
           </div>
        </ModalOverlay>
      )}
    </div>
  );
}