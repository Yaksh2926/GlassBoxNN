import React from 'react';
import {
  Brain,
  RotateCcw,
  BookOpen,
  Sparkles,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export type ViewMode = 'geometry' | 'loss' | 'graph';
export type LabMode = 'guided' | 'advanced';

interface TopCommandBarProps {
  personaMode: 'beginner' | 'judge';
  onTogglePersonaMode: () => void;
  onOpenDemo: () => void;
  onOpenGuide?: () => void;
  onResetAll: () => void;
  isLeftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  // Optional legacy props for compatibility
  labMode?: LabMode;
  onSelectLabMode?: (mode: LabMode) => void;
  viewMode?: ViewMode;
  onSelectViewMode?: (mode: ViewMode) => void;
  currentPreset?: string;
  onSelectPreset?: (preset: any) => void;
  onGoHome?: () => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  personaMode,
  onTogglePersonaMode,
  onOpenDemo,
  onOpenGuide,
  onResetAll,
  isLeftPanelOpen,
  onToggleLeftPanel,
}) => {
  return (
    <header className="fixed top-3 inset-x-3 z-40 flex items-center justify-between select-none pointer-events-none">
      {/* Left: Controls Toggle & App Brand */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleLeftPanel}
          className={`h-9 px-3 rounded-xl border text-xs flex items-center gap-1.5 transition-all shadow-md ${
            isLeftPanelOpen
              ? 'border-[#29374B] bg-[#111A2A]/90 text-[#F4F7FB] hover:border-[#53D4F4]/50'
              : 'border-[#53D4F4] bg-[#53D4F4]/15 text-[#53D4F4] shadow-cyan-500/20'
          }`}
          title={isLeftPanelOpen ? 'Collapse Controls Panel' : 'Expand Controls Panel'}
        >
          {isLeftPanelOpen ? (
            <PanelLeftClose className="w-4 h-4 text-[#9DAFC3]" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-[#53D4F4]" />
          )}
          <span className="font-mono text-xs font-semibold">Controls</span>
        </button>

        <div className="h-9 px-3.5 rounded-xl border border-[#29374B] bg-[#111A2A]/90 backdrop-blur-md flex items-center gap-2 shadow-md">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#53D4F4] to-[#8B5CF6] flex items-center justify-center text-[#0B1020]">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs text-[#F4F7FB] tracking-tight">
            GlassBox <span className="text-[#53D4F4] font-normal">NN</span>
          </span>
          <span className="hidden sm:inline text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#182438] text-[#9DAFC3] border border-[#29374B]">
            Theme 5: MathX
          </span>
        </div>
      </div>

      {/* Center: Glowing Pill Toggle (Beginner Intuition vs Full Math View) */}
      <div className="pointer-events-auto">
        <button
          onClick={onTogglePersonaMode}
          className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
            personaMode === 'beginner'
              ? 'border-[#53D4F4]/70 bg-[#111A2A]/95 text-[#53D4F4] shadow-[0_0_20px_rgba(83,212,244,0.3)] ring-1 ring-[#53D4F4]/40'
              : 'border-[#8B5CF6]/70 bg-[#111A2A]/95 text-[#C4B5FD] shadow-[0_0_20px_rgba(139,92,246,0.3)] ring-1 ring-[#8B5CF6]/40'
          }`}
          title="Toggle between 💡 Beginner Intuition Mode (Physical Metaphors) and ∑ Full Math View (Formal Rigor)"
        >
          {personaMode === 'beginner' ? (
            <>
              <span className="text-sm">💡</span>
              <span className="font-bold tracking-tight">Beginner Intuition</span>
              <span className="text-[10px] text-[#9DAFC3] font-normal hidden md:inline">
                (Click for Math Mode)
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-sm font-bold text-[#A78BFA]">∑</span>
              <span className="font-bold tracking-tight">Full Math View</span>
              <span className="text-[10px] text-[#9DAFC3] font-normal hidden md:inline">
                (Click for Intuition Mode)
              </span>
            </>
          )}
        </button>
      </div>

      {/* Right: Judge Presentation Demo & Actions */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenDemo}
          className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#53D4F4] to-[#38BDF8] text-[#0B1020] hover:brightness-110 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          title="Launch Guided 6-Step Judge Presentation Demo"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Judge Demo</span>
        </button>

        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="h-9 w-9 rounded-xl border border-[#29374B] bg-[#111A2A]/90 hover:bg-[#182438] hover:border-[#53D4F4]/40 flex items-center justify-center text-[#9DAFC3] hover:text-[#F4F7FB] transition-all shadow-md"
            title="Open Mathematical Handbook"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onResetAll}
          className="h-9 w-9 rounded-xl border border-[#29374B] bg-[#111A2A]/90 hover:bg-[#182438] hover:border-rose-500/50 flex items-center justify-center text-[#9DAFC3] hover:text-[#EF4444] transition-all shadow-md"
          title="Reset Everything to Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
