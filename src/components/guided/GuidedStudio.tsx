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
  Box,
  GitBranch,
  Compass,
  Mountain,
} from 'lucide-react';
import { Point2D, NetworkWeights, OptimizerConfig } from '../../math/types';
import { DatasetPreset } from '../../math/datasets';
import { MathView } from '../common/MathView';
import { getTermText } from '../../math/metaphors';

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
  intuitionMode?: boolean;
  onNavigateView?: (labMode: 'guided' | 'advanced', viewMode: 'geometry' | 'loss' | 'graph') => void;
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
  intuitionMode = true,
  onNavigateView,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

  // Status message based on training progress
  const getTrainingStatus = () => {
    if (epoch === 0) {
      return {
        badge: intuitionMode ? 'Blind Guessing' : 'Ready to Train',
        badgeColor: 'text-[#9DAFC3] bg-[#182438] border-[#29374B]',
        text: intuitionMode
          ? 'The dividing fence is placed randomly. Click "Train AI" to start downhill compass nudges.'
          : 'Initial random parameter state. Click "Train AI" to start gradient descent.',
      };
    }
    if (accuracy >= 0.95) {
      return {
        badge: intuitionMode ? 'Fence Perfect!' : 'Converged (100%)',
        badgeColor: 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/40',
        text: intuitionMode
          ? `The AI reached ${(accuracy * 100).toFixed(0)}% accuracy! The fence cleanly divides both teams.`
          : `Optimal separation achieved at epoch ${epoch} with ℒ = ${loss.toFixed(4)}.`,
      };
    }
    if (accuracy >= 0.75) {
      return {
        badge: intuitionMode ? 'Downhill Progress' : 'Learning in Progress',
        badgeColor: 'text-[#53D4F4] bg-[#53D4F4]/15 border-[#53D4F4]/40',
        text: intuitionMode
          ? `Accuracy is ${(accuracy * 100).toFixed(0)}%. The fence is turning toward the optimal gap.`
          : `Current accuracy ${(accuracy * 100).toFixed(0)}%. Gradient vector updating parameters.`,
      };
    }
    if (epoch > 80 && accuracy < 0.65) {
      return {
        badge: intuitionMode ? 'Stuck in Valley' : 'Slow Convergence',
        badgeColor: 'text-[#F7C76B] bg-[#F7C76B]/15 border-[#F7C76B]/40',
        text: intuitionMode
          ? 'The AI is struggling in flat terrain. Try clicking "Reset" or switch datasets.'
          : 'High condition number or plateau encountered. Try Adam optimizer or reset.',
      };
    }
    return {
      badge: intuitionMode ? 'Compass Active' : 'Training Active',
      badgeColor: 'text-[#53D4F4] bg-[#53D4F4]/15 border-[#53D4F4]/40',
      text: intuitionMode
        ? 'Neural knobs are continuously adjusting to lower the mistake score.'
        : 'Parameters updating iteratively along negative gradient direction.',
    };
  };

  const status = getTrainingStatus();

  return (
    <aside className="fixed left-3 top-16 bottom-6 z-30 w-[315px] sm:w-[345px] flex flex-col rounded-xl overflow-hidden border border-[#29374B] bg-[#111A2A]/95 backdrop-blur-md shadow-2xl text-[#F4F7FB] select-none">
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
            <span className="text-[10px] font-mono text-[#53D4F4]">
              {intuitionMode ? '💡 Physical Metaphors' : '∑ Formal Mathematics'}
            </span>
          </div>
        </div>

        <button
          onClick={onLaunchJudgeDemo}
          className="text-[10px] font-bold bg-[#53D4F4] text-[#0B1020] px-2.5 py-1 rounded-md hover:bg-[#68ddfc] transition-all flex items-center gap-1 shadow-sm active:scale-95"
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
          <span>{intuitionMode ? 'Teams' : 'Choose Data'}</span>
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
          <span>{intuitionMode ? 'Fence' : 'Train AI'}</span>
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
          <span>{intuitionMode ? '3 Pillars' : 'Understand'}</span>
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
                {intuitionMode ? 'Two Teams on a Field' : 'Select Classification Problem'}
              </h3>
              <p className="text-xs text-[#9DAFC3] mt-1 leading-relaxed">
                {intuitionMode
                  ? 'Choose a challenge for the AI. See how simple straight lines handle easy dots, while folding the sheet is required for the criss-cross pattern!'
                  : 'Select coordinate data distribution. Linearly separable clusters require no hidden layer, whereas XOR parity demands non-linear space folding.'}
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
                    <strong className="text-xs text-[#F4F7FB]">
                      {intuitionMode ? 'Two Separate Groups' : 'Linear Clusters'}
                    </strong>
                  </div>
                  {currentPreset === 'linear' && (
                    <CheckCircle2 className="w-4 h-4 text-[#53D4F4]" />
                  )}
                </div>
                <p className="text-[11px] text-[#9DAFC3] mt-2 leading-relaxed">
                  {intuitionMode
                    ? 'Two distinct clusters. A single straight dividing fence cleanly separates both teams.'
                    : 'Linearly separable in ℝ². Can be solved with zero hidden units via a single affine hyperplane.'}
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
                    <strong className="text-xs text-[#F4F7FB]">
                      {intuitionMode ? 'Criss-Cross Puzzle' : 'XOR Parity Pattern'}
                    </strong>
                  </div>
                  {currentPreset === 'xor' && (
                    <CheckCircle2 className="w-4 h-4 text-[#53D4F4]" />
                  )}
                </div>
                <p className="text-[11px] text-[#9DAFC3] mt-2 leading-relaxed">
                  {intuitionMode
                    ? 'Diagonal criss-cross! Impossible for a flat straight fence—the AI must fold the rubber sheet like origami to separate them!'
                    : 'Linearly inseparable (Minsky & Papert, 1969). Requires Cover\'s theorem space-folding via non-linear ReLU.'}
                </p>
              </button>
            </div>

            {/* Class Color Legend Box */}
            <div className="p-3 rounded-lg bg-[#0B1020] border border-[#29374B] text-xs space-y-2">
              <span className="text-[10px] font-mono text-[#9DAFC3] uppercase tracking-wider block">
                {intuitionMode ? 'Two Teams on the Field' : 'Target Classes to Separate'}
              </span>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-2 text-[#53D4F4]">
                  <span className="text-sm">●</span>
                  <span>{intuitionMode ? 'Team Cyan (Circles)' : 'Class 0 (Cyan Dots)'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#F078C5]">
                  <span className="text-sm">◆</span>
                  <span>{intuitionMode ? 'Team Pink (Diamonds)' : 'Class 1 (Pink Dots)'}</span>
                </div>
              </div>
              <p className="text-[10.5px] text-[#9DAFC3] leading-relaxed pt-1 border-t border-[#29374B]/50">
                {intuitionMode
                  ? 'Goal: The AI must draw a glowing Dividing Fence on the field that separates Team Cyan from Team Pink.'
                  : 'Goal: Optimize hyperplane w₂ᵀ σ(W₁x + b₁) + b₂ = 0 to minimize binary cross-entropy loss.'}
              </p>
            </div>

            {/* Next Step Action */}
            <button
              onClick={() => setActiveStep(2)}
              className="w-full py-2.5 rounded-lg bg-[#53D4F4] text-[#0B1020] font-semibold text-xs hover:bg-[#68ddfc] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{intuitionMode ? 'Proceed to Step 2: Build the Fence' : 'Proceed to Step 2: Train AI'}</span>
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
                {intuitionMode ? 'The Dividing Fence (Training)' : 'Train the Neural Network'}
              </h3>
              <p className="text-xs text-[#9DAFC3] mt-1 leading-relaxed">
                {intuitionMode
                  ? 'Watch the AI adjust its stretch & shift knobs in real time. The dividing fence will twist and snap into position!'
                  : 'Observe real-time gradient descent parameter updates. The decision boundary aligns with the empirical gap.'}
              </p>
            </div>

            {/* Primary Train AI Button */}
            <div className="space-y-2">
              <button
                onClick={onToggleTraining}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
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
                    <span>
                      {epoch === 0
                        ? (intuitionMode ? 'Train AI (Start Compass Nudges)' : 'Train AI (Start Learning)')
                        : 'Resume Training'}
                    </span>
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
                    <span>{intuitionMode ? 'Mistake Score' : 'Prediction Error'}</span>
                    <span title="Binary Cross-Entropy Loss: measures distance between AI predictions and true labels. Lower is better.">
                      <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                    </span>
                  </div>
                  <span className="text-base font-bold text-[#F078C5] tabular-nums block mt-0.5">
                    {loss.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-[#9DAFC3]">
                    {intuitionMode ? 'Lower = Better' : 'BCE Loss ℒ'}
                  </span>
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
                  <span className="text-[9px] text-[#9DAFC3]">
                    {intuitionMode ? 'Correct Dots' : 'Empirical Acc'}
                  </span>
                </div>
              </div>

              {/* Epoch Count */}
              <div className="flex items-center justify-between text-xs pt-1 text-[#9DAFC3]">
                <span>{intuitionMode ? 'Compass Rounds' : 'Training Rounds (Epochs)'}</span>
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
              <span>{intuitionMode ? 'Proceed to Step 3: The 3 Pillars' : 'Proceed to Step 3: Understand Learning'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================= STEP 3: THE 3 PILLARS (MATHX THEME 5) ================= */}
        {activeStep === 3 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#53D4F4] font-bold uppercase tracking-wider block">
                  MathX Theme 5
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#182438] text-[#A78BFA] border border-[#29374B]">
                  Explainable AI
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F4F7FB] mt-0.5">
                The 3 Pillars of AI Math
              </h3>
              <p className="text-xs text-[#9DAFC3] mt-1 leading-relaxed">
                How mathematics makes a neural network learn, explained through three physical metaphors:
              </p>
            </div>

            {/* PILLAR 1: Linear Algebra of Layers */}
            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#53D4F4]/20 border border-[#53D4F4]/40 flex items-center justify-center text-[#53D4F4] text-[10px] font-bold">
                    1
                  </div>
                  <strong className="text-xs text-[#53D4F4]">
                    {intuitionMode ? 'Pillar 1: The Rubber Sheet' : 'Pillar 1: Linear Algebra of Layers'}
                  </strong>
                </div>
                <span className="text-[9px] font-mono text-[#9DAFC3]">W₁x + b₁</span>
              </div>

              <p className="text-[11px] text-[#F4F7FB] leading-relaxed">
                Multiplying by <strong>Weights (W₁)</strong> stretches and rotates the 2D grid, <strong>Bias (b₁)</strong> slides it, and <strong>ReLU</strong> folds it like origami so tangled XOR dots can be separated with one straight cut!
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#29374B]/50 text-[10px] text-[#9DAFC3] font-mono">
                <span>Cover's Theorem</span>
                <span className="text-[#53D4F4]">Origami Space Fold</span>
              </div>
            </div>

            {/* PILLAR 2: Loss Surfaces */}
            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#F078C5]/20 border border-[#F078C5]/40 flex items-center justify-center text-[#F078C5] text-[10px] font-bold">
                    2
                  </div>
                  <strong className="text-xs text-[#F078C5]">
                    {intuitionMode ? 'Pillar 2: Mistake Valley' : 'Pillar 2: 3D Loss Landscapes'}
                  </strong>
                </div>
                <span className="text-[9px] font-mono text-[#9DAFC3]">ℒ(w₁₁, w₂₂)</span>
              </div>

              <p className="text-[11px] text-[#F4F7FB] leading-relaxed">
                The 3D surface is a landscape of every possible knob setting. High hills = bad guesses; the deep glowing valley bottom = 100% accuracy.
              </p>

              {/* 1-Click Action to Loss 3D View */}
              <button
                onClick={() => {
                  if (onNavigateView) {
                    onNavigateView('advanced', 'loss');
                  } else {
                    onOpenAdvancedLab();
                  }
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#182438] hover:bg-[#F078C5]/20 border border-[#F078C5]/40 text-[#F078C5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>Jump to 3D Mistake Valley (Loss 3D)</span>
              </button>
            </div>

            {/* PILLAR 3: Gradients & Backpropagation */}
            <div className="p-3 rounded-xl bg-[#0B1020] border border-[#29374B] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#F7C76B]/20 border border-[#F7C76B]/40 flex items-center justify-center text-[#F7C76B] text-[10px] font-bold">
                    3
                  </div>
                  <strong className="text-xs text-[#F7C76B]">
                    {intuitionMode ? 'Pillar 3: The Downhill Compass' : 'Pillar 3: Gradients & Backprop'}
                  </strong>
                </div>
                <span className="text-[9px] font-mono text-[#9DAFC3]">∇_W ℒ</span>
              </div>

              <p className="text-[11px] text-[#F4F7FB] leading-relaxed">
                Derivatives aren't scary—they simply tell each knob which way is "downhill" and how steep the slope is. Backprop passes this compass direction backward layer by layer.
              </p>

              {/* 1-Click Action to Gradient Flow Graph */}
              <button
                onClick={() => {
                  if (onNavigateView) {
                    onNavigateView('advanced', 'graph');
                  } else {
                    onOpenAdvancedLab();
                  }
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-[#182438] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#A78BFA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Watch Live Gradient Pulses (Flow)</span>
              </button>
            </div>

            {/* "Show the Math" Collapsible Option */}
            <div className="pt-1">
              <button
                onClick={() => setShowMathDetails(!showMathDetails)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[#182438] border border-[#29374B] text-xs font-mono text-[#9DAFC3] hover:text-[#F4F7FB] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#53D4F4]" />
                  <span>{showMathDetails ? 'Hide Formal Proofs' : 'Show the Underlying Math Proofs'}</span>
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
