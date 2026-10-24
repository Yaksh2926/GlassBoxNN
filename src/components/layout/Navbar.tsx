import React from 'react';
import { Layers, Mountain, GitBranch, Sparkles, BookOpen, RotateCcw, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: 'warper' | 'loss' | 'graph';
  onSelectTab: (tab: 'warper' | 'loss' | 'graph') => void;
  onOpenGuide: () => void;
  onResetAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenGuide,
  onResetAll,
}) => {
  return (
    <header className="border-b border-[#1E2D4A] bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-glass">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-cyan via-cyber-violet to-cyber-magenta flex items-center justify-center p-0.5 shadow-cyan-glow">
          <div className="w-full h-full bg-[#090D16] rounded-[7px] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyber-cyan" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide font-mono">
              GlassBox<span className="text-cyber-cyan">.NN</span>
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/15 border border-cyber-cyan/50 text-cyber-cyan font-bold">
              MathX Ideathon
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans hidden sm:block">
            Demystifying Neural Networks through Pure Geometry, Linear Algebra & Multivariable Calculus
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center bg-[#0E1524] p-1 rounded-xl border border-[#1E2D4A] text-xs font-mono">
        <button
          onClick={() => onSelectTab('warper')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'warper'
              ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2D Manifold Warper</span>
        </button>

        <button
          onClick={() => onSelectTab('loss')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'loss'
              ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Mountain className="w-3.5 h-3.5" />
          <span>3D Loss Landscape</span>
        </button>

        <button
          onClick={() => onSelectTab('graph')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
            activeTab === 'graph'
              ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Chain Rule Graph</span>
        </button>
      </nav>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenGuide}
          className="px-2.5 py-1.5 rounded-lg bg-[#131B2E] hover:bg-[#1C2844] border border-[#2A374F] text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="hidden md:inline">Math Guide & Spec</span>
        </button>

        <button
          onClick={onResetAll}
          className="p-1.5 rounded-lg bg-[#131B2E] hover:bg-rose-950/40 border border-[#2A374F] hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors"
          title="Reset Everything to Defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
