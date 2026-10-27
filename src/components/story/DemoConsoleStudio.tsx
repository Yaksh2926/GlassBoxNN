import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Brain,
  Target,
  Zap,
  TrendingDown,
  Mountain,
  Compass,
  AlertTriangle,
  GraduationCap,
  Monitor,
  MousePointer,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { DatasetPreset } from '../../math/datasets';
import { NetworkWeights, Point2D } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';

interface DemoConsoleStudioProps {
  dataset: Point2D[];
  weights: NetworkWeights;
  loss: number;
  accuracy: number;
  epoch: number;
  isTraining: boolean;
  onToggleTraining: () => void;
  onResetTraining: () => void;
  onSelectPreset: (preset: DatasetPreset) => void;
  onSetInitialUnlearnedWeights: () => void;
  onSwitchToPlayground: () => void;
  onSwitchTo3DLoss: () => void;
  onSwitchToStory: () => void;
  intuitionMode: boolean;
  onToggleIntuitionMode: () => void;
}

export const DemoConsoleStudio: React.FC<DemoConsoleStudioProps> = ({
  dataset,
  weights,
  loss,
  accuracy,
  epoch,
  isTraining,
  onToggleTraining,
  onResetTraining,
  onSelectPreset,
  onSetInitialUnlearnedWeights,
  onSwitchToPlayground,
  onSwitchTo3DLoss,
  onSwitchToStory,
  intuitionMode,
  onToggleIntuitionMode,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initialMetrics, setInitialMetrics] = useState<{ loss: number; accuracy: number }>({
    loss: 0.7449,
    accuracy: 0.083,
  });

  // Prepare benchmark dataset and initial weights on step 1
  useEffect(() => {
    if (currentStep === 1) {
      onSelectPreset('linear');
      onSetInitialUnlearnedWeights();
    }
  }, [currentStep]);

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep === 2) {
      onSelectPreset('linear');
      onSetInitialUnlearnedWeights();
      setInitialMetrics({
        loss: loss > 0 ? loss : 0.7449,
        accuracy: accuracy > 0 ? accuracy : 0.083,
      });
    }
  };

  // Compute live SVD and condition number
  const svd = LinearAlgebra.svd(weights.W1);
  const sigma1 = svd.singularValues[0];
  const sigma2 = svd.singularValues[1];
  const det = LinearAlgebra.det(weights.W1);
  const conditionNumber = sigma2 > 1e-4 ? sigma1 / sigma2 : 999;

  const stepTitles = [
    'The Problem',
    'Training',
    'SVD Geometry',
    'Origami Fold',
    'Loss 3D',
    'Stress Tests',
  ];

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
            Interactive <span className="text-[#FF5E7E]">Demo</span>
          </h1>
          <p className="text-sm md:text-base text-[#9E9EAF] mt-2 max-w-2xl">
            A 6-step guided walkthrough demonstrating how neural networks transform coordinates,
            fold space, and optimize multivariable loss.
          </p>
        </div>

        {/* 4 Feature Badges on Top Right */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 font-sans">
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <GraduationCap className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">6-Step Path</strong>
            <span className="text-[10px] text-[#9E9EAF]">Zero to Convergence</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <Compass className="w-4 h-4 text-[#53D4F4]" />
            <strong className="text-xs text-white">Real SVD</strong>
            <span className="text-[10px] text-[#9E9EAF]">Singular Values σ₁, σ₂</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <Mountain className="w-4 h-4 text-amber-400" />
            <strong className="text-xs text-white">Mistake Valley</strong>
            <span className="text-[10px] text-[#9E9EAF]">3D Gradient Descent</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <AlertTriangle className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Stress-Tests</strong>
            <span className="text-[10px] text-[#9E9EAF]">det=0 & Dead ReLU</span>
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
              onClick={onSwitchTo3DLoss}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              3D Loss Valley
            </button>

            <button
              onClick={onSwitchToStory}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              The Story
            </button>

            <button className="px-3.5 py-1.5 rounded-lg bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold transition-all">
              Demo
            </button>
          </div>

          {/* Right Mode Toggle */}
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
          </div>
        </div>

        {/* 6-Step Visual Stepper Bar */}
        <div className="px-5 py-3 border-b border-[#262636] bg-[#11111C] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-mono">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                onClick={() => handleStepChange(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentStep === num
                    ? 'bg-[#FF5E7E] text-white shadow-[0_0_10px_rgba(255,94,126,0.4)]'
                    : num < currentStep
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#161622] text-[#9E9EAF] border border-[#262636] hover:text-white'
                }`}
              >
                <span>{num}.</span>
                <span className="hidden sm:inline">{stepTitles[num - 1]}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-[#9E9EAF] whitespace-nowrap">
            Step <strong className="text-white">{currentStep}</strong> of 6
          </span>
        </div>

        {/* Step Content Body (Split-Card Design) */}
        <div className="p-6 md:p-8 space-y-6">
          {/* ================= STEP 1: THE PROBLEM ================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262636] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
                    Step 1 • The Problem
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    The Classification Problem (Linear Hyperplane Separation)
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161622] border border-[#262636] text-[#9E9EAF]">
                  Benchmark Linear Dataset
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Intuition */}
                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <div className="flex items-center gap-2 text-[#FF5E7E] font-mono text-xs font-bold uppercase">
                    <span>💡</span>
                    <span>10-Second Intuition Metaphor</span>
                  </div>
                  <h4 className="text-base font-bold text-white">Two Teams on a Field</h4>
                  <p className="text-xs md:text-sm text-[#9E9EAF] leading-relaxed">
                    Imagine silver circles and coral diamonds are two opposing teams scattered
                    across a field. The AI's job is to place one straight{' '}
                    <strong className="text-white">Dividing Fence</strong> between them without touching
                    either team!
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#0A0A10] border border-[#262636] flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#8E8E9E]" />
                      <div className="text-xs">
                        <span className="text-white font-bold block">Class 0</span>
                        <span className="text-[10px] text-[#9E9EAF]">Silver Dots</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0A0A10] border border-[#262636] flex items-center gap-2">
                      <span className="w-3 h-3 rotate-45 bg-[#FF5E7E]" />
                      <div className="text-xs">
                        <span className="text-white font-bold block">Class 1</span>
                        <span className="text-[10px] text-[#9E9EAF]">Coral Diamonds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Math */}
                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#53D4F4] font-bold uppercase">
                    <span>📐</span>
                    <span>Mathematical Grounding</span>
                  </div>
                  <h4 className="text-base font-bold text-white font-sans">
                    Hyperplane Separation Theorem
                  </h4>
                  <div className="p-3 rounded-xl bg-[#0A0A10] border border-[#262636] text-[#FF5E7E] text-xs">
                    H = {'{'} x ∈ ℝ² : w₁x₁ + w₂x₂ + b = 0 {'}'}
                  </div>
                  <p className="text-xs text-[#9E9EAF] leading-relaxed font-sans">
                    Because the convex hulls of Class 0 and Class 1 are disjoint:
                    <br />
                    <code className="text-emerald-400">Conv(C₀) ∩ Conv(C₁) = ∅</code>
                    <br />
                    A linear boundary exists with 100% geometric margin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: TRAINING CONVERGENCE ================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262636] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
                    Step 2 • Training
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    Live Training & Loss Minimization
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161622] border border-[#262636] text-[#9E9EAF]">
                  Epoch: {epoch}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <h4 className="text-base font-bold text-white">Watch The Fence Rotate</h4>
                  <p className="text-xs md:text-sm text-[#9E9EAF] leading-relaxed">
                    Click the coral <strong className="text-[#FF5E7E]">Train AI ▶</strong> button below.
                    Watch how the dividing line rotates and slides into position as backpropagation
                    computes analytical gradients.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={onToggleTraining}
                      className="w-full py-3.5 rounded-xl btn-coral flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
                    >
                      {isTraining ? (
                        <>
                          <Pause className="w-4 h-4 fill-current animate-pulse" />
                          <span>Pause Training</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Train AI ▶</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-3 font-mono text-xs">
                  <span className="text-[#9E9EAF] uppercase font-bold text-[10px]">
                    Real-Time Metrics:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#0A0A10] border border-[#262636]">
                      <span className="text-[#9E9EAF] text-[10px] block">Accuracy:</span>
                      <span
                        className={`text-2xl font-black ${
                          accuracy >= 0.95 ? 'text-emerald-400' : 'text-[#FF5E7E]'
                        }`}
                      >
                        {(accuracy * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0A10] border border-[#262636]">
                      <span className="text-[#9E9EAF] text-[10px] block">BCE Loss:</span>
                      <span className="text-2xl font-black text-white">{loss.toFixed(3)}</span>
                    </div>
                  </div>

                  {accuracy >= 0.95 && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>100% Convergence Achieved! Classes completely separated.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SVD GEOMETRY ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262636] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
                    Step 3 • Geometry & SVD
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    Linear Algebra of Layers: W₁ = U Σ Vᵀ
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161622] border border-[#262636] text-[#53D4F4]">
                  SVD Active
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <h4 className="text-base font-bold text-white">Three Physical Actions</h4>
                  <p className="text-xs md:text-sm text-[#9E9EAF] leading-relaxed">
                    Every neural weight matrix $W_1$ performs exactly three geometric operations in sequence:
                  </p>
                  <ul className="space-y-2 text-xs text-[#9E9EAF]">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#53D4F4]/20 text-[#53D4F4] flex items-center justify-center font-bold">1</span>
                      <span><strong>Rotate</strong> space by orthonormal matrix Vᵀ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FF5E7E]/20 text-[#FF5E7E] flex items-center justify-center font-bold">2</span>
                      <span><strong>Stretch</strong> axes by singular values σ₁ and σ₂</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</span>
                      <span><strong>Rotate</strong> to final orientation by matrix U</span>
                    </li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-3 font-mono text-xs">
                  <span className="text-[#9E9EAF] uppercase font-bold text-[10px]">
                    Live SVD Decomposition:
                  </span>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-[#262636] flex justify-between">
                      <span className="text-[#9E9EAF]">Singular Value σ₁:</span>
                      <span className="text-white font-bold">{sigma1.toFixed(3)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-[#262636] flex justify-between">
                      <span className="text-[#9E9EAF]">Singular Value σ₂:</span>
                      <span className="text-white font-bold">{sigma2.toFixed(3)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-[#262636] flex justify-between">
                      <span className="text-[#9E9EAF]">Determinant det(W₁):</span>
                      <span className="text-[#FF5E7E] font-bold">{det.toFixed(3)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0A0A10] border border-[#262636] flex justify-between">
                      <span className="text-[#9E9EAF]">Condition Number κ(W₁):</span>
                      <span className="text-amber-400 font-bold">{conditionNumber.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ORIGAMI FOLD ================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262636] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
                    Step 4 • Topological Folding
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    The Origami Fold (ReLU Activation)
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161622] border border-[#262636] text-[#FF5E7E]">
                  Nonlinear Untangling
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <h4 className="text-base font-bold text-white">Folding A Sheet of Paper</h4>
                  <p className="text-xs md:text-sm text-[#9E9EAF] leading-relaxed">
                    A straight scissor cut cannot separate diagonal XOR corners. But if you fold
                    the paper in half along a crease line (ReLU: max(0, z)), the opposing corners
                    overlap on the same side, allowing a single straight cut to separate them!
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <h4 className="text-base font-bold text-white">Try It In The Playground</h4>
                  <p className="text-xs text-[#9E9EAF]">
                    In the Playground, the <strong className="text-white">Origami Space Fold (τ)</strong>{' '}
                    slider allows dragging the space continuously from flat Euclidean ℝ² into the
                    folded ReLU manifold!
                  </p>
                  <button
                    onClick={onSwitchToPlayground}
                    className="w-full py-3 rounded-xl border border-[#262636] bg-[#0A0A10] hover:border-[#FF5E7E]/50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Open Playground & Try Fold Slider</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: 3D LOSS VALLEY ================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262636] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
                    Step 5 • Multivariable Optimization
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    3D Mistake Valley (Loss Landscape)
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161622] border border-[#262636] text-amber-400">
                  Three.js 60fps
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <h4 className="text-base font-bold text-white">Gravity is the Negative Gradient</h4>
                  <p className="text-xs md:text-sm text-[#9E9EAF] leading-relaxed">
                    Think of training as dropping a ball on a hilly landscape. The height is the total
                    mistakes (BCE loss). Gravity pulls the ball downhill in the direction of steepest
                    descent: <code className="text-[#FF5E7E] font-mono">v = -∇ℒ</code>.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
                  <h4 className="text-base font-bold text-white">Three.js 3D Loss Valley</h4>
                  <p className="text-xs text-[#9E9EAF]">
                    Switch to the 3D Loss Valley tab to orbit the real 3D loss mountain, click to
                    drop Adam, Momentum, and SGD balls, and watch them race into the global minimum!
                  </p>
                  <button
                    onClick={onSwitchTo3DLoss}
                    className="w-full py-3 rounded-xl btn-coral text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>Launch 3D Loss Valley</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 6: STRESS TESTS ================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#262636] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
                    Step 6 • Stress-Tests
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                    Real-World Failure Modes & Mathematical Proofs
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#161622] border border-[#262636] text-[#FF5E7E]">
                  Formal Proofs
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Failure Mode 1 */}
                <div className="p-5 rounded-2xl bg-[#141422] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-amber-300 font-mono">
                      💥 Failure 1: Rank Collapse
                    </strong>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      det(W₁) = 0
                    </span>
                  </div>
                  <p className="text-xs text-[#9E9EAF] leading-relaxed">
                    By the <strong>Rank-Nullity Theorem</strong>, dim(ker(W₁)) = 1 collapses 2D space onto a 1D line.
                    The network permanently loses a spatial dimension and can never separate points whose difference
                    lies in the kernel.
                  </p>
                </div>

                {/* Failure Mode 2 */}
                <div className="p-5 rounded-2xl bg-[#141422] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-cyan-300 font-mono">
                      🥶 Failure 2: Dead ReLU Trap
                    </strong>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      ∇_W ℒ = 0
                    </span>
                  </div>
                  <p className="text-xs text-[#9E9EAF] leading-relaxed">
                    When all preactivations fall into the negative half-space, ReLU'(z) = 0.
                    By the multivariate chain rule, the gradient vanishes completely, stalling
                    optimization forever.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Footer inside Console */}
        <div className="px-6 py-4 border-t border-[#262636] bg-[#141422] flex items-center justify-between">
          <button
            onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl border border-[#262636] bg-[#0A0A10] hover:border-[#FF5E7E]/50 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 6 ? (
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              className="px-5 py-2 rounded-xl btn-coral text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <span>Next: {stepTitles[currentStep]}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSwitchToPlayground}
              className="px-5 py-2 rounded-xl btn-coral text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <span>Launch Full Playground</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ================= 3. BOTTOM BANNER ================= */}
        <div className="px-6 py-3 border-t border-[#262636] bg-[#11111C] flex items-center justify-center gap-3 text-center">
          <div className="w-5 h-5 rounded-full bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
            <Target className="w-3 h-3" />
          </div>
          <p className="text-xs text-white font-medium">
            A <strong className="text-[#FF5E7E]">zero-installation</strong> interactive demonstration
            of explainable neural networks through real mathematics.
          </p>
        </div>
      </div>
    </div>
  );
};
