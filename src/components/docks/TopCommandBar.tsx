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
  Brain,
  Sliders,
  PanelRightClose,
  PanelRightOpen,
  Home,
} from 'lucide-react';
import { DatasetPreset } from '../../math/datasets';

export type ViewMode = 'geometry' | 'loss' | 'graph';
export type LabMode = 'guided' | 'advanced';

interface TopCommandBarProps {
  labMode: LabMode;
  onSelectLabMode: (mode: LabMode) => void;
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
  labMode,
  onSelectLabMode,
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
          title={isLeftPanelOpen ? 'Collapse Controls Panel' : 'Expand Controls Panel'}
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

      {/* Center Group: Progressive Disclosure Mode Switcher */}
      <div className="pointer-events-auto h-10 px-1.5 rounded-xl border border-[#29374B] bg-[#111A2A]/90 backdrop-blur-md flex items-center gap-1.5 shadow-md">
        {/* Guided Studio vs Advanced Lab Primary Toggle */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0B1020]/60 border border-[#29374B]">
          <button
            onClick={() => onSelectLabMode('guided')}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              labMode === 'guided'
                ? 'bg-[#53D4F4] text-[#0B1020] shadow-sm'
                : 'text-[#9DAFC3] hover:text-[#F4F7FB]'
            }`}
            title="Switch to Guided 3-Step Studio"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Guided Studio</span>
          </button>

          <button
            onClick={() => onSelectLabMode('advanced')}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              labMode === 'advanced'
                ? 'bg-[#8B5CF6] text-[#F4F7FB] shadow-sm'
                : 'text-[#9DAFC3] hover:text-[#F4F7FB]'
            }`}
            title="Switch to Advanced Mathematical Lab (Matrices, SVD, 3D Loss Surface, Gradient Flow)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Advanced Lab</span>
          </button>
        </div>

        {/* If in Advanced Lab, also expose the 3 View Modes */}
        {labMode === 'advanced' && (
          <>
            <div className="h-5 w-[1px] bg-[#29374B] mx-0.5" />
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectViewMode('geometry')}
                className={`h-7 px-2 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                  viewMode === 'geometry'
                    ? 'bg-[#182438] text-[#53D4F4] border border-[#53D4F4]/50 font-semibold'
                    : 'text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
                title="2D Manifold Grid & Decision Boundary"
              >
                <Layers className="w-3 h-3" />
                <span className="hidden sm:inline">Geometry</span>
              </button>

              <button
                onClick={() => onSelectViewMode('loss')}
                className={`h-7 px-2 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                  viewMode === 'loss'
                    ? 'bg-[#182438] text-[#F078C5] border border-[#F078C5]/50 font-semibold'
                    : 'text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
                title="3D Loss Surface & Hessian Curvature"
              >
                <Box className="w-3 h-3" />
                <span className="hidden sm:inline">Loss 3D</span>
              </button>

              <button
                onClick={() => onSelectViewMode('graph')}
                className={`h-7 px-2 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                  viewMode === 'graph'
                    ? 'bg-[#182438] text-[#8B5CF6] border border-[#8B5CF6]/50 font-semibold'
                    : 'text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
                title="Silicon Autodiff Computational Graph"
              >
                <GitBranch className="w-3 h-3" />
                <span className="hidden sm:inline">Flow</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right Group: Demo Mode, Persona, Guide, Reset, Right Panel Toggle */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Prominent Demo Mode Action */}
        <button
          onClick={onOpenDemo}
          className="h-9 px-3 rounded-lg bg-[#53D4F4] text-[#0B1020] hover:bg-[#68ddfc] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          title="Launch Guided 2-Minute College Ideathon Pitch Demo"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Judge Demo</span>
        </button>

        {/* Prominent Glowing Pill: Intuition Mode vs Full Math View Toggle */}
        <button
          onClick={onTogglePersonaMode}
          className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            personaMode === 'beginner'
              ? 'border-[#53D4F4]/70 bg-[#182438] text-[#53D4F4] shadow-[0_0_15px_rgba(83,212,244,0.25)] ring-1 ring-[#53D4F4]/30'
              : 'border-[#8B5CF6]/70 bg-[#182438] text-[#C4B5FD] shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-[#8B5CF6]/30'
          }`}
          title="Toggle between 💡 Beginner Intuition Mode (Physical Metaphors) and ∑ Full Math View (Formal Rigor)"
        >
          {personaMode === 'beginner' ? (
            <>
              <span className="text-sm">💡</span>
              <span className="font-bold tracking-tight">Beginner Intuition</span>
            </>
          ) : (
            <>
              <span className="font-mono text-sm font-bold text-[#A78BFA]">∑</span>
              <span className="font-bold tracking-tight">Full Math View</span>
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
