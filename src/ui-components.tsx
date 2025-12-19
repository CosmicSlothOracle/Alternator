import React, { useEffect, useState, useRef, useCallback } from 'react';

// --- Typography & Layout ---

export const SectionHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter mb-6 ${className}`}>
    {children}
  </h2>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg sm:text-xl lg:text-2xl font-black uppercase italic leading-tight ${className}`}>
    {children}
  </h3>
);

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; isInteractive?: boolean }> = ({ 
  children, className = '', onClick, isInteractive = false 
}) => (
  <div 
    onClick={onClick}
    className={`
      relative p-6 sm:p-8 rounded-[2rem] border-2 backdrop-blur-xl transition-all duration-300
      ${isInteractive ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// --- Interactive Elements ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, icon, className = '', disabled, ...props 
}) => {
  const baseStyles = "relative font-black uppercase tracking-widest rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl hover:shadow-indigo-500/30 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border-2 border-slate-200",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl border-b-4 border-emerald-800",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs sm:text-sm min-h-[44px]", // Minimum touch target
    lg: "px-8 py-4 sm:py-5 text-sm sm:text-base min-h-[56px]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate'; className?: string }> = ({ 
  children, color = 'slate', className = '' 
}) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-100 text-slate-500 border-slate-200"
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export const DifficultyStars: React.FC<{ difficulty: 'Einfach' | 'Mittel' | 'Schwer' }> = ({ difficulty }) => {
  const count = difficulty === 'Einfach' ? 1 : difficulty === 'Mittel' ? 2 : 3;
  const color = difficulty === 'Einfach' ? 'text-emerald-400' : difficulty === 'Mittel' ? 'text-amber-400' : 'text-rose-500';
  
  return (
    <div className="flex gap-0.5" aria-label={`Schwierigkeit: ${difficulty}`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={`text-xs sm:text-sm ${i <= count ? color : 'text-slate-200'}`}>★</span>
      ))}
    </div>
  );
};

// --- Feedback ---

export const ToastContainer: React.FC<{ toasts: { id: string; type: 'success' | 'error' | 'info'; message: string }[] }> = ({ toasts }) => (
  <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-[200] flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4" aria-live="polite">
    {toasts.map(t => (
      <div 
        key={t.id} 
        className={`
          pointer-events-auto p-4 rounded-2xl shadow-2xl border-l-4 flex items-center gap-3 animate-in slide-in-from-bottom fade-in duration-300
          ${t.type === 'success' ? 'bg-white border-emerald-500 text-slate-800' : 
            t.type === 'error' ? 'bg-white border-rose-500 text-slate-800' : 
            'bg-slate-900 border-indigo-500 text-white'}
        `}
      >
        <span className="text-xl">{t.type === 'success' ? '🎉' : t.type === 'error' ? '⚠️' : 'ℹ️'}</span>
        <span className="font-bold text-xs sm:text-sm">{t.message}</span>
      </div>
    ))}
  </div>
);

export const CoinFlightAnimation: React.FC<{ isActive: boolean; onComplete: () => void }> = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isActive) {
      // Spawn particles
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        x: Math.random() * 40 - 20, // Spread around center
        y: Math.random() * 40 - 20 
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center">
      {particles.map((p, i) => (
        <div
          key={p.id}
          className="absolute text-2xl transition-all duration-1000 ease-in-out"
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`, // Start position
            animation: `flyToCorner 1s forwards ${i * 0.05}s`
          }}
        >
          <div className="animate-spin text-amber-400 drop-shadow-lg">🪙</div>
        </div>
      ))}
      <style>{`
        @keyframes flyToCorner {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          20% {
             transform: translate(0, -50px) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translate(40vw, -45vh) scale(0.5); /* Target top right roughly */
          }
        }
      `}</style>
    </div>
  );
};

// --- Loading ---

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200/50 animate-pulse rounded-xl ${className}`} />
);

export const ProgressBar: React.FC<{ progress: number; color?: 'indigo' | 'emerald' | 'amber'; className?: string; label?: string }> = ({ 
  progress, color = 'indigo', className = '', label
}) => {
  const colors = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500"
  };
  
  return (
    <div className={`w-full ${className}`}>
      {label && <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} transition-all duration-1000 ease-out`} 
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} 
        />
      </div>
    </div>
  );
};

// --- Layout ---

export const ModalOverlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic focus trap or just focus management
    overlayRef.current?.focus();
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-label="Close modal"
      />
      <div 
        ref={overlayRef}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar outline-none"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

// --- Tools ---

export const CalculatorWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState('');
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Constraint to window bounds roughly
      const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragStart.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragStart.current.y));
      setPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleInput = (val: string) => {
    // Basic logic
    if (result && !isNaN(Number(val)) && !isNaN(Number(display))) {
       // Start new calculation if user types number after result
       setDisplay(val);
       setResult('');
    } else if (result) {
       // Continue with result if operator
       setDisplay(result + val);
       setResult('');
    } else {
       setDisplay(prev => prev + val);
    }
  };

  const clear = () => {
    setDisplay('');
    setResult('');
  };

  const backspace = () => {
    setDisplay(prev => prev.slice(0, -1));
  };

  const calculate = () => {
    try {
      // Safe-ish eval for school math
      let expression = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/²/g, '**2') // Handle x² display
        .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)') // Handle √4 simple case
        .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)'); // Handle √(4+5) complex case

      // Basic percentage logic: 50% -> 0.5, but 100 + 50% -> 100 + 100*0.5
      // Simplest for school: % -> /100
      expression = expression.replace(/%/g, '/100');

      // Check for empty or invalid chars
      if (!expression.trim() || /[^0-9+\-*/().\sMathsqrt*]/.test(expression.replace(/Math.sqrt/g, ''))) {
         throw new Error("Invalid");
      }

      // Execute
      // eslint-disable-next-line no-new-func
      const res = new Function(`return ${expression}`)();
      
      // Format: max 8 decimals, remove trailing zeros
      let formatted = parseFloat(res.toFixed(8)).toString();
      setResult(formatted);
    } catch (e) {
      setResult('Error');
    }
  };

  const Btn = ({ l, v, c }: { l: React.ReactNode, v?: string, c?: string }) => (
    <button 
      onClick={() => v ? handleInput(v) : undefined} 
      className={`h-12 rounded-xl font-bold text-lg active:scale-95 transition-all shadow-sm border border-slate-100 ${c || 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
    >
      {l}
    </button>
  );

  return (
    <div 
      style={{ left: position.x, top: position.y }}
      className="fixed z-[160] w-80 shadow-2xl rounded-[2rem] overflow-hidden backdrop-blur-xl bg-white/90 border border-slate-200 animate-in zoom-in-95 duration-200"
    >
      {/* Header (Draggable) */}
      <div 
        onMouseDown={handleMouseDown}
        className="bg-slate-100/50 p-4 flex justify-between items-center cursor-move select-none border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
           <span className="text-xl">🧮</span>
           <span className="font-black text-xs uppercase tracking-widest text-slate-500">Taschenrechner</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-slate-500 hover:bg-rose-500 hover:text-white transition-colors">✕</button>
      </div>

      {/* Display */}
      <div className="p-6 bg-slate-50 text-right border-b border-slate-100">
         <div className="h-6 text-sm font-medium text-slate-400 overflow-hidden whitespace-nowrap">{display || '0'}</div>
         <div className="h-10 text-3xl font-black text-slate-800 overflow-hidden whitespace-nowrap">{result || (display ? '=' : '')}</div>
      </div>

      {/* Pad */}
      <div className="p-4 grid grid-cols-4 gap-2">
         {/* Row 1 */}
         <button onClick={clear} className="col-span-2 h-12 rounded-xl font-black text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 uppercase text-xs tracking-widest">Clear</button>
         <button onClick={backspace} className="h-12 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">⌫</button>
         <Btn l="÷" v="÷" c="bg-indigo-50 text-indigo-600" />

         {/* Row 2 */}
         <Btn l="(" v="(" c="text-slate-400 bg-white" />
         <Btn l=")" v=")" c="text-slate-400 bg-white" />
         <Btn l="%" v="%" c="text-slate-400 bg-white" />
         <Btn l="×" v="×" c="bg-indigo-50 text-indigo-600" />

         {/* Row 3 */}
         <Btn l="7" v="7" />
         <Btn l="8" v="8" />
         <Btn l="9" v="9" />
         <Btn l="-" v="-" c="bg-indigo-50 text-indigo-600" />

         {/* Row 4 */}
         <Btn l="4" v="4" />
         <Btn l="5" v="5" />
         <Btn l="6" v="6" />
         <Btn l="+" v="+" c="bg-indigo-50 text-indigo-600" />

         {/* Row 5 */}
         <Btn l="1" v="1" />
         <Btn l="2" v="2" />
         <Btn l="3" v="3" />
         <button onClick={() => { calculate(); }} className="row-span-2 h-full rounded-xl font-black text-white bg-indigo-600 shadow-indigo-500/30 shadow-lg active:translate-y-1">=</button>

         {/* Row 6 */}
         <Btn l="0" v="0" />
         <Btn l="." v="." />
         <Btn l="x²" v="²" />
         {/* Hidden/Advanced toggles could go here later */}
      </div>
    </div>
  );
};

// --- Interaction ---

export const PullToRefresh: React.FC<{ onRefresh: () => Promise<void>, children: React.ReactNode, className?: string }> = ({ onRefresh, children, className = '' }) => {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && !loading) {
      const y = e.touches[0].clientY;
      const dist = Math.max(0, y - startY);
      setPullDistance(dist);
      if (dist > 60) setPulling(true);
      else setPulling(false);
    }
  };

  const handleTouchEnd = async () => {
    if (pulling) {
      setLoading(true);
      setPulling(false);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setLoading(false);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  return (
    <div 
      ref={containerRef}
      className={`h-full overflow-y-auto custom-scrollbar relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullDistance > 0 || loading) && (
        <div 
          className="absolute left-0 right-0 flex justify-center z-20 pointer-events-none transition-all duration-200"
          style={{ top: loading ? '10px' : Math.min(pullDistance / 2, 40) + 'px', opacity: Math.min(pullDistance / 50, 1) }}
        >
             <div className="bg-white/90 backdrop-blur-md text-indigo-600 rounded-full px-4 py-1.5 shadow-lg border border-indigo-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                {loading ? (
                  <><span className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"/> Aktualisiere...</>
                ) : (
                  <><span className={`transition-transform duration-200 ${pulling ? 'rotate-180' : ''}`}>↓</span> Loslassen zum Laden</>
                )}
             </div>
        </div>
      )}
      {children}
    </div>
  )
}