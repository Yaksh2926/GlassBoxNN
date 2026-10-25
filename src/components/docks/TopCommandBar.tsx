import React from 'react';
import { StoryStep, STORY_STEPS } from '../story/StoryModeBar';
import {
  Sparkles,
  Layers,
  Box,
  GitBranch,
  HelpCircle,
  RotateCcw,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';

export type ViewMode = 'split' | 'manifold' | 'loss' | 'graph';

interface TopCommandBarProps {
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  currentStoryStepId: number;
  onSelectStoryStep: (step: StoryStep) => void;
  personaMode: 'beginner' | 'judge';
  onTogglePersonaMode: () => void;
  onOpenGuide: () => void;
  onResetAll: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  viewMode,
  onSelectViewMode,
  currentStoryStepId,
  onSelectStoryStep,
  personaMode,
  onTogglePersonaMode,
  onOpenGuide,
  onResetAll,
}) => {
  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] flex items-center gap-2 select-none">
      {/* Centered Main Pill Bar */}
      <div className="h-12 px-3.5 glass-hud rounded-full flex items-center gap-3 border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        {/* Brand Mark */}
        <div className="flex items-center gap-2 pl-1 pr-2 border-r border-white/[0.08]">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-magenta flex items-center justify-center font-bold text-black font-mono text-xs shadow-cyan-glow">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold tracking-widest text-xs text-white leading-none">
              GLASSBOX<span className="text-cyber-cyan font-normal">//NN</span>
            </span>
            <span className="text-[7.5px] font-mono text-slate-400 tracking-wider">
              MATHX WORKSTATION
            </span>
          </div>
        </div>

        {/* View Mode Switcher with sliding pill */}
        <div className="flex items-center bg-black/50 p-1 rounded-full border border-white/[0.06] text-xs font-mono">
          <button
            onClick={() => onSelectViewMode('split')}
            className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === 'split'
                ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Studio</span>
          </button>

          <button
            onClick={() => onSelectViewMode('manifold')}
            className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === 'manifold'
                ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2D Manifold</span>
          </button>

          <button
            onClick={() => onSelectViewMode('loss')}
            className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === 'loss'
                ? 'bg-cyber-magenta text-white font-bold shadow-magenta-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Loss Arena</span>
          </button>

          <button
            onClick={() => onSelectViewMode('graph')}
            className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
              viewMode === 'graph'
                ? 'bg-cyber-violet text-white font-bold shadow-violet-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backprop Graph</span>
          </button>
        </div>

        {/* 5-Step Guided Pitch Tour Steppers */}
        <div className="hidden xl:flex items-center gap-1 px-2 border-l border-r border-white/[0.08]">
          <span className="text-[9px] font-mono text-slate-400 uppercase mr-1">Pitch Tour:</span>
          {STORY_STEPS.map(step => {
            const isActive = currentStoryStepId === step.id;
            return (
              <button
                key={step.id}
                onClick={() => onSelectStoryStep(step)}
                title={`${step.id < 10 ? '0' + step.id : step.id} ${step.title}: ${step.subtitle}`}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1 border ${
                  isActive
                    ? 'bg-white/15 text-white border-cyber-cyan/80 font-bold shadow-sm'
                    : 'bg-black/30 text-slate-400 border-white/[0.05] hover:border-white/20 hover:text-slate-200'
                }`}
              >
                <span>{step.id < 10 ? `0${step.id}` : step.id}</span>
                <span className="hidden 2xl:inline">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Intuition vs Formal Math Rigor Mode Toggle Switch */}
        <button
          onClick={onTogglePersonaMode}
          title="Toggle Intuitive vs Rigorous Mathematical Perspective"
          className="px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 border border-white/[0.08] flex items-center gap-1.5 text-[11px] font-mono text-slate-300 transition-colors"
        >
          {personaMode === 'judge' ? (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-cyber-violet" />
              <span className="font-bold text-cyber-violet">Math Rigor</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
              <span className="font-medium text-slate-200">Intuition</span>
            </>
          )}
        </button>

        {/* Guide Modal Trigger */}
        <button
          onClick={onOpenGuide}
          title="Open Theoretical Mathematical Guide & Handbook"
          className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>

        {/* Reset All */}
        <button
          onClick={onResetAll}
          title="Reset Everything to Defaults"
          className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-rose-400 border border-white/[0.08] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
