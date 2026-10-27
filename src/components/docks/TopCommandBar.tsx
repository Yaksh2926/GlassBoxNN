import React from 'react';
import {
  Brain,
  RotateCcw,
  BookOpen,
  Sparkles,
  Play,
  Mountain,
  LayoutGrid,
  BookMarked,
  Home,
} from 'lucide-react';

export type NavTab = 'cover' | 'playground' | 'loss' | 'story';

interface TopCommandBarProps {
  navTab: NavTab;
  onSelectNavTab: (tab: NavTab) => void;
  personaMode: 'beginner' | 'judge';
  onTogglePersonaMode: () => void;
  onOpenDemo: () => void;
  onOpenGuide?: () => void;
  onResetAll: () => void;
  // Backward compatibility
  viewMode?: 'geometry' | 'loss';
  onSelectViewMode?: (mode: 'geometry' | 'loss') => void;
  isLeftPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  navTab,
  onSelectNavTab,
  personaMode,
  onTogglePersonaMode,
  onOpenDemo,
  onOpenGuide,
  onResetAll,
}) => {
  return (
    <header className="sticky top-0 inset-x-0 z-40 px-4 py-2.5 bg-[#0C0C14]/95 backdrop-blur-xl border-b border-[#262636] flex items-center justify-between select-none">
      {/* Left: Brand Logo & Ideathon Tag (Click to Go Home / Cover) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectNavTab('cover')}
          className="flex items-center gap-2.5 group cursor-pointer"
          title="Return to Cover Page"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF5E7E] to-[#FF4767] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,94,126,0.5)] group-hover:scale-105 transition-transform">
            <Brain className="w-4 h-4" />
          </div>
          <span className="font-black text-sm md:text-base text-white tracking-tight flex items-center gap-1">
            GlassBox <span className="text-[#FF5E7E]">NN</span>
          </span>
        </button>

        <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181824] text-[#9E9EAF] border border-[#262636]">
          MathX Ideathon • Theme 5
        </span>
      </div>

      {/* Center: Main Navigation Tabs (Matching Presentation Slides) */}
      <div className="flex items-center p-1 rounded-xl bg-[#141422] border border-[#262636] text-xs font-semibold">
        <button
          onClick={() => onSelectNavTab('cover')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            navTab === 'cover'
              ? 'bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold'
              : 'text-[#9E9EAF] hover:text-white'
          }`}
          title="Cover Page: Front View of the Website"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Cover</span>
        </button>

        <button
          onClick={() => onSelectNavTab('playground')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
            navTab === 'playground'
              ? 'bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold'
              : 'text-[#9E9EAF] hover:text-white'
          }`}
          title="Slide 2: Interactive 3-Column Studio Console"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Playground</span>
        </button>

        <button
          onClick={() => onSelectNavTab('loss')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
            navTab === 'loss'
              ? 'bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold'
              : 'text-[#9E9EAF] hover:text-white'
          }`}
          title="3D Loss Valley: Real-time Mistake Landscape (Three.js)"
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>3D Loss Valley</span>
        </button>

        <button
          onClick={() => onSelectNavTab('story')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
            navTab === 'story'
              ? 'bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold'
              : 'text-[#9E9EAF] hover:text-white'
          }`}
          title="Slide 1 & 3: The Black Box Problem & Why GlassBox NN Matters"
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>The Story</span>
        </button>
      </div>

      {/* Right: Intuition Toggle & Presentation Actions */}
      <div className="flex items-center gap-2">
        {/* Intuition vs Full Math Glowing Pill Toggle */}
        <button
          onClick={onTogglePersonaMode}
          className={`h-8 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
            personaMode === 'beginner'
              ? 'border-[#FF5E7E]/70 bg-[#161626] text-[#FF5E7E] shadow-[0_0_12px_rgba(255,94,126,0.25)] ring-1 ring-[#FF5E7E]/40'
              : 'border-[#8B5CF6]/70 bg-[#161626] text-[#C4B5FD] shadow-[0_0_12px_rgba(139,92,246,0.25)] ring-1 ring-[#8B5CF6]/40'
          }`}
          title="Toggle between 💡 Beginner Intuition Mode and ∑ Full Math View"
        >
          {personaMode === 'beginner' ? (
            <>
              <span className="text-sm">💡</span>
              <span className="font-bold tracking-tight">Intuition</span>
            </>
          ) : (
            <>
              <span className="font-mono text-sm font-bold text-[#A78BFA]">∑</span>
              <span className="font-bold tracking-tight">Full Math</span>
            </>
          )}
        </button>

        {/* Judge Demo Presentation Launcher */}
        <button
          onClick={onOpenDemo}
          className="h-8 px-3.5 rounded-xl btn-coral font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,94,126,0.35)]"
          title="Launch Guided 6-Step Presentation Demo"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Judge Demo</span>
        </button>

        {/* Mathematical Handbook Guide */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="h-8 w-8 rounded-xl border border-[#262636] bg-[#141422] hover:bg-[#1E1E2E] hover:border-[#FF5E7E]/40 flex items-center justify-center text-[#9E9EAF] hover:text-white transition-all"
            title="Open Mathematical Guide"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Reset All */}
        <button
          onClick={onResetAll}
          className="h-8 w-8 rounded-xl border border-[#262636] bg-[#141422] hover:bg-[#1E1E2E] hover:border-rose-500/50 flex items-center justify-center text-[#9E9EAF] hover:text-[#EF4444] transition-all"
          title="Reset Everything to Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
