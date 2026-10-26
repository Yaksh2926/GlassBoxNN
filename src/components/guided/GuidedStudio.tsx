import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  Brain,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Target,
  Zap,
} from 'lucide-react';
import { Point2D, NetworkWeights, OptimizerConfig } from '../../math/types';
import { DatasetPreset } from '../../math/datasets';
import { MathView } from '../common/MathView';

interface GuidedStudioProps {
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  dataset: Point2D[];
  weights: NetworkWeights;
  onUpdateWeights: (newWeights: NetworkWeights) => void;
  isTraining: boolean;
  onToggleTraining: () => void;
  onStepOnce: () => void;
  onResetModel: () => void;
  epoch: number;
  loss: number;
  accuracy: number;
  onOpenAdvancedLab: () => void;
  onLaunchJudgeDemo: () => void;
}

export const GuidedStudio: React.FC<GuidedStudioProps> = ({
  currentPreset,
  onSelectPreset,
  dataset,
  weights,
  onUpdateWeights,
  isTraining,
  onToggleTraining,
  onStepOnce,
  onResetModel,
  epoch,
  loss,
  accuracy,
  onOpenAdvancedLab,
  onLaunchJudgeDemo,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  // Status message based on training progress
  const getTrainingStatus = () => {
    if (epoch === 0) {
      return {
        badge: 'Ready to Train',
        badgeColor: 'text-[#9DAFC3] bg-[#182438] border-[#29374B]',
        text: 'Click "Train AI" to start learning from the data.',
      };
    }
    if (accuracy >= 0.95) {
      return {
        badge: 'Excellent Separation',
        badgeColor: 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40',
        text: `The AI achieved ${(accuracy * 100).toFixed(0)}% accuracy! The boundary cleanly separates both classes.`,
      };
    }
    if (accuracy >= 0.75) {
      return {
        badge: 'Learning in Progress',
        badgeColor: 'text-[#53D4F4] bg-[#53D4F4]/15 border-[#53D4F4]/40',
        text: `Accuracy is currently ${(accuracy * 100).toFixed(0)}%. The boundary is shifting into position.`,
      };
    }
    if (epoch > 80 && accuracy < 0.65) {
      return {
        badge: 'Slow Convergence',
        badgeColor: 'text-[#F7C76B] bg-[#F7C76B]/15 border-[#F7C76B]/40',
        text: 'The model is taking longer to settle. Try clicking "Reset" or switch datasets.',
      };
    }
    return {
      badge: 'Training Active',
      badgeColor: 'text-[#53D4F4] bg-[#53D4F4]/15 border-[#53D4F4]/40',
      text: 'Neural weights are continuously updating via gradient descent.',
    };
  };

  const status = getTrainingStatus();

  return (
    <aside className="fixed left-3 top-16 bottom-6 z-30 w-[310px] sm:w-[340px] flex flex-col rounded-xl overflow-hidden border border-[#29374B] bg-[#111A2A]/95 backdrop-blur-md shadow-2xl text-[#F4F7FB] select-none">
      {/* Studio Header */}
      <div className="px-4 py-3 border-b border-[#29374B] bg-[#0B1020]/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-xs tracking-tight text-[#F4F7FB] block">
              Guided AI Studio
            </span>
            <span className="text-[10px] font-mono text-[#9DAFC3]">
              3-Step Demonstration
            </span>
          </div>
        </div>

        <button
          onClick={onLaunchJudgeDemo}
          className="text-[10px] font-semibold bg-[#53D4F4] text-[#0B1020] px-2.5 py-1 rounded-md hover:bg-[#68ddfc] transition-all flex items-center gap-1 shadow-sm active:scale-95"
          title="Launch Guided 2-Minute College Ideathon Demo"
        >
          <Sparkles className="w-3 h-3" />
          <span>Judge Demo</span>
        </button>
      </div>

      {/* 3-Step Segmented Navigation Pills */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-[#0B1020]/40 border-b border-[#29374B] text-[11px] font-mono font-medium">
        <button
          onClick={() => setActiveStep(1)}
          className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center ${
            activeStep === 1
              ? 'bg-[#182438] text-[#53D4F4] border border-[#53D4F4]/50 font-bold shadow-sm'
              : 'text-[#9DAFC3] hover:text-[#F4F7FB] border border-transparent'
          }`}
        >
          <span className="text-[9px] opacity-70">STEP 1</span>
          <span>Choose Data</span>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center ${
            activeStep === 2
              ? 'bg-[#182438] text-[#53D4F4] border border-[#53D4F4]/50 font-bold shadow-sm'
              : 'text-[#9DAFC3] hover:text-[#F4F7FB] border border-transparent'
          }`}
        >
          <span className="text-[9px] opacity-70">STEP 2</span>
          <span>Train AI</span>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`py-1.5 rounded-lg transition-all text-center flex flex-col items-center justify-center ${
            activeStep === 3
              ? 'bg-[#182438] text-[#53D4F4] border border-[#53D4F4]/50 font-bold shadow-sm'
              : 'text-[#9DAFC3] hover:text-[#F4F7FB] border border-transparent'
          }`}
        >
          <span className="text-[9px] opacity-70">STEP 3</span>
          <span>Understand</span>
        </button>
      </div>

      {/* Scrollable Step Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= STEP 1: CHOOSE DATA ================= */}
        {activeStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-mono text-[#53D4F4] font-bold uppercase tracking-wider block">
                Step 1 of 3
              </span>
              <h3 className="text-base font-bold text-[#F4F7FB]">
                Select a Challenge
              </h3>
              <p className="text-xs text-[#9DAFC3] mt-1 leading-relaxed">
                Choose a pattern for the AI to learn. See how simple lines handle easy data,
                while neural networks are needed for complex geometry.
              </p>
            </div>

            {/* Easy vs Challenge Cards */}
            <div className="space-y-2.5">
              {/* Option A: Easy (Linear Separable) */}
              <button
                onClick={() => onSelectPreset('linear')}
                className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  currentPreset === 'linear'
                    ? 'border-[#53D4F4] bg-[#182438] shadow-md'
                    : 'border-[#29374B] bg-[#111A2A] hover:border-[#53D4F4]/40 hover:bg-[#182438]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                      EASY
                    </span>
                    <strong className="text-xs text-[#F4F7FB]">Linear Clusters</strong>
                  </div>
                  {currentPreset === 'linear' && (
                    <CheckCircle2 className="w-4 h-4 text-[#53D4F4]" />
                  )}
                </div>
                <p className="text-[11px] text-[#9DAFC3] mt-2 leading-relaxed">
                  Two separate clusters of dots. Can be cleanly divided by a single straight boundary line.
                </p>
              </button>

              {/* Option B: Challenge (XOR Pattern) */}
              <button
                onClick={() => onSelectPreset('xor')}
                className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  currentPreset === 'xor'
                    ? 'border-[#53D4F4] bg-[#182438] shadow-md'
                    : 'border-[#29374B] bg-[#111A2A] hover:border-[#53D4F4]/40 hover:bg-[#182438]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F078C5]/20 text-[#F078C5] border border-[#F078C5]/40">
                      CHALLENGE
                    </span>
                    <strong className="text-xs text-[#F4F7FB]">XOR Parity Pattern</strong>
                  </div>
                  {currentPreset === 'xor' && (
                    <CheckCircle2 className="w-4 h-4 text-[#53D4F4]" />
                  )}
                </div>
                <p className="text-[11px] text-[#9DAFC3] mt-2 leading-relaxed">
                  Diagonal criss-cross pattern. Mathematically impossible for a straight line; requires
                  the neural network to fold coordinate space!
                </p>
              </button>
            </div>

            {/* Class Color Legend Box */}
            <div className="p-3 rounded-lg bg-[#0B1020] border border-[#29374B] text-xs space-y-2">
              <span className="text-[10px] font-mono text-[#9DAFC3] uppercase tracking-wider block">
                Target Classes to Separate
              </span>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2 text-[#53D4F4]">
                  <span className="text-sm">●</span>
                  <span>Class 0 (Cyan Dots)</span>
                </div>
                <div className="flex items-center gap-2 text-[#F078C5]">
                  <span className="text-sm">◆</span>
                  <span>Class 1 (Pink Dots)</span>
                </div>
              </div>
              <p className="text-[10.5px] text-[#9DAFC3] leading-relaxed pt-1 border-t border-[#29374B]/50">
                The AI's objective is to draw a glowing boundary on the canvas that isolates cyan circles from pink diamonds.
              </p>
            </div>

            {/* Next Step Action */}
            <button
              onClick={() => setActiveStep(2)}
              className="w-full py-2.5 rounded-lg bg-[#53D4F4] text-[#0B1020] font-semibold text-xs hover:bg-[#68ddfc] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>Proceed to Step 2: Train AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= STEP 2: TRAIN THE AI ================= */}
        {activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-mono text-[#53D4F4] font-bold uppercase tracking-wider block">
                Step 2 of 3
              </span>
              <h3 className="text-base font-bold text-[#F4F7FB]">
                Train the Neural Network
              </h3>
              <p className="text-xs text-[#9DAFC3] mt-1 leading-relaxed">
                Watch the AI adjust its weights in real time. The decision boundary on the canvas
                will bend and align as training progresses.
              </p>
            </div>

            {/* Primary Train AI Button */}
            <div className="space-y-2">
              <button
                onClick={onToggleTraining}
                className={`w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
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
                    <span>Train AI ({epoch === 0 ? 'Start Learning' : 'Resume'})</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onStepOnce}
                  disabled={isTraining}
                  className="flex-1 py-2 px-3 rounded-lg border border-[#29374B] bg-[#182438] hover:bg-[#20304A] text-[#F4F7FB] text-xs font-mono font-medium transition-colors disabled:opacity-40"
                  title="Run exactly one backpropagation step"
                >
                  Step (1 Epoch)
                </button>

                <button
                  onClick={onResetModel}
                  className="p-2 rounded-lg border border-[#29374B] bg-[#182438] hover:bg-[#20304A] text-[#9DAFC3] hover:text-[#EF4444] transition-colors"
                  title="Reset weights and clear training progress"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Model Training Metrics */}
            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9DAFC3]">Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${status.badgeColor}`}>
                  {status.badge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#29374B]/60">
                {/* Prediction Error (Loss) */}
                <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B]">
                  <div className="flex items-center justify-between text-[10px] text-[#9DAFC3]">
                    <span>Prediction Error</span>
                    <span title="Binary Cross-Entropy Loss: measures distance between AI predictions and true labels. Lower is better.">
                      <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </div>
                  <span className="text-base font-bold text-[#F078C5] tabular-nums block mt-0.5">
                    {loss.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-[#9DAFC3]">BCE Loss</span>
                </div>

                {/* Accuracy */}
                <div className="p-2 rounded-lg bg-[#111A2A] border border-[#29374B]">
                  <div className="flex items-center justify-between text-[10px] text-[#9DAFC3]">
                    <span>Accuracy</span>
                    <span title="Percentage of data points classified correctly.">
                      <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </div>
                  <span className="text-base font-bold text-[#53D4F4] tabular-nums block mt-0.5">
                    {(accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-[#9DAFC3]">Correct Dots</span>
                </div>
              </div>

              {/* Epoch Count */}
              <div className="flex items-center justify-between text-xs pt-1 text-[#9DAFC3]">
                <span>Training Rounds (Epochs)</span>
                <span className="text-[#F4F7FB] font-bold">{epoch}</span>
              </div>

              <p className="text-[10.5px] font-sans text-[#9DAFC3] leading-relaxed pt-1.5 border-t border-[#29374B]/50">
                {status.text}
              </p>
            </div>

            {/* Next Step Action */}
            <button
              onClick={() => setActiveStep(3)}
              className="w-full py-2.5 rounded-lg bg-[#182438] border border-[#29374B] hover:border-[#53D4F4]/50 text-[#F4F7FB] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Proceed to Step 3: Understand Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= STEP 3: UNDERSTAND HOW IT LEARNS ================= */}
        {activeStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] font-mono text-[#53D4F4] font-bold uppercase tracking-wider block">
                Step 3 of 3
              </span>
              <h3 className="text-base font-bold text-[#F4F7FB]">
                How the AI Learns
              </h3>
              <p className="text-xs text-[#9DAFC3] mt-1 leading-relaxed">
                Demystifying the learning cycle from input coordinate to weight update.
              </p>
            </div>

            {/* Plain-Language Learning Pipeline */}
            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[#53D4F4] font-semibold uppercase tracking-wider block">
                The 5-Step Learning Cycle
              </span>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#182438] text-[#53D4F4] font-bold flex items-center justify-center text-[10px]">1</span>
                  <span><strong>Data:</strong> Takes dot position (X, Y)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#182438] text-[#53D4F4] font-bold flex items-center justify-center text-[10px]">2</span>
                  <span><strong>Prediction:</strong> AI calculates class guess</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#182438] text-[#F078C5] font-bold flex items-center justify-center text-[10px]">3</span>
                  <span><strong>Error:</strong> Measures how far off guess was</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#182438] text-[#F7C76B] font-bold flex items-center justify-center text-[10px]">4</span>
                  <span><strong>Backprop:</strong> Adjusts weights backwards</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#182438] text-[#10B981] font-bold flex items-center justify-center text-[10px]">5</span>
                  <span><strong>Improved:</strong> Boundary shifts closer</span>
                </div>
              </div>
            </div>

            {/* Architecture Schematic: 2-2-1 Perceptron */}
            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2 text-xs">
              <span className="text-[10px] font-mono text-[#9DAFC3] uppercase tracking-wider block">
                Network Architecture: 2 ➔ 2 ➔ 1
              </span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                  <span className="text-[#53D4F4] font-bold block text-xs">2 Inputs</span>
                  <span className="text-[#9DAFC3] text-[9px]">(X, Y) Coordinates</span>
                </div>
                <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                  <span className="text-[#F7C76B] font-bold block text-xs">2 Hidden</span>
                  <span className="text-[#9DAFC3] text-[9px]">Space Folding</span>
                </div>
                <div className="p-2 rounded bg-[#111A2A] border border-[#29374B]">
                  <span className="text-[#F078C5] font-bold block text-xs">1 Output</span>
                  <span className="text-[#9DAFC3] text-[9px]">Probability (0-1)</span>
                </div>
              </div>
            </div>

            {/* "Show the Math" Collapsible Option */}
            <div className="pt-1">
              <button
                onClick={() => setShowMathDetails(!showMathDetails)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[#182438] border border-[#29374B] text-xs font-mono text-[#9DAFC3] hover:text-[#F4F7FB] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#53D4F4]" />
                  <span>{showMathDetails ? 'Hide Formulas' : 'Show the Underlying Math'}</span>
                </span>
                {showMathDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showMathDetails && (
                <div className="mt-2 p-3 rounded-lg bg-[#0B1020] border border-[#29374B] text-[10px] space-y-2.5 font-mono text-[#9DAFC3] animate-in fade-in duration-150">
                  <div>
                    <span className="text-[#53D4F4] font-bold block">1. Layer 1 Affine Map:</span>
                    <MathView math="z_1 = W_1 x + b_1" />
                    <p className="text-[9px] mt-0.5">Continuous shearing and stretching of the 2D coordinate plane.</p>
                  </div>
                  <div className="pt-1 border-t border-[#29374B]/50">
                    <span className="text-[#F7C76B] font-bold block">2. Non-Linear Space Fold:</span>
                    <MathView math="a_1 = \sigma(z_1) = \max(0, z_1)" />
                    <p className="text-[9px] mt-0.5">Cover's Theorem: Folds space along crease lines to isolate XOR.</p>
                  </div>
                  <div className="pt-1 border-t border-[#29374B]/50">
                    <span className="text-[#F078C5] font-bold block">3. Gradient Backpropagation:</span>
                    <MathView math="\frac{\partial \mathcal{L}}{\partial W_1} = (\hat{y} - y) w_2 \sigma'(z_1) x^T" />
                    <p className="text-[9px] mt-0.5">Calculates exact slope to minimize prediction error.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Callout: Transition to Advanced Mathematical Lab */}
      <div className="p-3 border-t border-[#29374B] bg-[#0B1020]/90 flex flex-col gap-2">
        <button
          onClick={onOpenAdvancedLab}
          className="w-full py-2.5 rounded-lg bg-[#182438] hover:bg-[#20304A] border border-[#53D4F4]/50 hover:border-[#53D4F4] text-[#53D4F4] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
          title="Open the Advanced Mathematical Observatory (Matrices, SVD, 3D Loss Surface, Gradient Flow)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Open Advanced Mathematical Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
