import React, { useState } from 'react';
import {
  Matrix2x2,
  Vector2D,
  NetworkWeights,
  OptimizerConfig,
  Point2D,
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
  AlertOctagon,
  FileText,
  Activity,
  Layers,
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
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const optStateRef = React.useRef<OptimizerState>(createInitialOptimizerState());

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

  // Matrix cell update helpers
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
      className={`fixed left-4 top-20 bottom-24 z-30 flex transition-all duration-300 ease-out select-none ${
        isCollapsed ? '-translate-x-[calc(100%-16px)]' : 'translate-x-0'
      }`}
    >
      <div className="w-80 h-full flex flex-col glass-hud rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        {/* Dock Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan shadow-cyan-glow" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase">
              01 // OPERATOR & DATASET
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">TACTILE STUDIO</span>
        </div>

        {/* Scrollable controls container */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* SECTION 1: INTERACTIVE SCRUBBABLE MATRIX BRACKETS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
                AFFINE MAP [ W₁x + b₁ ]
              </span>
              <span className="text-[9px] font-mono text-slate-500">Drag to scrub</span>
            </div>

            {/* Matrix & Bias Layout with tall brackets */}
            <div className="grid grid-cols-12 gap-1.5 items-center p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
              {/* W1 Matrix with tall square brackets */}
              <div className="col-span-8 relative py-0.5 px-2">
                {/* Left bracket line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 border-l-2 border-t-2 border-b-2 border-cyber-cyan/70 rounded-l-sm pointer-events-none" />
                {/* Right bracket line */}
                <div className="absolute right-0 top-0 bottom-0 w-1.5 border-r-2 border-t-2 border-b-2 border-cyber-cyan/70 rounded-r-sm pointer-events-none" />

                <div className="grid grid-cols-2 gap-1.5">
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
              </div>

              {/* Plus sign */}
              <div className="col-span-1 text-center font-mono font-bold text-slate-500 text-xs select-none">
                +
              </div>

              {/* Bias Vector b1 with tall square brackets */}
              <div className="col-span-3 relative py-0.5 px-1.5">
                <div className="absolute left-0 top-0 bottom-0 w-1 border-l-2 border-t-2 border-b-2 border-cyber-amber/70 rounded-l-sm pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-1 border-r-2 border-t-2 border-b-2 border-cyber-amber/70 rounded-r-sm pointer-events-none" />

                <div className="flex flex-col gap-1.5">
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
            </div>

            {/* Transform Preset Micro-Buttons */}
            <div className="grid grid-cols-5 gap-1 font-mono text-[9px]">
              <button
                onClick={() => {
                  onChangeW1([[1.0, 0.0], [0.0, 1.0]]);
                  onChangeB1([0.0, 0.0]);
                }}
                className="py-1 px-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] hover:border-cyber-cyan/50 transition-colors text-center"
                title="Identity (I): No distortion"
              >
                I
              </button>
              <button
                onClick={() => {
                  const c = Math.cos(Math.PI / 4);
                  const s = Math.sin(Math.PI / 4);
                  onChangeW1([[parseFloat(c.toFixed(2)), parseFloat((-s).toFixed(2))], [parseFloat(s.toFixed(2)), parseFloat(c.toFixed(2))]]);
                }}
                className="py-1 px-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] hover:border-cyber-cyan/50 transition-colors text-center"
                title="45° Rotation"
              >
                45° Rot
              </button>
              <button
                onClick={() => onChangeW1([[1.0, 1.2], [0.0, 1.0]])}
                className="py-1 px-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] hover:border-cyber-cyan/50 transition-colors text-center"
                title="Shear Transformation"
              >
                Shear
              </button>
              <button
                onClick={() => onChangeW1([[-1.0, 0.0], [0.0, 1.0]])}
                className="py-1 px-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] hover:border-cyber-cyan/50 transition-colors text-center"
                title="Reflection"
              >
                Reflect
              </button>
              <button
                onClick={() => onChangeW1([[1.4, 0.0], [0.0, 1.4]])}
                className="py-1 px-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] hover:border-cyber-cyan/50 transition-colors text-center"
                title="Uniform Scaling"
              >
                Scale
              </button>
            </div>
          </div>

          {/* SECTION 2: 1-CLICK STRESS TEST TRIGGERS (HARDWARE BUTTONS) */}
          <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold block">
              STRESS TEST TRIGGERS
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onTriggerSingularMatrix}
                className={`p-2 rounded-xl border text-left font-mono transition-all flex flex-col gap-0.5 relative overflow-hidden ${
                  isSingularActive
                    ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950/60 text-white'
                    : 'bg-[#121622] border-white/[0.08] hover:border-rose-500/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Minimize2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="text-[10px] font-bold text-rose-300 truncate">
                    det(W₁) = 0
                  </span>
                </div>
                <span className="text-[8.5px] text-slate-400 font-sans leading-tight">
                  Singular Grid Collapse
                </span>
                {isSingularActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              <button
                onClick={onTriggerDeadReLU}
                className={`p-2 rounded-xl border text-left font-mono transition-all flex flex-col gap-0.5 relative overflow-hidden ${
                  isDeadReLUActive
                    ? 'bg-amber-950/60 border-amber-500 shadow-md shadow-amber-950/60 text-white'
                    : 'bg-[#121622] border-white/[0.08] hover:border-amber-500/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-300 truncate">
                    Dead ReLU Trap
                  </span>
                </div>
                <span className="text-[8.5px] text-slate-400 font-sans leading-tight">
                  Zero Gradient ∇=0
                </span>
                {isDeadReLUActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>
            </div>
          </div>

          {/* SECTION 3: COMPACT DATASET PILL SELECTOR WITH MINI SVG ICONS */}
          <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
                DATASET DISTRIBUTION
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {dataset.length} points
              </span>
            </div>

            {/* 2x2 Grid with miniature SVG dot preview icons */}
            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {/* XOR Pill */}
              <button
                onClick={() => onSelectPreset('xor')}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                  currentPreset === 'xor'
                    ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-cyan-glow'
                    : 'bg-[#10141F] border-white/[0.07] hover:border-white/20 text-slate-300'
                }`}
              >
                {/* Mini SVG: 4 dots XOR */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <circle cx="6" cy="6" r="3" fill="#00F5D4" />
                  <circle cx="18" cy="6" r="3" fill="#FF2A85" />
                  <circle cx="6" cy="18" r="3" fill="#FF2A85" />
                  <circle cx="18" cy="18" r="3" fill="#00F5D4" />
                </svg>
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-tight">XOR</div>
                  <div className="text-[8.5px] text-slate-400 font-sans">Non-linear</div>
                </div>
              </button>

              {/* Rings Pill */}
              <button
                onClick={() => onSelectPreset('circles')}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                  currentPreset === 'circles'
                    ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-cyan-glow'
                    : 'bg-[#10141F] border-white/[0.07] hover:border-white/20 text-slate-300'
                }`}
              >
                {/* Mini SVG: Concentric Circles */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <circle cx="12" cy="12" r="4" fill="#00F5D4" />
                  <circle cx="12" cy="12" r="9" stroke="#FF2A85" strokeWidth="2" fill="none" />
                </svg>
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-tight">Rings</div>
                  <div className="text-[8.5px] text-slate-400 font-sans">Radial split</div>
                </div>
              </button>

              {/* Moons Pill */}
              <button
                onClick={() => onSelectPreset('moons')}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                  currentPreset === 'moons'
                    ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-cyan-glow'
                    : 'bg-[#10141F] border-white/[0.07] hover:border-white/20 text-slate-300'
                }`}
              >
                {/* Mini SVG: Intertwined Moons */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <path d="M 4 14 Q 10 4 16 10" stroke="#00F5D4" strokeWidth="2.5" fill="none" />
                  <path d="M 8 18 Q 14 24 20 14" stroke="#FF2A85" strokeWidth="2.5" fill="none" />
                </svg>
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-tight">Moons</div>
                  <div className="text-[8.5px] text-slate-400 font-sans">Topological</div>
                </div>
              </button>

              {/* Linear Pill */}
              <button
                onClick={() => onSelectPreset('linear')}
                className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                  currentPreset === 'linear'
                    ? 'bg-cyber-cyan/15 border-cyber-cyan text-white shadow-cyan-glow'
                    : 'bg-[#10141F] border-white/[0.07] hover:border-white/20 text-slate-300'
                }`}
              >
                {/* Mini SVG: Linear Blobs */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <circle cx="7" cy="7" r="2.5" fill="#00F5D4" />
                  <circle cx="11" cy="9" r="2.5" fill="#00F5D4" />
                  <circle cx="14" cy="17" r="2.5" fill="#FF2A85" />
                  <circle cx="18" cy="15" r="2.5" fill="#FF2A85" />
                  <line x1="4" y1="18" x2="20" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2,2" />
                </svg>
                <div className="text-left">
                  <div className="text-[11px] font-bold leading-tight">Linear</div>
                  <div className="text-[8.5px] text-slate-400 font-sans">Separable</div>
                </div>
              </button>
            </div>

            {/* Quick Canvas Point Drawing Class Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] font-mono text-slate-400">Click canvas to drop:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSetActiveClass(0)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                    activeClass === 0
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                  Class 0
                </button>
                <button
                  onClick={() => onSetActiveClass(1)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border ${
                    activeClass === 1
                      ? 'bg-cyber-magenta/20 border-cyber-magenta text-cyber-magenta font-bold'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyber-magenta" />
                  Class 1
                </button>
                <button
                  onClick={onUndoPoint}
                  title="Undo point"
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 border border-white/[0.06]"
                >
                  Undo
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: REAL NEURAL TRAINING ENGINE CONTROLS */}
          <div className="space-y-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
                TRAINING ENGINE
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="text-slate-400">Epoch:</span>
                <span className="text-white font-bold tabular-nums">{epoch}</span>
              </div>
            </div>

            {/* Telemetry pill */}
            <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-2 rounded-xl border border-white/[0.05] font-mono text-[11px]">
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">BCE Loss</span>
                <span className="text-cyber-magenta font-bold tabular-nums text-xs">
                  {currentLoss.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">Accuracy</span>
                <span className="text-cyber-cyan font-bold tabular-nums text-xs">
                  {(currentAcc * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Optimizer Selector Pills */}
            <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
              <button
                onClick={() => onChangeOptConfig({ ...optConfig, type: 'sgd' })}
                className={`py-1 rounded border transition-colors text-center ${
                  optConfig.type === 'sgd'
                    ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                SGD
              </button>
              <button
                onClick={() => onChangeOptConfig({ ...optConfig, type: 'momentum' })}
                className={`py-1 rounded border transition-colors text-center ${
                  optConfig.type === 'momentum'
                    ? 'bg-cyber-amber/20 border-cyber-amber text-cyber-amber font-bold'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                Momentum
              </button>
              <button
                onClick={() => onChangeOptConfig({ ...optConfig, type: 'adam' })}
                className={`py-1 rounded border transition-colors text-center ${
                  optConfig.type === 'adam'
                    ? 'bg-cyber-violet/20 border-cyber-violet text-cyber-violet font-bold'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                Adam
              </button>
            </div>

            {/* Action Buttons: Play/Pause, Step, Reset */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={() => setIsTraining(!isTraining)}
                className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isTraining
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-glow'
                    : 'bg-cyber-cyan hover:bg-cyber-cyan/90 text-black shadow-cyan-glow'
                }`}
              >
                {isTraining ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isTraining ? 'PAUSE' : 'AUTO-TRAIN'}
              </button>

              <button
                onClick={handleStepOnce}
                disabled={isTraining}
                title="Single Forward & Backprop Step"
                className="py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] text-xs font-mono font-bold transition-colors disabled:opacity-50"
              >
                Step
              </button>

              <button
                onClick={handleResetWeights}
                title="Reset network weights to default"
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse / Expand Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Matrix Studio' : 'Collapse Matrix Studio'}
        className="self-center ml-1 w-5 h-12 glass-hud rounded-r-lg flex items-center justify-center text-slate-400 hover:text-white border-l-0 border-white/[0.08] hover:border-cyber-cyan/50 transition-colors shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
};
