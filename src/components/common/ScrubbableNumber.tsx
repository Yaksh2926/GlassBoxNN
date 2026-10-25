import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ScrubbableNumberProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  label?: string;
  color?: 'cyan' | 'magenta' | 'amber' | 'violet' | 'emerald';
  disabled?: boolean;
}

export const ScrubbableNumber: React.FC<ScrubbableNumberProps> = ({
  value,
  onChange,
  min = -5,
  max = 5,
  step = 0.02,
  precision = 2,
  label,
  color = 'cyan',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editString, setEditString] = useState(value.toFixed(precision));
  const dragRef = useRef<{ startX: number; startVal: number } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditString(value.toFixed(precision));
    }
  }, [value, precision, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isEditing || e.button !== 0) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      startX: e.clientX,
      startVal: value,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    // Blender-style precision modifier: Shift = 5x slower (fine), Alt = 20x slower (ultra-fine)
    const multiplier = e.shiftKey ? 0.005 : e.altKey ? 0.001 : step;
    let nextVal = dragRef.current.startVal + deltaX * multiplier;
    nextVal = Math.max(min, Math.min(max, nextVal));
    nextVal = Math.round(nextVal * 1000) / 1000;

    onChange(nextVal);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditString(value.toFixed(precision));
  };

  const handleCommitEdit = () => {
    setIsEditing(false);
    const parsed = parseFloat(editString);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(Math.round(clamped * 1000) / 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditString(value.toFixed(precision));
    }
  };

  // Color mapping
  const colorStyles = {
    cyan: {
      text: 'text-cyber-cyan',
      borderHover: 'hover:border-cyber-cyan/60',
      activeBg: 'bg-cyber-cyan/15',
      activeBorder: 'border-cyber-cyan',
      bar: 'bg-cyber-cyan/30',
    },
    magenta: {
      text: 'text-cyber-magenta',
      borderHover: 'hover:border-cyber-magenta/60',
      activeBg: 'bg-cyber-magenta/15',
      activeBorder: 'border-cyber-magenta',
      bar: 'bg-cyber-magenta/30',
    },
    amber: {
      text: 'text-cyber-amber',
      borderHover: 'hover:border-cyber-amber/60',
      activeBg: 'bg-cyber-amber/15',
      activeBorder: 'border-cyber-amber',
      bar: 'bg-cyber-amber/30',
    },
    violet: {
      text: 'text-cyber-violet',
      borderHover: 'hover:border-cyber-violet/60',
      activeBg: 'bg-cyber-violet/15',
      activeBorder: 'border-cyber-violet',
      bar: 'bg-cyber-violet/30',
    },
    emerald: {
      text: 'text-emerald-400',
      borderHover: 'hover:border-emerald-400/60',
      activeBg: 'bg-emerald-400/15',
      activeBorder: 'border-emerald-400',
      bar: 'bg-emerald-400/30',
    },
  }[color];

  // Fill percent for subtle background bar: map value from [min, max] -> [0, 100]%
  const fillPct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  if (isEditing) {
    return (
      <div className="relative flex flex-col items-center">
        {label && (
          <span className={`text-[8.5px] uppercase font-mono tracking-wider ${colorStyles.text} mb-0.5`}>
            {label}
          </span>
        )}
        <input
          ref={inputRef}
          type="number"
          step={step}
          value={editString}
          onChange={e => setEditString(e.target.value)}
          onBlur={handleCommitEdit}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#05070B] border border-cyber-cyan text-white text-xs font-mono tabular-nums px-1.5 py-1 rounded text-center outline-none shadow-cyan-glow"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {label && (
        <span className={`text-[8.5px] uppercase font-mono tracking-wider ${colorStyles.text} mb-0.5 select-none`}>
          {label}
        </span>
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        title="Click & Drag left/right to scrub value. Double-click to type. Shift for fine."
        className={`relative w-full h-7 rounded border transition-all scrub-cursor flex items-center justify-center overflow-hidden select-none ${
          isDragging
            ? `${colorStyles.activeBg} ${colorStyles.activeBorder} shadow-sm scale-[1.02]`
            : `bg-[#0E121B] border-white/[0.08] ${colorStyles.borderHover}`
        }`}
      >
        {/* Subtle background gauge bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 pointer-events-none opacity-40 transition-[width] duration-75 ${colorStyles.bar}`}
          style={{ width: `${fillPct}%` }}
        />

        {/* Formatted Number */}
        <span className="relative z-10 text-xs font-mono font-medium tabular-nums text-slate-100 tracking-tight">
          {value >= 0 ? `+${value.toFixed(precision)}` : value.toFixed(precision)}
        </span>
      </div>
    </div>
  );
};
