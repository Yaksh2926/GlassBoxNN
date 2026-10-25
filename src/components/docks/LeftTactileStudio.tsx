import React, { useState } from 'react';
import {
  Matrix2x2,
  Vector2D,
  NetworkWeights,
  OptimizerConfig,
  Point2D,
  ActivationType,
} from '../../math/types';
import { DatasetPreset, Datasets } from '../../math/datasets';
import { ScrubbableNumber } from '../common/ScrubbableNumber';
import { NeuralEngine, createInitialOptimizerState, OptimizerState } from '../../math/neuralEngine';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Minimize2,
  Plus,
  Undo2,
  Layers,
  Settings2,
  Sliders,
} from 'lucide-react';

interface LeftTactileStudioProps {
  W1: Matrix2x2;
  b1: Vector2D;
  onChangeW1: (newW1: Matrix2x2) => void;
  onChangeB1: (newB1: Vector2D) => void;
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  dataset: Point2D[];
  activeClass: 0 | 1;
  onSetActiveClass: (cls: 0 | 1) => void;
  onUndoPoint: () => void;
  onClearDataset: () => void;
  weights: NetworkWeights;
  onUpdateWeights: (newWeights: NetworkWeights) => void;
  optConfig: OptimizerConfig;
  onChangeOptConfig: (cfg: OptimizerConfig) => void;
  onTriggerSingularMatrix: () => void;
  onTriggerDeadReLU: () => void;
  onOpenSingularProof: () => void;
  isSingularActive: boolean;
  isDeadReLUActive: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LeftTactileStudio: React.FC<LeftTactileStudioProps> = ({
  W1,
  b1,
  onChangeW1,
  onChangeB1,
  currentPreset,
  onSelectPreset,
  dataset,
  activeClass,
  onSetActiveClass,
  onUndoPoint,
  onClearDataset,
  weights,
  onUpdateWeights,
  optConfig,
  onChangeOptConfig,
  onTriggerSingularMatrix,
  onTriggerDeadReLU,
  onOpenSingularProof,
  isSingularActive,
  isDeadReLUActive,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const optStateRef = React.useRef<OptimizerState>(createInitialOptimizerState());

  const collapsed = isCollapsed || internalCollapsed;

  // Compute live forward metrics
  const currentLoss = dataset.length > 0 ? NeuralEngine.computeLoss(dataset, weights) : 0;
  const currentAcc = dataset.length > 0 ? NeuralEngine.computeAccuracy(dataset, weights) : 0;

  // Single optimization step
  const executeStep = React.useCallback(() => {
    if (dataset.length === 0) return;
    const currentGrads = NeuralEngine.computeGradients(dataset, weights);
    const { updatedWeights, updatedState } = NeuralEngine.applyOptimizerStep(
      weights,
      currentGrads,
      optStateRef.current,
      optConfig
    );
    optStateRef.current = updatedState;
    onUpdateWeights(updatedWeights);
    setEpoch(e => e + 1);
  }, [dataset, weights, optConfig, onUpdateWeights]);

  // Real continuous training loop
  React.useEffect(() => {
    if (!isTraining) return;

    let animId: number;
    let lastTime = performance.now();

    const trainLoop = (now: number) => {
      if (now - lastTime >= 40) {
        lastTime = now;
        executeStep();
      }
      animId = requestAnimationFrame(trainLoop);
    };

    animId = requestAnimationFrame(trainLoop);
    return () => cancelAnimationFrame(animId);
  }, [isTraining, executeStep]);

  const handleStepOnce = () => {
    executeStep();
  };

  const handleResetWeights = () => {
    setIsTraining(false);
    setEpoch(0);
    onUpdateWeights({
      W1: [[1.0, 0.0], [0.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    });
  };

  const updateW1 = (row: 0 | 1, col: 0 | 1, val: number) => {
    const updated: Matrix2x2 = [
      [W1[0][0], W1[0][1]],
      [W1[1][0], W1[1][1]],
    ];
    updated[row][col] = val;
    onChangeW1(updated);
  };

  const updateB1 = (idx: 0 | 1, val: number) => {
    const updated: Vector2D = [b1[0], b1[1]];
    updated[idx] = val;
    onChangeB1(updated);
  };

  return (
    <aside
      className={`fixed left-3 top-16 bottom-20 z-30 flex transition-all duration-300 ease-out select-none ${
        collapsed ? '-translate-x-[calc(100%-12px)]' : 'translate-x-0'
      }`}
    >
      <div className="w-[260px] h-full flex flex-col rounded-xl overflow-hidden border border-[#29374B] bg-[#111A2A]/95 backdrop-blur-md shadow-xl text-[#F4F7FB]">
        {/* Panel Header */}
        <div className="px-3.5 py-2.5 border-b border-[#29374B] flex items-center justify-between bg-[#0B1020]/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#53D4F4]" />
            <span className="text-xs font-semibold tracking-wide text-[#F4F7FB]">
              LAB CONTROLS
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#9DAFC3]">
            {dataset.length} pts
          </span>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
          {/* SECTION A: DATASET */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DAFC3] font-semibold">
                A. Dataset
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#53D4F4]">
                  <span>●</span> C0
                </span>
                <span className="flex items-center gap-1 text-[#F078C5]">
                  <span>◆</span> C1
                </span>
              </div>
            </div>

            {/* Dataset Preset Buttons */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => onSelectPreset('xor')}
                className={`py-1.5 px-2 rounded-lg border transition-all flex items-center justify-between ${
                  currentPreset === 'xor'
                    ? 'bg-[#182438] border-[#53D4F4] text-[#F4F7FB] font-semibold'
                    : 'bg-[#111A2A] border-[#29374B] text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
              >
                <span>XOR</span>
                <span className="text-[9px] text-[#53D4F4]">Non-linear</span>
              </button>

              <button
                onClick={() => onSelectPreset('circles')}
                className={`py-1.5 px-2 rounded-lg border transition-all flex items-center justify-between ${
                  currentPreset === 'circles'
                    ? 'bg-[#182438] border-[#53D4F4] text-[#F4F7FB] font-semibold'
                    : 'bg-[#111A2A] border-[#29374B] text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
              >
                <span>Rings</span>
                <span className="text-[9px] text-[#F078C5]">Radial</span>
              </button>

              <button
                onClick={() => onSelectPreset('moons')}
                className={`py-1.5 px-2 rounded-lg border transition-all flex items-center justify-between ${
                  currentPreset === 'moons'
                    ? 'bg-[#182438] border-[#53D4F4] text-[#F4F7FB] font-semibold'
                    : 'bg-[#111A2A] border-[#29374B] text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
              >
                <span>Moons</span>
                <span className="text-[9px] text-[#53D4F4]">Curved</span>
              </button>

              <button
                onClick={() => onSelectPreset('linear')}
                className={`py-1.5 px-2 rounded-lg border transition-all flex items-center justify-between ${
                  currentPreset === 'linear'
                    ? 'bg-[#182438] border-[#53D4F4] text-[#F4F7FB] font-semibold'
                    : 'bg-[#111A2A] border-[#29374B] text-[#9DAFC3] hover:text-[#F4F7FB]'
                }`}
              >
                <span>Linear</span>
                <span className="text-[9px] text-[#9DAFC3]">Separable</span>
              </button>
            </div>

            {/* Click-to-add Class Selector & Undo */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
              <span className="text-[#9DAFC3]">Drop on canvas:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetActiveClass(0)}
                  className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all ${
                    activeClass === 0
                      ? 'border-[#53D4F4] bg-[#53D4F4]/15 text-[#53D4F4] font-bold'
                      : 'border-[#29374B] text-[#9DAFC3]'
                  }`}
                  title="Drop Class 0 (Cyan Circle)"
                >
                  <span>●</span> 0
                </button>
                <button
                  onClick={() => onSetActiveClass(1)}
                  className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all ${
                    activeClass === 1
                      ? 'border-[#F078C5] bg-[#F078C5]/15 text-[#F078C5] font-bold'
                      : 'border-[#29374B] text-[#9DAFC3]'
                  }`}
                  title="Drop Class 1 (Pink Diamond)"
                >
                  <span>◆</span> 1
                </button>
                <button
                  onClick={onUndoPoint}
                  className="px-1.5 py-0.5 rounded border border-[#29374B] bg-[#182438] text-[#9DAFC3] hover:text-[#F4F7FB]"
                  title="Undo last point"
                >
                  <Undo2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SECTION B: NETWORK CONFIGURATION */}
          <div className="space-y-2 pt-2 border-t border-[#29374B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DAFC3] font-semibold">
                B. Network (2-2-1)
              </span>
              <span className="text-[9px] font-mono text-[#53D4F4]">
                σ: {weights.activation.toUpperCase()}
              </span>
            </div>

            {/* Activation Picker */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
              {(['relu', 'sigmoid', 'tanh', 'leaky_relu'] as ActivationType[]).map(act => (
                <button
                  key={act}
                  onClick={() => onUpdateWeights({ ...weights, activation: act })}
                  className={`py-1 rounded border transition-all text-center uppercase ${
                    weights.activation === act
                      ? 'border-[#53D4F4] bg-[#182438] text-[#53D4F4] font-bold'
                      : 'border-[#29374B] bg-[#111A2A] text-[#9DAFC3] hover:text-[#F4F7FB]'
                  }`}
                >
                  {act === 'leaky_relu' ? 'LReLU' : act}
                </button>
              ))}
            </div>

            {/* Layer 1 Matrix W1 Brackets */}
            <div className="p-2 rounded-lg bg-[#0B1020] border border-[#29374B] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9DAFC3]">
                <span>Matrix W₁ (Affine Map)</span>
                <span className="text-[9px] text-[#53D4F4]">Scrubbable</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                <ScrubbableNumber
                  label="w₁₁"
                  value={W1[0][0]}
                  onChange={v => updateW1(0, 0, v)}
                  color="cyan"
                />
                <ScrubbableNumber
                  label="w₁₂"
                  value={W1[0][1]}
                  onChange={v => updateW1(0, 1, v)}
                  color="cyan"
                />
                <ScrubbableNumber
                  label="w₂₁"
                  value={W1[1][0]}
                  onChange={v => updateW1(1, 0, v)}
                  color="cyan"
                />
                <ScrubbableNumber
                  label="w₂₂"
                  value={W1[1][1]}
                  onChange={v => updateW1(1, 1, v)}
                  color="cyan"
                />
              </div>

              {/* Biases b1 */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#29374B]/50">
                <ScrubbableNumber
                  label="b₁"
                  value={b1[0]}
                  onChange={v => updateB1(0, v)}
                  color="amber"
                />
                <ScrubbableNumber
                  label="b₂"
                  value={b1[1]}
                  onChange={v => updateB1(1, v)}
                  color="amber"
                />
              </div>
            </div>

            {/* Failure Mode Quick Injections */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={onTriggerSingularMatrix}
                className={`p-1.5 rounded-lg border text-left font-mono transition-all flex flex-col ${
                  isSingularActive
                    ? 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] font-bold shadow-sm'
                    : 'border-[#29374B] bg-[#182438] text-[#9DAFC3] hover:text-[#EF4444]'
                }`}
                title="Trigger Singular Matrix det(W1) = 0"
              >
                <span className="text-[10px] font-bold flex items-center gap-1">
                  <Minimize2 className="w-2.5 h-2.5" /> det = 0
                </span>
                <span className="text-[8px] opacity-80">Rank Collapse</span>
              </button>

              <button
                onClick={onTriggerDeadReLU}
                className={`p-1.5 rounded-lg border text-left font-mono transition-all flex flex-col ${
                  isDeadReLUActive
                    ? 'border-[#F7C76B] bg-[#F7C76B]/15 text-[#F7C76B] font-bold shadow-sm'
                    : 'border-[#29374B] bg-[#182438] text-[#9DAFC3] hover:text-[#F7C76B]'
                }`}
                title="Trigger Dead ReLU extinction"
              >
                <span className="text-[10px] font-bold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Dead ReLU
                </span>
                <span className="text-[8px] opacity-80">∇ = 0 Freeze</span>
              </button>
            </div>
          </div>

          {/* SECTION C: TRAINING */}
          <div className="space-y-2 pt-2 border-t border-[#29374B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DAFC3] font-semibold">
                C. Training
              </span>
              <span className="text-[10px] font-mono text-[#9DAFC3]">
                Epoch: <strong className="text-[#F4F7FB]">{epoch}</strong>
              </span>
            </div>

            {/* Loss & Accuracy Pill */}
            <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-[#0B1020] border border-[#29374B] font-mono text-[10px]">
              <div>
                <span className="text-[#9DAFC3] block">BCE Loss</span>
                <span className="text-xs font-bold text-[#F078C5] tabular-nums">
                  {currentLoss.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[#9DAFC3] block">Accuracy</span>
                <span className="text-xs font-bold text-[#53D4F4] tabular-nums">
                  {(currentAcc * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Optimizer Switcher */}
            <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
              {(['sgd', 'momentum', 'adam'] as const).map(opt => (
                <button
                  key={opt}
                  onClick={() => onChangeOptConfig({ ...optConfig, type: opt })}
                  className={`py-1 rounded border transition-all text-center uppercase ${
                    optConfig.type === opt
                      ? 'border-[#53D4F4] bg-[#182438] text-[#53D4F4] font-bold'
                      : 'border-[#29374B] bg-[#111A2A] text-[#9DAFC3] hover:text-[#F4F7FB]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Learning Rate Slider */}
            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex justify-between text-[#9DAFC3]">
                <span>Learning Rate (η)</span>
                <span className="text-[#F4F7FB]">{optConfig.learningRate.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={optConfig.learningRate}
                onChange={e =>
                  onChangeOptConfig({ ...optConfig, learningRate: parseFloat(e.target.value) })
                }
                className="w-full h-1 bg-[#182438] rounded-lg appearance-none cursor-pointer accent-[#53D4F4]"
              />
            </div>

            {/* Training Action Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setIsTraining(!isTraining)}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isTraining
                    ? 'bg-[#F7C76B] text-[#0B1020] hover:bg-[#ebd07a]'
                    : 'bg-[#53D4F4] text-[#0B1020] hover:bg-[#68ddfc]'
                }`}
              >
                {isTraining ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTraining ? 'Pause' : 'Train Loop'}</span>
              </button>

              <button
                onClick={handleStepOnce}
                disabled={isTraining}
                className="py-1.5 px-2.5 rounded-lg border border-[#29374B] bg-[#182438] hover:bg-[#20304A] text-[#F4F7FB] text-xs font-mono disabled:opacity-50"
                title="Single step"
              >
                Step
              </button>

              <button
                onClick={handleResetWeights}
                className="p-1.5 rounded-lg border border-[#29374B] bg-[#182438] hover:bg-[#20304A] text-[#9DAFC3] hover:text-[#EF4444]"
                title="Reset weights"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse Handle */}
      <button
        onClick={() => {
          if (onToggleCollapse) onToggleCollapse();
          else setInternalCollapsed(!internalCollapsed);
        }}
        className="self-center ml-0.5 w-4 h-10 rounded-r-md border border-l-0 border-[#29374B] bg-[#111A2A] hover:bg-[#182438] text-[#9DAFC3] hover:text-[#F4F7FB] flex items-center justify-center transition-colors shadow-md"
        title={collapsed ? 'Expand Controls' : 'Collapse Controls'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};
