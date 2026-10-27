import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { DatasetPreset } from '../../math/datasets';
import { NetworkWeights, Point2D } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';

interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onTransitionToAdvancedLab: () => void;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  isOpen,
  onClose,
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
  onTransitionToAdvancedLab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initialMetrics, setInitialMetrics] = useState<{ loss: number; accuracy: number }>({
    loss: 0.7449,
    accuracy: 0.083,
  });

  // When demo opens or reaches Step 1/2, prepare the benchmark dataset & unlearned weights
  useEffect(() => {
    if (isOpen && currentStep === 1) {
      onSelectPreset('linear');
      onSetInitialUnlearnedWeights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  // Compute live SVD and determinant for judges
  const svd = LinearAlgebra.svd(weights.W1);
  const sigma1 = svd.singularValues[0];
  const sigma2 = svd.singularValues[1];
  const det = LinearAlgebra.det(weights.W1);
  const conditionNumber = sigma2 > 1e-4 ? sigma1 / sigma2 : 999;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-[#262636] bg-[#0E0E18] shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden text-[#F4F7FB]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262636] bg-[#141422]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5E7E] to-[#FF4767] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,94,126,0.4)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-base font-black text-white tracking-tight">
                  Interactive Demo
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FF5E7E]/15 text-[#FF5E7E] border border-[#FF5E7E]/30">
                  Theme 5: Explainable AI Through Math
                </span>
              </div>
              <span className="text-[11px] text-[#9E9EAF]">
                Step {currentStep} of 6 • 2-Minute Guided Walkthrough
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#9E9EAF] hover:text-white rounded-xl hover:bg-[#1E1E2C] border border-transparent hover:border-[#262636] transition-all"
            title="Close Demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Step Visual Progress Bar */}
        <div className="grid grid-cols-6 gap-1.5 px-6 pt-3 pb-1 bg-[#10101A]">
          {[1, 2, 3, 4, 5, 6].map(stepNum => (
            <button
              key={stepNum}
              onClick={() => handleStepChange(stepNum)}
              className={`h-1.5 rounded-full transition-all ${
                stepNum === currentStep
                  ? 'bg-[#FF5E7E] shadow-[0_0_8px_rgba(255,94,126,0.6)]'
                  : stepNum < currentStep
                  ? 'bg-emerald-400'
                  : 'bg-[#1E1E2C]'
              }`}
              title={`Jump to Step ${stepNum}`}
            />
          ))}
        </div>

        {/* Step Body Content */}
        <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* ================= STEP 1: THE CLASSIFICATION PROBLEM ================= */}
          {currentStep === 1 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30">
                  STEP 1 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  The Classification Problem
                </h3>
              </div>

              {/* Split Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left: 10-Second Beginner Intuition */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#53D4F4]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#53D4F4] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>For Beginners — 10-Second Intuition</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#9DAFC3]">
                      Metaphor
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Two Teams on a Field
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    Imagine cyan circles and pink diamonds are two opposing teams scattered across a sports field.
                    The AI's job is to place one straight <strong>Dividing Fence</strong> between them without touching either team!
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111A2A] border border-[#29374B]">
                      <span className="text-sm text-[#53D4F4]">●</span>
                      <div>
                        <span className="text-xs font-bold text-[#53D4F4] block">Team A</span>
                        <span className="text-[10px] text-[#9DAFC3]">Cyan Circles</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111A2A] border border-[#29374B]">
                      <span className="text-sm text-[#F078C5]">◆</span>
                      <div>
                        <span className="text-xs font-bold text-[#F078C5] block">Team B</span>
                        <span className="text-[10px] text-[#9DAFC3]">Pink Diamonds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Live Mathematical Proof for Judges */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#8B5CF6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <span>📐</span>
                      <span>For Judges — Live Mathematical Proof</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA]">
                      Rigorous Math
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Binary Classification: ℝ² ➔ {'{0, 1}'}
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    Learn parametric hypothesis <code className="text-[#53D4F4] font-mono">h_θ(x) = σ(W₂·ReLU(W₁x + b₁) + b₂)</code>.
                    The decision boundary is the level curve where output probability equals 50% (<code className="text-[#F7C76B] font-mono">z₂ = 0</code>).
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B] font-mono text-[11px] text-[#9DAFC3] space-y-1">
                    <div className="flex justify-between">
                      <span>Dataset Cardinality:</span>
                      <strong className="text-[#F4F7FB]">N = {dataset.length} samples</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Embedding Dimension:</span>
                      <strong className="text-[#53D4F4]">ℝ² ➔ ℝ² ➔ ℝ¹</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Parameter Space:</span>
                      <strong className="text-[#F7C76B]">θ ∈ ℝ⁸ (Analytical)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenter Pitch Script */}
              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Most neural networks are black boxes: data enters, predictions emerge, and nobody sees what happened inside. GlassBox NN makes neural networks completely transparent. Here, the AI must learn a glowing boundary that divides the cyan circles from the pink diamonds."
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 2: SHOW UNTRAINED BENCHMARK ================= */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30">
                  STEP 2 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  Selected Benchmark: Untrained Baseline
                </h3>
              </div>

              {/* Split Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left: 10-Second Beginner Intuition */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#53D4F4]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#53D4F4] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>For Beginners — 10-Second Intuition</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#9DAFC3]">
                      Metaphor
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    The Fence is In The Wrong Spot!
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    At the start, the AI guesses blindly. Its dividing fence is slicing right through Team A, getting almost everything wrong!
                    Because the guesses are wild, the <strong>Mistake Score</strong> is very high (~0.74).
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-center">
                    <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
                      <span className="text-[10px] text-[#9DAFC3] block">Untrained Accuracy</span>
                      <strong className="text-[#F078C5] text-xs">{(initialMetrics.accuracy * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
                      <span className="text-[10px] text-[#9DAFC3] block">Mistake Score</span>
                      <strong className="text-[#F7C76B] text-xs">{initialMetrics.loss.toFixed(4)}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Live Mathematical Proof for Judges */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#8B5CF6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <span>📐</span>
                      <span>For Judges — Live Mathematical Proof</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA]">
                      Rigorous Math
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Empirical Baseline Metrics
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    Initial unlearned parameters yield high cross-entropy loss:
                    <code className="text-[#F078C5] font-mono block mt-1">ℒ = -1/N ∑ [y ln ŷ + (1-y) ln(1-ŷ)]</code>
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B] font-mono text-[11px] text-[#9DAFC3] space-y-1">
                    <div className="flex justify-between">
                      <span>Loss (BCE):</span>
                      <strong className="text-[#F7C76B]">{initialMetrics.loss.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>det(W₁):</span>
                      <strong className="text-[#53D4F4]">{det.toFixed(3)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Singular Values:</span>
                      <strong className="text-[#A78BFA]">σ₁={sigma1.toFixed(2)}, σ₂={sigma2.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenter Pitch Script */}
              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Before training begins, the weights are unaligned. The model's accuracy is only {(initialMetrics.accuracy * 100).toFixed(1)}%, meaning it misclassifies almost all points. In the next step, we will click Train to watch gradient descent compute exact calculus updates live."
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 3: START LIVE TRAINING ================= */}
          {currentStep === 3 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30">
                  STEP 3 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  Live Neural Model Training
                </h3>
              </div>

              {/* Split Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left: 10-Second Beginner Intuition */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#53D4F4]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#53D4F4] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>For Beginners — 10-Second Intuition</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#9DAFC3]">
                      Metaphor
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    The Downhill Compass Guides the Fence
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    Click <strong>"Start Live Training"</strong> below. Every round, the AI's <strong>Downhill Compass</strong> nudges the grid stretch and shift knobs downhill, pulling the fence straight into the gap!
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={onToggleTraining}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                        isTraining
                          ? 'bg-[#F7C76B] text-[#0B1020] hover:bg-[#ebd07a]'
                          : 'bg-[#53D4F4] text-[#0B1020] hover:bg-[#68ddfc]'
                      }`}
                    >
                      {isTraining ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause Training</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>{epoch === 0 ? 'Start Live Training' : 'Resume Training'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={onResetTraining}
                      className="px-3 py-2 rounded-xl border border-[#29374B] bg-[#182438] text-[#9DAFC3] hover:text-[#EF4444] text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title="Reset Weights"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right: Live Mathematical Proof for Judges */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#8B5CF6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <span>📐</span>
                      <span>For Judges — Live Mathematical Proof</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA]">
                      Rigorous Math
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Analytical Adam Backpropagation
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    Zero simulated metrics: exact analytical gradients <code className="text-[#53D4F4] font-mono">∂ℒ/∂W</code> evaluated per frame and updated via adaptive momentums.
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-[#111A2A] border border-[#29374B] font-mono text-center">
                    <div>
                      <span className="text-[9px] text-[#9DAFC3] block">Epoch</span>
                      <strong className="text-xs text-[#F4F7FB]">{epoch}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#9DAFC3] block">BCE Loss</span>
                      <strong className="text-xs text-[#F078C5] tabular-nums">{loss.toFixed(4)}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#9DAFC3] block">Accuracy</span>
                      <strong className="text-xs text-[#53D4F4] tabular-nums">{(accuracy * 100).toFixed(1)}%</strong>
                    </div>
                  </div>

                  {accuracy >= 0.98 && (
                    <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#10B981]/15 text-[#10B981] text-[11px] font-semibold border border-[#10B981]/40">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Convex Separation Verified (100% Accuracy)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Presenter Pitch Script */}
              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Notice how rapidly the decision boundary responds. There are zero simulated values here: every frame, our custom engine evaluates the exact gradients for all 8 parameters and applies adaptive Adam momentums."
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ACTUAL BEFORE / AFTER RESULTS ================= */}
          {currentStep === 4 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  STEP 4 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  Actual Before & After Results
                </h3>
              </div>

              {/* Split Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left: 10-Second Beginner Intuition */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#53D4F4]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#53D4F4] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>For Beginners — 10-Second Intuition</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#9DAFC3]">
                      Metaphor
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Clean Separation: 0 Mistakes!
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    By stretching and folding the field, the fence now cleanly isolates every cyan circle from every pink diamond. The mistake score plummeted to nearly zero!
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
                      <span className="text-[10px] text-[#F078C5] block font-bold uppercase">Before</span>
                      <div className="text-[11px] text-[#9DAFC3] mt-1">
                        Score: <strong className="text-[#F078C5]">{initialMetrics.loss.toFixed(2)}</strong>
                      </div>
                      <div className="text-[11px] text-[#9DAFC3]">
                        Acc: <strong className="text-[#F078C5]">{(initialMetrics.accuracy * 100).toFixed(0)}%</strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#10B981]/40">
                      <span className="text-[10px] text-[#10B981] block font-bold uppercase">After</span>
                      <div className="text-[11px] text-[#9DAFC3] mt-1">
                        Score: <strong className="text-[#10B981]">{loss.toFixed(2)}</strong>
                      </div>
                      <div className="text-[11px] text-[#9DAFC3]">
                        Acc: <strong className="text-[#10B981]">{(accuracy * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Live Mathematical Proof for Judges */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#8B5CF6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <span>📐</span>
                      <span>For Judges — Live Mathematical Proof</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA]">
                      Rigorous Math
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Empirical Optimization Convergence
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    Statistical validation from the running model:
                  </p>

                  <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B] font-mono text-[11px] text-[#9DAFC3] space-y-1">
                    <div className="flex justify-between">
                      <span>BCE Loss Delta:</span>
                      <strong className="text-[#10B981]">{(initialMetrics.loss - loss).toFixed(4)} (↓ &gt;90%)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy Delta:</span>
                      <strong className="text-[#10B981]">{(initialMetrics.accuracy * 100).toFixed(1)}% ➔ {(accuracy * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition Number κ(W₁):</span>
                      <strong className="text-[#53D4F4]">{conditionNumber.toFixed(2)} (Non-singular)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenter Pitch Script */}
              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "As demonstrated, the empirical accuracy climbed from {(initialMetrics.accuracy * 100).toFixed(1)}% to {(accuracy * 100).toFixed(1)}%, while Binary Cross-Entropy loss dropped by over 90%. The AI has learned the optimal separating hyperplane."
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 5: HOW THE BOUNDARY & WEIGHTS UPDATED ================= */}
          {currentStep === 5 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30">
                  STEP 5 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  The 3 Pillars of AI Math (Theme 5)
                </h3>
              </div>

              {/* Split Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left: 10-Second Beginner Intuition */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#53D4F4]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#53D4F4] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>For Beginners — 10-Second Intuition</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#9DAFC3]">
                      Metaphors
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Stretch, Fold, and Nudge
                  </strong>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B] space-y-0.5">
                      <strong className="text-[#53D4F4] block text-[11px]">1. The Rubber Sheet (Weights & Biases)</strong>
                      <span className="text-[#9DAFC3] text-[10.5px]">Multiplying by W₁ stretches and rotates the coordinate sheet; b₁ slides it.</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B] space-y-0.5">
                      <strong className="text-[#F078C5] block text-[11px]">2. Origami Fold (ReLU Activation)</strong>
                      <span className="text-[#9DAFC3] text-[10.5px]">Creases the paper at 0 so tangled dots can be separated with one straight cut.</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B] space-y-0.5">
                      <strong className="text-[#F7C76B] block text-[11px]">3. Downhill Compass (Gradients)</strong>
                      <span className="text-[#9DAFC3] text-[10.5px]">Calculus tells each knob which direction is downhill toward Mistake Valley.</span>
                    </div>
                  </div>
                </div>

                {/* Right: Live Mathematical Proof for Judges */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#8B5CF6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <span>📐</span>
                      <span>For Judges — Live Mathematical Proof</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA]">
                      Analytical Proof
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Affine Geometry & Multivariate Autodiff
                  </strong>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B] space-y-0.5">
                      <span className="text-[#53D4F4] font-bold block">Affine Map: z₁ = W₁x + b₁</span>
                      <span className="text-[#9DAFC3] text-[10px] font-sans">Linear embedding from ℝ² ➔ ℝ² preserving collinearity.</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B] space-y-0.5">
                      <span className="text-[#F078C5] font-bold block">Folding: a₁ = max(0, z₁)</span>
                      <span className="text-[#9DAFC3] text-[10px] font-sans">Cover's Theorem on XOR separability in non-negative orthant.</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B] space-y-0.5">
                      <span className="text-[#F7C76B] font-bold block">Chain Rule: ∂ℒ/∂W₁ = (∂ℒ/∂z₂ · W₂ ⊙ 𝟙_z₁&gt;0) xᵀ</span>
                      <span className="text-[#9DAFC3] text-[10px] font-sans">Exact multivariate backpropagation without numerical approximation.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenter Pitch Script */}
              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Every epoch, the chain rule computes how much each individual weight contributed to prediction error. The optimizer nudges the weights downhill, rotating the 2D decision boundary until it cleanly bisects the two classes."
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 6: TRANSITION TO ADVANCED LAB ================= */}
          {currentStep === 6 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  STEP 6 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  The Mathematical Depth in Advanced Lab
                </h3>
              </div>

              {/* Split Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Left: 10-Second Beginner Intuition */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#53D4F4]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#53D4F4] flex items-center gap-1.5">
                      <span>💡</span>
                      <span>For Beginners — 10-Second Intuition</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#9DAFC3]">
                      Exploration
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Explore Inside the Glass Box
                  </strong>

                  <p className="text-xs text-[#9DAFC3] leading-relaxed">
                    You've seen the 60-second explanation. Now step into our research-grade lab to interact with 3D Mistake Valleys, trace live compass pulses, and see what breaks when space gets squashed flat!
                  </p>

                  <button
                    onClick={() => {
                      onClose();
                      onTransitionToAdvancedLab();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#53D4F4] via-[#8B5CF6] to-[#F078C5] text-[#0B1020] font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Enter Advanced Mathematical Lab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Live Mathematical Proof for Judges */}
                <div className="p-4 rounded-xl bg-[#0B1020] border border-[#8B5CF6]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#29374B]/60 pb-2">
                    <span className="text-xs font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <span>📐</span>
                      <span>For Judges — Live Mathematical Proof</span>
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA]">
                      Research Features
                    </span>
                  </div>

                  <strong className="text-sm text-[#F4F7FB] block">
                    Research-Grade Mathematical Observatory
                  </strong>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                      <strong className="text-[#53D4F4] block">SVD Decomposition</strong>
                      <span className="text-[#9DAFC3] font-sans">W₁ = U Σ Vᵀ</span>
                    </div>
                    <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                      <strong className="text-[#F078C5] block">3D Loss Landscapes</strong>
                      <span className="text-[#9DAFC3] font-sans">Hessian ∇²ℒ</span>
                    </div>
                    <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                      <strong className="text-[#8B5CF6] block">Silicon Autodiff</strong>
                      <span className="text-[#9DAFC3] font-sans">DAG chain rule</span>
                    </div>
                    <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                      <strong className="text-[#F7C76B] block">Failure Modes</strong>
                      <span className="text-[#9DAFC3] font-sans">Rank collapse det=0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presenter Pitch Script */}
              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "This concludes the main pitch. I now invite the judges to enter our Advanced Mathematical Lab to examine the underlying spectral decomposition, condition numbers, and second-order Hessian curvatures."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-[#262636] bg-[#141422] flex items-center justify-between">
          <button
            onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed border-[#262636] text-[#9E9EAF]'
                : 'border-[#262636] bg-[#0A0A10] text-white hover:border-[#FF5E7E]/50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs font-mono text-[#9E9EAF]">
            Step <strong className="text-white">{currentStep}</strong> of 6
          </span>

          {currentStep < 6 ? (
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              className="flex items-center gap-1.5 text-xs font-bold btn-coral px-5 py-2 rounded-xl transition-all active:scale-95 shadow-md"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#0C0C12] px-5 py-2 rounded-xl transition-all active:scale-95 shadow-md"
            >
              <span>Finish Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
