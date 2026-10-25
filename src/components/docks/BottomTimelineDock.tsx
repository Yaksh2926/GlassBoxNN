import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Repeat, FastForward, Sparkles } from 'lucide-react';

interface BottomTimelineDockProps {
  tau: number;
  onChangeTau: (updater: number | ((prevTau: number) => number)) => void;
  tauSVD: number;
  onChangeTauSVD: (updater: number | ((prevTau: number) => number)) => void;
  warperMode: 'homotopy' | 'svd';
  onChangeWarperMode: (mode: 'homotopy' | 'svd') => void;
}

export const BottomTimelineDock: React.FC<BottomTimelineDockProps> = ({
  tau,
  onChangeTau,
  tauSVD,
  onChangeTauSVD,
  warperMode,
  onChangeWarperMode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1.0 | 2.0>(1.0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const currentVal = warperMode === 'homotopy' ? tau : tauSVD;
  const updateCurrentVal = warperMode === 'homotopy' ? onChangeTau : onChangeTauSVD;

  // Auto-playback loop at 60fps
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      updateCurrentVal((prev: number) => {
        let next = prev + dt * 0.75 * playbackSpeed;
        if (next > 3.0) {
          if (isLooping) {
            next = 0.0;
          } else {
            setIsPlaying(false);
            return 3.0;
          }
        }
        return next;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isLooping, playbackSpeed, updateCurrentVal]);

  // Click & Drag on track
  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateCurrentVal(pct * 3.0);
  };

  const handleTrackPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    updateCurrentVal(pct * 3.0);
  };

  const handleTrackPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Click keyframe to smoothly jump
  const handleJumpKeyframe = (target: number) => {
    updateCurrentVal(target);
  };

  // Keyboard shortcut listener: Space to toggle play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const progressPercent = (currentVal / 3.0) * 100;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[640px] max-w-[94vw] glass-hud rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.75)] border border-white/[0.08] select-none">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between text-xs font-mono">
        {/* Playback Controls Group */}
        <div className="flex items-center gap-1.5">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title="Toggle Play / Pause (Space)"
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-amber-glow'
                : 'bg-cyber-cyan text-black shadow-cyan-glow hover:bg-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Loop Toggle */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            title="Toggle Continuous Loop"
            className={`p-1.5 rounded-xl border transition-colors ${
              isLooping
                ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-black/40 border border-white/[0.06] rounded-xl p-0.5 text-[10px]">
            {([0.5, 1.0, 2.0] as const).map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded-lg transition-colors font-mono ${
                  playbackSpeed === speed
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Center Mode Switch: Homotopy vs SVD */}
        <div className="flex items-center bg-black/40 border border-white/[0.06] rounded-xl p-0.5 text-[10px]">
          <button
            onClick={() => onChangeWarperMode('homotopy')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-mono ${
              warperMode === 'homotopy'
                ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            Homotopy τ
          </button>
          <button
            onClick={() => onChangeWarperMode('svd')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-mono ${
              warperMode === 'svd'
                ? 'bg-cyber-amber/20 text-cyber-amber font-bold border border-cyber-amber/40'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            SVD τ_svd
          </button>
        </div>

        {/* Value Telemetry Readout */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
          <span className="text-slate-400">{warperMode === 'homotopy' ? 'τ' : 'τ_svd'} =</span>
          <span className="text-white font-bold tabular-nums px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
            {currentVal.toFixed(2)}
          </span>
          <span className="text-slate-500">/ 3.00</span>
        </div>
      </div>

      {/* Custom Segmented Timeline Track */}
      <div className="space-y-1">
        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          className="relative h-6 rounded-xl bg-black/60 border border-white/[0.08] cursor-pointer overflow-hidden flex items-center p-0.5"
        >
          {/* Zone 1: [0, 1] Cyan Tint */}
          <div className="absolute left-0 top-0 bottom-0 w-[33.33%] bg-gradient-to-r from-cyber-cyan/5 to-cyber-cyan/15 border-r border-white/[0.06]" />

          {/* Zone 2: [1, 2] Violet Tint */}
          <div className="absolute left-[33.33%] top-0 bottom-0 w-[33.33%] bg-gradient-to-r from-cyber-violet/5 to-cyber-violet/15 border-r border-white/[0.06]" />

          {/* Zone 3: [2, 3] Magenta Tint */}
          <div className="absolute left-[66.66%] top-0 bottom-0 w-[33.34%] bg-gradient-to-r from-cyber-magenta/5 to-cyber-magenta/15" />

          {/* Dynamic Fill Progress Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyber-cyan via-cyber-violet to-cyber-magenta opacity-35 pointer-events-none transition-[width] duration-75"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scrub Handle Cursor */}
          <div
            className="absolute top-0 bottom-0 w-2.5 -ml-1.25 bg-white rounded-full shadow-[0_0_12px_#FFFFFF] border border-black pointer-events-none transition-[left] duration-75 z-20"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* 4 Clickable Keyframe Node Markers with Labels */}
        <div className="relative flex justify-between text-[9px] font-mono px-1">
          {/* Keyframe 0.0 */}
          <button
            onClick={() => handleJumpKeyframe(0.0)}
            className={`flex flex-col items-start transition-colors ${
              Math.abs(currentVal - 0.0) < 0.2 ? 'text-cyber-cyan font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
              0.0 Identity (I)
            </span>
          </button>

          {/* Keyframe 1.0 */}
          <button
            onClick={() => handleJumpKeyframe(1.0)}
            className={`flex flex-col items-center transition-colors ${
              Math.abs(currentVal - 1.0) < 0.2 ? 'text-cyber-cyan font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
              1.0 Linear Warp (W₁x + b₁)
            </span>
          </button>

          {/* Keyframe 2.0 */}
          <button
            onClick={() => handleJumpKeyframe(2.0)}
            className={`flex flex-col items-center transition-colors ${
              Math.abs(currentVal - 2.0) < 0.2 ? 'text-cyber-violet font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-violet" />
              2.0 Fold σ(z₁)
            </span>
          </button>

          {/* Keyframe 3.0 */}
          <button
            onClick={() => handleJumpKeyframe(3.0)}
            className={`flex flex-col items-end transition-colors ${
              Math.abs(currentVal - 3.0) < 0.2 ? 'text-cyber-magenta font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-magenta" />
              3.0 Hyperplane Cut
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
