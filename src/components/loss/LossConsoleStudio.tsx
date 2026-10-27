import React, { useState } from 'react';
import {
  Mountain,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Brain,
  Sliders,
  TrendingDown,
  Layers,
  Monitor,
  MousePointer,
  GraduationCap,
  BarChart3,
  Cpu,
  Trophy,
  Compass,
} from 'lucide-react';
import { Point2D, NetworkWeights } from '../../math/types';
import { LossLandscapeView } from './LossLandscapeView';

interface LossConsoleStudioProps {
  dataset: Point2D[];
  weights: NetworkWeights;
  onSelectParam: (p1: number, p2: number) => void;
  intuitionMode: boolean;
  onToggleIntuitionMode: () => void;
  onLaunchJudgeDemo: () => void;
  onSwitchToPlayground: () => void;
  onSwitchToStory: () => void;
  onResetModel: () => void;
}

export const LossConsoleStudio: React.FC<LossConsoleStudioProps> = ({
  dataset,
  weights,
  onSelectParam,
  intuitionMode,
  onToggleIntuitionMode,
  onLaunchJudgeDemo,
  onSwitchToPlayground,
  onSwitchToStory,
  onResetModel,
}) => {
  return (
    <div className="w-full min-h-screen pt-4 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* ================= 1. HEADER & 4 BADGES (MATCHING SLIDE 2 DESIGN) ================= */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#262636] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-[#FF5E7E] rounded-full inline-block" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#FF5E7E]">
              MathX Ideathon • Theme 5
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            3D Mistake <span className="text-[#FF5E7E]">Valley</span>
          </h1>
          <p className="text-sm md:text-base text-[#9E9EAF] mt-2 max-w-2xl">
            Explore multivariable loss topology in continuous 3D Euclidean space. Watch{' '}
            <strong className="text-white">Adam, Momentum, and SGD</strong> race downhill into the global minimum.
          </p>
        </div>

        {/* 4 Feature Badges on Top Right */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 font-sans">
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <Mountain className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Three.js 60fps</strong>
            <span className="text-[10px] text-[#9E9EAF]">Real-time 3D Mesh</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <strong className="text-xs text-white">3 Optimizers</strong>
            <span className="text-[10px] text-[#9E9EAF]">Adam vs Momentum vs SGD</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <Compass className="w-4 h-4 text-[#53D4F4]" />
            <strong className="text-xs text-white">Calculus 3D</strong>
            <span className="text-[10px] text-[#9E9EAF]">Gradients & Hessians</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <BarChart3 className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Loss Curves</strong>
            <span className="text-[10px] text-[#9E9EAF]">Epoch convergence</span>
          </div>
        </div>
      </section>

      {/* ================= 2. THE MAIN CONSOLE WINDOW (EXACT SLIDE 2 FRAME) ================= */}
      <div className="relative rounded-3xl border border-[#262636] bg-[#0E0E18] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Console Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#262636] bg-[#141422] flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF5E7E] to-[#FF4767] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,94,126,0.5)]">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-sm text-white tracking-tight flex items-center gap-1">
              GlassBox <span className="text-[#FF5E7E]">NN</span>
            </span>
          </div>

          {/* Nav Tabs Matching Presentation */}
          <div className="flex items-center p-1 rounded-xl bg-[#0A0A10] border border-[#262636] text-xs font-semibold">
            <button
              onClick={onSwitchToPlayground}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              Playground
            </button>

            <button
              className="px-3.5 py-1.5 rounded-lg bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold transition-all"
            >
              3D Loss Valley
            </button>

            <button
              onClick={onSwitchToStory}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              The Story
            </button>

            <button
              onClick={onLaunchJudgeDemo}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              Demo
            </button>
          </div>

          {/* Right Mode Toggle & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleIntuitionMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                intuitionMode
                  ? 'border-[#FF5E7E]/60 bg-[#FF5E7E]/10 text-[#FF5E7E]'
                  : 'border-[#8B5CF6]/60 bg-[#8B5CF6]/10 text-[#C4B5FD]'
              }`}
            >
              <span>{intuitionMode ? '💡 Intuition' : '∑ Full Math'}</span>
            </button>

            <button
              onClick={onResetModel}
              className="p-1.5 rounded-xl border border-[#262636] bg-[#141422] text-[#9E9EAF] hover:text-white hover:border-[#FF5E7E]/50 transition-all"
              title="Reset Parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Embedded 3D Loss Valley Content Inside the Slide Console */}
        <div className="p-4 md:p-6 bg-[#0E0E18]">
          <LossLandscapeView
            dataset={dataset}
            weights={weights}
            onSelectParam={onSelectParam}
            className="w-full bg-[#141422] border border-[#262636] rounded-2xl shadow-none"
          />
        </div>

        {/* ================= 3. BOTTOM BANNER (MATCHING SLIDE 2) ================= */}
        <div className="px-6 py-3.5 border-t border-[#262636] bg-[#141422] flex items-center justify-center gap-3 text-center">
          <div className="w-6 h-6 rounded-full bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs md:text-sm text-white font-medium">
            A <strong className="text-[#FF5E7E]">zero-installation</strong> interactive observatory
            for multivariable loss topology and gradient optimization.
          </p>
        </div>
      </div>
    </div>
  );
};
