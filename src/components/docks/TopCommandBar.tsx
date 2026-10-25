import React from 'react';
import {
  Compass,
  Layers,
  Box,
  GitBranch,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Sparkles,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Home,
} from 'lucide-react';
import { DatasetPreset } from '../../math/datasets';

export type ViewMode = 'geometry' | 'loss' | 'graph';

interface TopCommandBarProps {
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  personaMode: 'beginner' | 'judge';
  onTogglePersonaMode: () => void;
  onOpenDemo: () => void;
  onOpenGuide: () => void;
  onResetAll: () => void;
  onGoHome: () => void;
  isLeftPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  isRightPanelOpen: boolean;
  onToggleRightPanel: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  viewMode,
  onSelectViewMode,
  currentPreset,
  onSelectPreset,
  personaMode,
  onTogglePersonaMode,
  onOpenDemo,
  onOpenGuide,
  onResetAll,
  onGoHome,
  isLeftPanelOpen,
  onToggleLeftPanel,
  isRightPanelOpen,
  onToggleRightPanel,
}) => {
  return (
    <header className="fixed top-3 inset-x-3 z-40 flex items-center justify-between select-none pointer-events-none">
      {/* Left Group: Home / Logo & Left Panel Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onToggleLeftPanel}
          className={`h-9 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all glass-pill ${
            isLeftPanelOpen
              ? 'border-[#29374B] text-[#9DAFC3] hover:text-[#F4F7FB]'
              : 'border-[#53D4F4]/50 text-[#53D4F4] bg-[#182438]'
          }`}
          title={isLeftPanelOpen ? 'Collapse Left Control Panel' : 'Expand Left Control Panel'}
        >
          {isLeftPanelOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
          <span className="hidden md:inline font-mono text-[11px]">Controls</span>
        </button>

        <button
          onClick={onGoHome}
          className="h-9 px-3 rounded-lg border border-[#29374B] glass-pill flex items-center gap-2 hover:border-[#53D4F4]/50 transition-colors"
          title="Return to Overview / Landing Page"
        >
          <div className="w-5 h-5 rounded bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-xs text-[#F4F7FB] tracking-tight">
            GlassBox <span className="text-[#53D4F4] font-normal">NN</span>
          </span>
        </button>
      </div>

      {/* Center Group: Primary 3-Mode Switcher */}
      <div className="pointer-events-auto h-10 px-1.5 rounded-xl border border-[#29374B] bg-[#111A2A]/90 backdrop-blur-md flex items-center gap-1 shadow-md">
        <button
          onClick={() => onSelectViewMode('geometry')}
          className={`h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            viewMode === 'geometry'
              ? 'bg-[#53D4F4] text-[#0B1020] font-semibold shadow-sm'
              : 'text-[#9DAFC3] hover:text-[#F4F7FB] hover:bg-[#182438]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Geometry</span>
        </button>

        <button
          onClick={() => onSelectViewMode('loss')}
          className={`h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            viewMode === 'loss'
              ? 'bg-[#F078C5] text-[#0B1020] font-semibold shadow-sm'
              : 'text-[#9DAFC3] hover:text-[#F4F7FB] hover:bg-[#182438]'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Loss Landscape</span>
        </button>

        <button
          onClick={() => onSelectViewMode('graph')}
          className={`h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            viewMode === 'graph'
              ? 'bg-[#8B5CF6] text-[#F4F7FB] font-semibold shadow-sm'
              : 'text-[#9DAFC3] hover:text-[#F4F7FB] hover:bg-[#182438]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Gradient Flow</span>
        </button>
      </div>

      {/* Right Group: Demo Mode, Persona, Guide, Reset, Right Panel Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Prominent Demo Mode Action */}
        <button
          onClick={onOpenDemo}
          className="h-9 px-3 rounded-lg bg-[#53D4F4] text-[#0B1020] hover:bg-[#68ddfc] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          title="Launch Guided 6-Step Pitch Demo"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Demo Mode</span>
        </button>

        {/* Explore Mode vs Judge Mode Toggle */}
        <button
          onClick={onTogglePersonaMode}
          className="h-9 px-2.5 rounded-lg border border-[#29374B] bg-[#111A2A] hover:bg-[#182438] text-xs font-mono flex items-center gap-1.5 text-[#9DAFC3] transition-colors"
          title="Toggle between Explore Mode (Everyday Intuition) and Judge Mode (Formal Mathematics)"
        >
          {personaMode === 'judge' ? (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-[#53D4F4]" />
              <span className="text-[#53D4F4] font-medium hidden sm:inline">Judge Mode</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#F7C76B]" />
              <span className="text-[#F4F7FB] font-medium hidden sm:inline">Explore Mode</span>
            </>
          )}
        </button>

        {/* Handbook Modal */}
        <button
          onClick={onOpenGuide}
          className="h-9 w-9 rounded-lg border border-[#29374B] bg-[#111A2A] hover:bg-[#182438] flex items-center justify-center text-[#9DAFC3] hover:text-[#F4F7FB] transition-colors"
          title="Open Mathematical Handbook"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>

        {/* Reset Action */}
        <button
          onClick={onResetAll}
          className="h-9 w-9 rounded-lg border border-[#29374B] bg-[#111A2A] hover:bg-[#182438] flex items-center justify-center text-[#9DAFC3] hover:text-[#EF4444] transition-colors"
          title="Reset Network & Dataset to Defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Right Inspector Toggle */}
        <button
          onClick={onToggleRightPanel}
          className={`h-9 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all glass-pill ${
            isRightPanelOpen
              ? 'border-[#29374B] text-[#9DAFC3] hover:text-[#F4F7FB]'
              : 'border-[#53D4F4]/50 text-[#53D4F4] bg-[#182438]'
          }`}
          title={isRightPanelOpen ? 'Collapse Inspector' : 'Expand Inspector'}
        >
          <span className="hidden md:inline font-mono text-[11px]">Inspector</span>
          {isRightPanelOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
