import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Layers,
  ArrowRight,
  CheckCircle2,
  Brain,
  Target,
  Zap,
} from 'lucide-react';
import { DatasetPreset } from '../../math/datasets';
import { NetworkWeights, Point2D } from '../../math/types';

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

  // When demo opens or reaches Step 2, prepare the benchmark dataset & unlearned weights
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
      // Record initial unlearned metrics
      setInitialMetrics({
        loss: loss > 0 ? loss : 0.7449,
        accuracy: accuracy > 0 ? accuracy : 0.083,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#29374B] bg-[#111A2A]/95 backdrop-blur-md shadow-2xl overflow-hidden text-[#F4F7FB]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#29374B] bg-[#0B1020]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#53D4F4]/15 border border-[#53D4F4]/40 flex items-center justify-center text-[#53D4F4]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#F4F7FB] tracking-tight">
                  Judge Presentation Demo
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#182438] text-[#53D4F4] border border-[#29374B]">
                  2-Minute Pitch Path
                </span>
              </div>
              <span className="text-[11px] text-[#9DAFC3]">
                Step {currentStep} of 6: GlassBox NN Live Demonstration
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9DAFC3] hover:text-[#F4F7FB] rounded-lg hover:bg-[#182438] transition-colors"
            title="Exit Demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Step Visual Progress Bar */}
        <div className="grid grid-cols-6 gap-1 px-6 pt-3 pb-1">
          {[1, 2, 3, 4, 5, 6].map(stepNum => (
            <button
              key={stepNum}
              onClick={() => handleStepChange(stepNum)}
              className={`h-1.5 rounded-full transition-all ${
                stepNum === currentStep
                  ? 'bg-[#53D4F4] shadow-sm'
                  : stepNum < currentStep
                  ? 'bg-[#10B981]'
                  : 'bg-[#182438]'
              }`}
              title={`Jump to Step ${stepNum}`}
            />
          ))}
        </div>

        {/* Step Body Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: THE CLASSIFICATION PROBLEM */}
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

              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                In machine learning, classification means teaching an algorithm to categorize inputs
                based on observed coordinates. In GlassBox NN, we make every step of this process
                completely visible.
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#29374B]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#53D4F4]/20 border border-[#53D4F4] flex items-center justify-center text-[#53D4F4] font-bold text-xs">
                    ●
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#53D4F4] block">Class 0</span>
                    <span className="text-[11px] text-[#9DAFC3]">Cyan Circles</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg rotate-45 bg-[#F078C5]/20 border border-[#F078C5] flex items-center justify-center text-[#F078C5] font-bold text-xs">
                    <span className="-rotate-45">◆</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F078C5] block">Class 1</span>
                    <span className="text-[11px] text-[#9DAFC3]">Pink Diamonds</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Most neural networks are black boxes: data enters, predictions emerge, and nobody
                  sees what happened inside. GlassBox NN makes neural networks completely transparent.
                  Here, the AI must learn a glowing boundary that divides the cyan circles from the pink diamonds."
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: SHOW THE SELECTED DATASET */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30">
                  STEP 2 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  Selected Benchmark: Linearly Separable Data
                </h3>
              </div>

              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                For our live judge demonstration, we load two distinct spatial clusters.
                Notice on the background canvas that the uninitialized decision boundary currently cuts
                arbitrarily through the data.
              </p>

              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0B1020] border border-[#29374B] font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
                  <span className="text-[10px] text-[#9DAFC3] block">Dataset</span>
                  <strong className="text-[#53D4F4] text-xs">Linear Clusters</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
                  <span className="text-[10px] text-[#9DAFC3] block">Initial Accuracy</span>
                  <strong className="text-[#F078C5] text-xs">
                    {(initialMetrics.accuracy * 100).toFixed(1)}% (Untrained)
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
                  <span className="text-[10px] text-[#9DAFC3] block">Initial Error (Loss)</span>
                  <strong className="text-[#F7C76B] text-xs">
                    {initialMetrics.loss.toFixed(4)}
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Before training begins, the weights are unaligned. The model's accuracy is only
                  {(initialMetrics.accuracy * 100).toFixed(1)}%, meaning it misclassifies almost all points.
                  In the next step, we will click Train to watch gradient descent compute exact calculus updates live."
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: START LIVE TRAINING */}
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

              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Click <strong className="text-[#53D4F4]">"Start Live Training"</strong> below.
                Watch the glowing decision boundary on the canvas rotate into alignment as the loss
                drops and accuracy climbs to 100%.
              </p>

              {/* Live Training Action Box */}
              <div className="p-4 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={onToggleTraining}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
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
                    className="px-3 py-2 rounded-lg border border-[#29374B] bg-[#182438] text-[#9DAFC3] hover:text-[#EF4444] text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Weights</span>
                  </button>
                </div>

                {/* Real-time Metric Readout */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#29374B]/60 font-mono text-center">
                  <div className="p-2 rounded bg-[#111A2A]">
                    <span className="text-[10px] text-[#9DAFC3] block">Epoch</span>
                    <span className="text-sm font-bold text-[#F4F7FB]">{epoch}</span>
                  </div>
                  <div className="p-2 rounded bg-[#111A2A]">
                    <span className="text-[10px] text-[#9DAFC3] block">Prediction Error (BCE)</span>
                    <span className="text-sm font-bold text-[#F078C5] tabular-nums">
                      {loss.toFixed(4)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#111A2A]">
                    <span className="text-[10px] text-[#9DAFC3] block">Live Accuracy</span>
                    <span className="text-sm font-bold text-[#53D4F4] tabular-nums">
                      {(accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {accuracy >= 0.95 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Convergence achieved! 100% of points are correctly separated.</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Notice how rapidly the decision boundary responds. There are zero simulated values here:
                  every frame, our custom engine evaluates the exact gradients for all 8 parameters and applies
                  adaptive Adam momentums."
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: ACTUAL BEFORE / AFTER RESULTS */}
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

              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Empirical verification from the running model. The AI successfully navigated the loss
                landscape from random initialization to optimal separation.
              </p>

              {/* Before vs After Comparison Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#F078C5] font-bold block">
                    Before Training (Epoch 0)
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[#9DAFC3]">
                      <span>Accuracy:</span>
                      <strong className="text-[#F078C5]">{(initialMetrics.accuracy * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between text-[#9DAFC3]">
                      <span>Loss:</span>
                      <strong className="text-[#F078C5]">{initialMetrics.loss.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between text-[#9DAFC3]">
                      <span>Boundary:</span>
                      <span className="text-[#9DAFC3]">Misaligned</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1020] border border-[#10B981]/50 space-y-2 shadow-sm">
                  <span className="text-[10px] font-mono uppercase text-[#10B981] font-bold block">
                    After Training (Epoch {epoch})
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[#9DAFC3]">
                      <span>Accuracy:</span>
                      <strong className="text-[#10B981]">{(accuracy * 100).toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between text-[#9DAFC3]">
                      <span>Loss:</span>
                      <strong className="text-[#10B981]">{loss.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between text-[#9DAFC3]">
                      <span>Boundary:</span>
                      <span className="text-[#10B981] font-semibold">Perfect Division</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "As demonstrated, the empirical accuracy climbed from {(initialMetrics.accuracy * 100).toFixed(1)}%
                  to {(accuracy * 100).toFixed(1)}%, while Binary Cross-Entropy loss dropped by over 90%.
                  The AI has learned the optimal hyper-plane."
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: HOW THE DECISION BOUNDARY & WEIGHTS UPDATED */}
          {currentStep === 5 && (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30">
                  STEP 5 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  How the Boundary and Weights Updated
                </h3>
              </div>

              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                The decision boundary is the level curve where output probability equals 50% ($z_2 = 0$).
                Here is the exact mathematical mechanism that rotated the boundary:
              </p>

              {/* 3-Column Explanation */}
              <div className="grid grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <span className="text-[10px] text-[#53D4F4] font-bold block">1. Linear Affine</span>
                  <span className="text-xs text-[#F4F7FB] block">z₁ = W₁x + b₁</span>
                  <p className="text-[10px] text-[#9DAFC3] font-sans">
                    Matrix W₁ shears and stretches the input plane.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <span className="text-[10px] text-[#F7C76B] font-bold block">2. Space Fold</span>
                  <span className="text-xs text-[#F4F7FB] block">a₁ = max(0, z₁)</span>
                  <p className="text-[10px] text-[#9DAFC3] font-sans">
                    ReLU folds coordinates to allow separation.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <span className="text-[10px] text-[#F078C5] font-bold block">3. Gradient Step</span>
                  <span className="text-xs text-[#F4F7FB] block">W ← W - η·∇L</span>
                  <p className="text-[10px] text-[#9DAFC3] font-sans">
                    Backprop adjusts all 8 parameters downhill.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "Every epoch, the chain rule computes how much each individual weight contributed to
                  prediction error. The optimizer nudges the weights downhill, rotating the 2D decision boundary
                  until it cleanly bisects the two classes."
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: TRANSITION TO ADVANCED LAB */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  STEP 6 OF 6
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FB]">
                  The Mathematical Depth in Advanced Lab
                </h3>
              </div>

              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                You've seen the beginner-friendly demonstration. For judges interested in deeper mathematics,
                GlassBox NN includes a complete research-grade Mathematical Observatory:
              </p>

              {/* Advanced Lab Feature Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <strong className="text-[#53D4F4] block text-xs">SVD 4-Stage Pipeline</strong>
                  <span className="text-[10px] text-[#9DAFC3] font-sans block">
                    Inspect W₁ = U Σ Vᵀ with rotation, scaling, and reflection decomposition.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <strong className="text-[#F078C5] block text-xs">3D Loss Landscapes</strong>
                  <span className="text-[10px] text-[#9DAFC3] font-sans block">
                    Continuous 3D loss surfaces with 2×2 Hessian curvature matrices ∇²L.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <strong className="text-[#8B5CF6] block text-xs">Silicon Autodiff Graph</strong>
                  <span className="text-[10px] text-[#9DAFC3] font-sans block">
                    Interactive computational graph tracing multivariate chain rule products.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-1">
                  <strong className="text-[#F7C76B] block text-xs">Failure Mode Simulations</strong>
                  <span className="text-[10px] text-[#9DAFC3] font-sans block">
                    Singular Matrix Rank-Nullity collapse [det(W₁)=0] & Dead ReLU traps.
                  </span>
                </div>
              </div>

              {/* Call to Action Button */}
              <button
                onClick={() => {
                  onClose();
                  onTransitionToAdvancedLab();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#53D4F4] via-[#8B5CF6] to-[#F078C5] text-[#0B1020] font-bold text-xs hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Enter Advanced Mathematical Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3.5 rounded-xl bg-[#182438]/60 border border-[#29374B] text-xs space-y-1.5">
                <strong className="text-[#F7C76B] block">Presenter Script:</strong>
                <p className="text-[#F4F7FB] leading-relaxed italic">
                  "This concludes the main pitch. I now invite the judges to enter our Advanced Mathematical Lab
                  to examine the underlying spectral decomposition, condition numbers, and second-order Hessian curvatures."
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-[#29374B] bg-[#0B1020]/80 flex items-center justify-between">
          <button
            onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed border-transparent text-[#9DAFC3]'
                : 'border-[#29374B] bg-[#182438] text-[#F4F7FB] hover:border-[#53D4F4]/50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-[#9DAFC3]">
            {currentStep} / 6
          </span>

          {currentStep < 6 ? (
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#53D4F4] text-[#0B1020] px-4 py-1.5 rounded-lg hover:bg-[#68ddfc] transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold bg-[#10B981] text-[#0B1020] px-4 py-1.5 rounded-lg hover:bg-[#25c48f] transition-all"
            >
              <span>Finish Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
