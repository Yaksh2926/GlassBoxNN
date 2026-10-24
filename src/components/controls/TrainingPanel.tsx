import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  NetworkWeights,
  OptimizerConfig,
  OptimizerType,
  ActivationType,
  Point2D,
} from '../../math/types';
import { NeuralEngine, OptimizerState, createInitialOptimizerState } from '../../math/neuralEngine';
import { MathView } from '../common/MathView';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Cpu,
  Zap,
  Gauge,
  Percent,
  CheckCircle2,
} from 'lucide-react';

interface TrainingPanelProps {
  weights: NetworkWeights;
  onUpdateWeights: (newWeights: NetworkWeights) => void;
  dataset: Point2D[];
  optConfig: OptimizerConfig;
  onChangeOptConfig: (config: OptimizerConfig) => void;
  onResetNetwork: () => void;
}

export const TrainingPanel: React.FC<TrainingPanelProps> = ({
  weights,
  onUpdateWeights,
  dataset,
  optConfig,
  onChangeOptConfig,
  onResetNetwork,
}) => {
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);
  const optStateRef = useRef<OptimizerState>(createInitialOptimizerState());
  const animFrameRef = useRef<number | null>(null);

  // Compute live metrics
  const currentLoss = NeuralEngine.computeLoss(dataset, weights);
  const currentAccuracy = NeuralEngine.computeAccuracy(dataset, weights);
  const grads = NeuralEngine.computeGradients(dataset, weights);
  const gradNorm = Math.sqrt(
    grads.dW1[0][0] ** 2 +
      grads.dW1[0][1] ** 2 +
      grads.dW1[1][0] ** 2 +
      grads.dW1[1][1] ** 2 +
      grads.dW2[0] ** 2 +
      grads.dW2[1] ** 2
  );

  // Trigger celebration on 100% accuracy convergence
  const hasTriggeredConfetti = useRef<boolean>(false);
  useEffect(() => {
    if (currentAccuracy === 1.0 && dataset.length >= 10 && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F5D4', '#FF2A85', '#F59E0B', '#8B5CF6'],
      });
    } else if (currentAccuracy < 0.95) {
      hasTriggeredConfetti.current = false;
    }
  }, [currentAccuracy, dataset.length]);

  // Execute single optimization epoch step
  const executeStep = () => {
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
    setEpoch(prev => prev + 1);
  };

  // Continuous training animation loop
  useEffect(() => {
    if (!isTraining) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = () => {
      // Run 2 sub-steps per frame for smooth 60fps convergence
      for (let i = 0; i < 2; i++) {
        executeStep();
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isTraining, weights, dataset, optConfig]);

  const handleReset = () => {
    setIsTraining(false);
    optStateRef.current = createInitialOptimizerState();
    setEpoch(0);
    onResetNetwork();
  };

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Optimization & Training Lab
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Epoch #{epoch}</span>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        <button
          onClick={() => setIsTraining(!isTraining)}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            isTraining
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500 shadow-sm animate-pulse'
              : 'bg-cyber-cyan text-black hover:bg-cyber-cyan/90 shadow-cyan-glow font-bold'
          }`}
        >
          {isTraining ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Train Model
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsTraining(false);
            executeStep();
          }}
          disabled={isTraining}
          className="py-2 px-2 rounded-lg bg-[#131B2E] hover:bg-[#1C2844] border border-[#2A374F] text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
          title="Step 1 Epoch"
        >
          <StepForward className="w-3.5 h-3.5" /> Step 1x
        </button>

        <button
          onClick={handleReset}
          className="py-2 px-2 rounded-lg bg-[#131B2E] hover:bg-rose-950/40 border border-[#2A374F] hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1"
          title="Reinitialize Network"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Live Training Metrics Dashboard */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        {/* Loss */}
        <div className="bg-[#131B2E] p-2 rounded-lg border border-[#2A374F]">
          <span className="text-[9px] text-slate-400 uppercase block mb-0.5">
            BCE Loss <MathView math="\mathcal{L}" className="text-[9px] text-cyber-magenta" />
          </span>
          <div className="text-sm font-bold text-cyber-magenta">{currentLoss.toFixed(4)}</div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#131B2E] p-2 rounded-lg border border-[#2A374F]">
          <span className="text-[9px] text-slate-400 uppercase block mb-0.5">Accuracy</span>
          <div
            className={`text-sm font-bold ${
              currentAccuracy === 1.0 ? 'text-emerald-400' : 'text-cyber-cyan'
            }`}
          >
            {(currentAccuracy * 100).toFixed(1)}%
          </div>
        </div>

        {/* Gradient Norm */}
        <div className="bg-[#131B2E] p-2 rounded-lg border border-[#2A374F]">
          <span className="text-[9px] text-slate-400 uppercase block mb-0.5">
            Grad Norm <MathView math="||\nabla\mathcal{L}||" className="text-[9px] text-cyber-amber" />
          </span>
          <div className="text-sm font-bold text-cyber-amber">{gradNorm.toFixed(3)}</div>
        </div>
      </div>

      {/* Accuracy Progress Bar */}
      <div className="w-full bg-[#131B2E] h-1.5 rounded-full overflow-hidden border border-[#1E2D4A]">
        <div
          className="h-full bg-gradient-to-r from-cyber-cyan to-emerald-400 transition-all duration-150"
          style={{ width: `${currentAccuracy * 100}%` }}
        />
      </div>

      {/* Hyperparameters: Optimizer, Learning Rate, Activation */}
      <div className="space-y-2.5 pt-1 border-t border-[#1E2D4A]/60">
        {/* Optimizer Selector */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Optimizer:</span>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {(['sgd', 'momentum', 'adam'] as OptimizerType[]).map(type => (
              <button
                key={type}
                onClick={() => onChangeOptConfig({ ...optConfig, type })}
                className={`px-2 py-0.5 rounded border uppercase transition-colors ${
                  optConfig.type === type
                    ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan font-bold'
                    : 'bg-[#131B2E] border-[#2A374F] text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Activation Selector */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Activation σ(z):</span>
          <div className="grid grid-cols-4 gap-1 text-[10px]">
            {(['relu', 'leaky_relu', 'tanh', 'sigmoid'] as ActivationType[]).map(act => (
              <button
                key={act}
                onClick={() => onUpdateWeights({ ...weights, activation: act })}
                className={`px-1.5 py-0.5 rounded border transition-colors ${
                  weights.activation === act
                    ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold'
                    : 'bg-[#131B2E] border-[#2A374F] text-slate-400 hover:text-white'
                }`}
              >
                {act === 'leaky_relu' ? 'L-ReLU' : act.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Rate Slider */}
        <div className="space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              Learning Rate <MathView math="\eta" className="text-[10px] text-cyber-cyan" />:
            </span>
            <span className="text-cyber-cyan font-bold text-[11px]">{optConfig.learningRate.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="1.0"
            step="0.01"
            value={optConfig.learningRate}
            onChange={e =>
              onChangeOptConfig({ ...optConfig, learningRate: parseFloat(e.target.value) })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
