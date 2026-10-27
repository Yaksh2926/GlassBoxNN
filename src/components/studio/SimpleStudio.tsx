import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  Maximize2,
  Zap,
  Undo2,
  Trash2,
  TrendingDown,
  Brain,
  HelpCircle,
  Mountain,
} from 'lucide-react';
import { Point2D, NetworkWeights, Matrix2x2, Vector2D } from '../../math/types';
import { DatasetPreset } from '../../math/datasets';
import { LinearAlgebra } from '../../math/linearAlgebra';

interface SimpleStudioProps {
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  dataset: Point2D[];
  activeClass: 0 | 1;
  onSetActiveClass: (cls: 0 | 1) => void;
  onUndoPoint: () => void;
  onClearDataset: () => void;
  weights: NetworkWeights;
  onChangeW1: (newW1: Matrix2x2) => void;
  onChangeB1: (newB1: Vector2D) => void;
  isTraining: boolean;
  onToggleTraining: () => void;
  onStepOnce: () => void;
  onResetModel: () => void;
  epoch: number;
  loss: number;
  accuracy: number;
  tau: number;
  onChangeTau: (updater: number | ((prevTau: number) => number)) => void;
  onTriggerSingularMatrix: () => void;
  onTriggerDeadReLU: () => void;
  isSingularActive: boolean;
  isDeadReLUActive: boolean;
  intuitionMode: boolean;
  onLaunchJudgeDemo: () => void;
  viewMode?: 'geometry' | 'loss';
  onToggleViewMode?: () => void;
}

export const SimpleStudio: React.FC<SimpleStudioProps> = ({
  currentPreset,
  onSelectPreset,
  dataset,
  activeClass,
  onSetActiveClass,
  onUndoPoint,
  onClearDataset,
  weights,
  onChangeW1,
  onChangeB1,
  isTraining,
  onToggleTraining,
  onStepOnce,
  onResetModel,
  epoch,
  loss,
  accuracy,
  tau,
  onChangeTau,
  onTriggerSingularMatrix,
  onTriggerDeadReLU,
  isSingularActive,
  isDeadReLUActive,
  intuitionMode,
  onLaunchJudgeDemo,
  viewMode = 'geometry',
  onToggleViewMode,
}) => {
  // Update diagonal matrix stretch weights
  const handleW11Change = (val: number) => {
    onChangeW1([
      [val, weights.W1[0][1]],
      [weights.W1[1][0], weights.W1[1][1]],
    ]);
  };

  const handleW22Change = (val: number) => {
    onChangeW1([
      [weights.W1[0][0], weights.W1[0][1]],
      [weights.W1[1][0], val],
    ]);
  };

  const det = LinearAlgebra.det(weights.W1);

  return (
    <div className="fixed top-16 left-4 bottom-4 w-[360px] max-w-[calc(100vw-2rem)] z-30 flex flex-col rounded-2xl border border-[#29374B] bg-[#111A2A]/92 backdrop-blur-xl shadow-2xl overflow-hidden text-[#F4F7FB] transition-all">
      {/* Studio Header */}
      <div className="px-4 py-3 border-b border-[#29374B] bg-[#0B1020]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#53D4F4]/20 to-[#8B5CF6]/20 border border-[#53D4F4]/40 flex items-center justify-center text-[#53D4F4]">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#F4F7FB] tracking-tight uppercase flex items-center gap-1.5 font-mono">
              {intuitionMode ? 'Tactile AI Studio' : 'Neural Control Deck'}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#53D4F4]/15 text-[#53D4F4] border border-[#53D4F4]/30 font-normal">
                Live
              </span>
            </h2>
            <p className="text-[10px] text-[#9DAFC3]">
              {intuitionMode
                ? 'Select a dataset & watch the AI learn'
                : 'Linear affine & backprop optimization'}
            </p>
          </div>
        </div>

        <button
          onClick={onLaunchJudgeDemo}
          className="px-2.5 py-1 rounded-lg bg-[#53D4F4] hover:bg-[#68ddfc] text-[#0B1020] font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm active:scale-95"
          title="Launch 6-Step Presentation Demo"
        >
          <Sparkles className="w-3 h-3" />
          <span>Demo</span>
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= SECTION 1: DATASET CHOICE ================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>1.</span>
              <span>{intuitionMode ? 'Choose Two Teams' : 'Dataset Distribution'}</span>
            </span>
            <span className="text-[10px] text-[#9DAFC3] font-mono">
              {dataset.length} points
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Easy Dataset Card */}
            <button
              onClick={() => onSelectPreset('linear')}
              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                currentPreset === 'linear'
                  ? 'bg-gradient-to-br from-[#10B981]/20 to-[#53D4F4]/10 border-[#10B981] shadow-sm ring-1 ring-[#10B981]/40'
                  : 'bg-[#0B1020] border-[#29374B] hover:border-[#53D4F4]/40 text-[#9DAFC3]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">🟢</span>
                <strong className="text-xs font-bold text-[#F4F7FB] block">
                  {intuitionMode ? 'Easy Team' : 'Linear (Easy)'}
                </strong>
              </div>
              <p className="text-[10px] text-[#9DAFC3] leading-tight">
                {intuitionMode ? 'Clean straight gap between dots' : 'Linearly separable clusters'}
              </p>
            </button>

            {/* Challenge Dataset Card */}
            <button
              onClick={() => onSelectPreset('xor')}
              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                currentPreset === 'xor'
                  ? 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#F078C5]/10 border-[#8B5CF6] shadow-sm ring-1 ring-[#8B5CF6]/40'
                  : 'bg-[#0B1020] border-[#29374B] hover:border-[#8B5CF6]/40 text-[#9DAFC3]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">🟣</span>
                <strong className="text-xs font-bold text-[#F4F7FB] block">
                  {intuitionMode ? 'Challenge (XOR)' : 'XOR (Folded)'}
                </strong>
              </div>
              <p className="text-[10px] text-[#9DAFC3] leading-tight">
                {intuitionMode ? 'Requires origami fold to separate' : "Cover's Theorem benchmark"}
              </p>
            </button>
          </div>

          {/* Quick Point Tool Bar */}
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#0B1020] border border-[#29374B] text-[10px]">
            <div className="flex items-center gap-1">
              <span className="text-[#9DAFC3] text-[9px] mr-1">Click to add:</span>
              <button
                onClick={() => onSetActiveClass(0)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  activeClass === 0
                    ? 'bg-[#53D4F4]/25 text-[#53D4F4] border border-[#53D4F4]/50'
                    : 'text-[#9DAFC3] hover:text-[#53D4F4]'
                }`}
              >
                <span>●</span>
                <span>Team A</span>
              </button>
              <button
                onClick={() => onSetActiveClass(1)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                  activeClass === 1
                    ? 'bg-[#F078C5]/25 text-[#F078C5] border border-[#F078C5]/50'
                    : 'text-[#9DAFC3] hover:text-[#F078C5]'
                }`}
              >
                <span>◆</span>
                <span>Team B</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onUndoPoint}
                className="p-1 text-[#9DAFC3] hover:text-[#F4F7FB] rounded hover:bg-[#182438]"
                title="Undo last added point"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearDataset}
                className="p-1 text-[#9DAFC3] hover:text-[#EF4444] rounded hover:bg-[#182438]"
                title="Clear all points"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: LIVE AI TRAINING ENGINE ================= */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-[#0B1020] border border-[#29374B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>2.</span>
              <span>{intuitionMode ? 'Train The Dividing Fence' : 'Optimization Engine'}</span>
            </span>
            <span className="text-[10px] font-mono text-[#F7C76B]">
              Epoch {epoch}
            </span>
          </div>

          {/* Primary Action Button (Big Glowing Button) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTraining}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${
                isTraining
                  ? 'bg-gradient-to-r from-[#F7C76B] to-[#F59E0B] text-[#0B1020] hover:brightness-110 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-[#53D4F4] to-[#38BDF8] text-[#0B1020] hover:brightness-110 shadow-cyan-500/25 ring-2 ring-[#53D4F4]/30 animate-pulse'
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
                  <span>{epoch === 0 ? '▶ Start AI Learning' : '▶ Resume Learning'}</span>
                </>
              )}
            </button>

            <button
              onClick={onStepOnce}
              className="py-3 px-3 rounded-xl border border-[#29374B] bg-[#182438] hover:bg-[#1E2D4A] hover:border-[#53D4F4]/40 text-[#F4F7FB] text-xs font-bold font-mono transition-all active:scale-95 flex items-center gap-1"
              title="Step exactly 1 training epoch"
            >
              <span>+1</span>
            </button>

            <button
              onClick={onResetModel}
              className="p-3 rounded-xl border border-[#29374B] bg-[#182438] hover:bg-[#1E2D4A] text-[#9DAFC3] hover:text-[#EF4444] transition-all active:scale-95"
              title="Reset weights"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Live Scoreboard */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Mistake Score (BCE Loss) */}
            <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
              <span className="text-[10px] text-[#9DAFC3] font-mono block">
                {intuitionMode ? 'Mistake Score' : 'BCE Loss (ℒ)'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-bold font-mono text-[#F7C76B] tabular-nums">
                  {loss.toFixed(3)}
                </span>
                <span className="text-[9px] text-[#9DAFC3]">
                  {loss < 0.1 ? 'Excellent' : loss < 0.4 ? 'Improving' : 'High'}
                </span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="p-2.5 rounded-lg bg-[#111A2A] border border-[#29374B]">
              <span className="text-[10px] text-[#9DAFC3] font-mono block">
                {intuitionMode ? 'Accuracy' : 'Empirical Accuracy'}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-base font-bold font-mono tabular-nums ${
                    accuracy >= 0.98 ? 'text-[#10B981]' : 'text-[#53D4F4]'
                  }`}
                >
                  {(accuracy * 100).toFixed(1)}%
                </span>
                {accuracy >= 0.98 && (
                  <span className="text-[9px] text-[#10B981] font-bold">100%!</span>
                )}
              </div>
            </div>
          </div>

          {/* Convergence Status */}
          {accuracy >= 0.98 ? (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>🎉 Solved! The fence cleanly separates both teams.</span>
            </div>
          ) : (
            <p className="text-[10px] text-[#9DAFC3] leading-tight pt-1">
              {isTraining
                ? 'Gradients are updating weights to push the fence downhill into the low-mistake gap.'
                : 'Click Start AI Learning to watch gradient descent compute exact calculus updates live.'}
            </p>
          )}

          {/* 3D Mistake Valley Jump Button */}
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
                viewMode === 'loss'
                  ? 'bg-gradient-to-r from-[#F078C5]/25 to-[#8B5CF6]/25 border-[#F078C5] text-[#F078C5]'
                  : 'bg-[#182438] hover:bg-[#F078C5]/15 border-[#29374B] hover:border-[#F078C5]/50 text-[#F4F7FB]'
              }`}
            >
              <Mountain className="w-4 h-4 text-[#F078C5]" />
              <span>
                {viewMode === 'geometry'
                  ? (intuitionMode ? '🏔️ View 3D Mistake Valley (Loss 3D)' : '🏔️ Switch to 3D Loss Surface')
                  : (intuitionMode ? '📐 Return to 2D Dividing Fence' : '📐 Return to 2D Geometry Grid')}
              </span>
            </button>
          )}
        </div>

        {/* ================= SECTION 3: TACTILE METAPHOR SLIDERS ================= */}
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0B1020] border border-[#29374B]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#F4F7FB] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>3.</span>
              <span>{intuitionMode ? 'Origami Fold & Grid Stretch' : 'Continuous Homotopy & Weights'}</span>
            </span>
            <span className="text-[9px] font-mono text-[#53D4F4]">
              {intuitionMode ? 'Cover’s Theorem' : 'W₁x + b₁'}
            </span>
          </div>

          {/* Slider 1: Origami Paper Fold (tau) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A78BFA] font-semibold flex items-center gap-1">
                <span>📐</span>
                <span>{intuitionMode ? 'Origami Space Fold' : 'Activation Crease (τ)'}</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#A78BFA]">
                {tau.toFixed(2)} / 2.0
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={tau}
              onChange={e => onChangeTau(parseFloat(e.target.value))}
              className="w-full accent-[#8B5CF6] cursor-pointer h-1.5 bg-[#182438] rounded-lg"
            />

            <div className="flex justify-between text-[9px] font-mono text-[#9DAFC3]">
              <span>Flat 2D (0.0)</span>
              <span>Folded Space (2.0)</span>
            </div>
          </div>

          {/* Sliders 2 & 3: Grid Stretch Knobs (W11 and W22) */}
          <div className="pt-2 border-t border-[#29374B]/60 space-y-2">
            <span className="text-[10px] font-mono text-[#9DAFC3] block">
              {intuitionMode ? 'Manual Rubber Sheet Stretch Knobs:' : 'Affine Matrix Parameters:'}
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-[#111A2A] border border-[#29374B] space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#53D4F4]">w₁₁ (X Stretch)</span>
                  <span className="font-bold">{weights.W1[0][0].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={weights.W1[0][0]}
                  onChange={e => handleW11Change(parseFloat(e.target.value))}
                  className="w-full accent-[#53D4F4] cursor-pointer h-1 bg-[#182438] rounded-lg"
                />
              </div>

              <div className="p-2 rounded bg-[#111A2A] border border-[#29374B] space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-[#F078C5]">w₂₂ (Y Stretch)</span>
                  <span className="font-bold">{weights.W1[1][1].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.5"
                  max="2.5"
                  step="0.1"
                  value={weights.W1[1][1]}
                  onChange={e => handleW22Change(parseFloat(e.target.value))}
                  className="w-full accent-[#F078C5] cursor-pointer h-1 bg-[#182438] rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-[#9DAFC3] pt-0.5">
              <span>Area Scale: <strong className="text-[#53D4F4]">{Math.abs(det).toFixed(2)}x</strong></span>
              <span>Orient: <strong className={det < 0 ? 'text-[#F078C5]' : 'text-[#10B981]'}>{det < 0 ? 'Flipped' : 'Normal'}</strong></span>
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: FAILURE STRESS-TESTS ================= */}
        <div className="space-y-2 p-3 rounded-xl bg-[#0B1020] border border-[#29374B]">
          <span className="text-[10px] font-bold text-[#F4F7FB] uppercase tracking-wider font-mono block">
            {intuitionMode ? 'Mathematical Stress-Tests (Why AI Breaks)' : 'Singular Matrix & Vanishing Gradients'}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Squash Space Button */}
            <button
              onClick={onTriggerSingularMatrix}
              className={`p-2 rounded-lg border text-left transition-all ${
                isSingularActive
                  ? 'bg-rose-950/60 border-rose-500 shadow-sm'
                  : 'bg-[#111A2A] border-[#29374B] hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-300 font-mono">
                <span>💥</span>
                <span>Squash (det=0)</span>
              </div>
              <p className="text-[9px] text-[#9DAFC3] mt-0.5 leading-tight">
                {intuitionMode ? 'Flatten 2D to 1D line' : 'Rank-Nullity collapse'}
              </p>
            </button>

            {/* Dead ReLU Freeze */}
            <button
              onClick={onTriggerDeadReLU}
              className={`p-2 rounded-lg border text-left transition-all ${
                isDeadReLUActive
                  ? 'bg-amber-950/60 border-amber-500 shadow-sm'
                  : 'bg-[#111A2A] border-[#29374B] hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 font-mono">
                <span>🥶</span>
                <span>Freeze (Dead ReLU)</span>
              </div>
              <p className="text-[9px] text-[#9DAFC3] mt-0.5 leading-tight">
                {intuitionMode ? 'Zero gradient flat ground' : '∇_W ℒ = 0 attractor'}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
