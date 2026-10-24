import React from 'react';
import { ChevronLeft, ChevronRight, Presentation, Sparkles, CheckCircle2 } from 'lucide-react';
import { NetworkWeights, Point2D, ActivationType } from '../../math/types';
import { Datasets, DatasetPreset } from '../../math/datasets';

export interface StoryStep {
  id: number;
  title: string;
  subtitle: string;
  narration: string;
  presetDataset: DatasetPreset;
  presetWeights: NetworkWeights;
  tau: number;
  viewTab: 'warper' | 'loss';
  activeClass: 0 | 1;
}

export const STORY_STEPS: StoryStep[] = [
  {
    id: 1,
    title: 'The XOR Impossibility',
    subtitle: 'Why Linear Models Fail (Minsky & Papert 1969)',
    narration:
      'We begin with the fundamental roadblock of 1960s artificial intelligence: the XOR dataset. Notice that diagonal points share the same class. No single straight line in R² can isolate cyan from magenta without misclassifying half the data.',
    presetDataset: 'xor',
    presetWeights: {
      W1: [[1.0, 0.0], [0.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 0.0,
    viewTab: 'warper',
    activeClass: 0,
  },
  {
    id: 2,
    title: 'Matrix Transformations & Rank Collapse',
    subtitle: 'Linear Algebra Invariants & det(W₁) = 0',
    narration:
      'Before activations, the first layer performs an affine transformation: z₁ = W₁x + b₁. Watch basis vectors î and ĵ move. When det(W₁) = 0, the entire 2D Cartesian plane collapses into a 1D line, permanently destroying classification capacity.',
    presetDataset: 'xor',
    presetWeights: {
      W1: [[1.0, 1.0], [1.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, 1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 1.0,
    viewTab: 'warper',
    activeClass: 0,
  },
  {
    id: 3,
    title: 'Topological Folding via Activations',
    subtitle: "Cover's Theorem & Non-Linear Manifolds",
    narration:
      "Now drag the Homotopy Scrubber through τ ∈ [1, 2]. By applying non-linear ReLU folding, space is literally creased along negative preactivations. In this bent representation space, XOR becomes linearly separable by a single straight hyperplane!",
    presetDataset: 'xor',
    presetWeights: {
      W1: [[1.2, 1.2], [-1.2, -1.2]],
      b1: [-0.6, 0.6],
      W2: [1.8, 1.8],
      b2: -1.0,
      activation: 'relu',
    },
    tau: 2.2,
    viewTab: 'warper',
    activeClass: 0,
  },
  {
    id: 4,
    title: 'Loss Landscapes & Saddle Points',
    subtitle: 'Multivariable Calculus & Curvature Eigenvalues',
    narration:
      'Switch to the 3D Loss Landscape. Optimization is not magic—it is gravity in parameter space. The Hessian matrix H reveals local curvature: positive eigenvalues indicate a bowl, while opposing signs create a saddle plateau where standard gradient descent stalls.',
    presetDataset: 'moons',
    presetWeights: {
      W1: [[1.5, -0.8], [-0.5, 1.8]],
      b1: [0.2, -0.4],
      W2: [1.2, -1.1],
      b2: 0.1,
      activation: 'tanh',
    },
    tau: 2.0,
    viewTab: 'loss',
    activeClass: 1,
  },
  {
    id: 5,
    title: 'The Chain Rule Engine',
    subtitle: 'Live Analytical Backpropagation & Dead ReLUs',
    narration:
      'Finally, inspect the computational graph. Every single weight update is calculated via the chain rule of calculus. Hover over w₁₁ to watch floating-point numbers multiply through the partial derivatives. If a ReLU receives negative inputs, its local derivative is 0, killing learning.',
    presetDataset: 'circles',
    presetWeights: {
      W1: [[1.8, 0.2], [-0.3, 1.6]],
      b1: [-0.5, -0.5],
      W2: [2.0, -1.5],
      b2: 0.3,
      activation: 'relu',
    },
    tau: 1.8,
    viewTab: 'warper',
    activeClass: 0,
  },
];

interface StoryModeBarProps {
  currentStepId: number;
  onSelectStep: (step: StoryStep) => void;
}

export const StoryModeBar: React.FC<StoryModeBarProps> = ({ currentStepId, onSelectStep }) => {
  const currentStep = STORY_STEPS.find(s => s.id === currentStepId) || STORY_STEPS[0];

  const handlePrev = () => {
    const prevIdx = Math.max(0, currentStep.id - 2);
    onSelectStep(STORY_STEPS[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = Math.min(STORY_STEPS.length - 1, currentStep.id);
    onSelectStep(STORY_STEPS[nextIdx]);
  };

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-2.5 shadow-glass">
      {/* Top Bar with Step Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            3-Minute Hackathon Pitch Tour:
          </span>
        </div>

        {/* 5-Step Stepper Buttons */}
        <div className="flex items-center gap-1.5">
          {STORY_STEPS.map(step => (
            <button
              key={step.id}
              onClick={() => onSelectStep(step)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all flex items-center gap-1 ${
                step.id === currentStepId
                  ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
                  : step.id < currentStepId
                  ? 'bg-[#131B2E] text-cyber-cyan border border-[#2A374F]'
                  : 'bg-[#131B2E] text-slate-400 border border-[#1E2D4A] hover:text-white'
              }`}
            >
              <span>{step.id}.</span>
              <span className="hidden sm:inline">{step.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentStep.id === 1}
            className="p-1 rounded bg-[#131B2E] hover:bg-[#1C2844] disabled:opacity-40 border border-[#1E2D4A] text-slate-300"
            title="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-1">
            {currentStep.id}/{STORY_STEPS.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentStep.id === STORY_STEPS.length}
            className="p-1 rounded bg-[#131B2E] hover:bg-[#1C2844] disabled:opacity-40 border border-[#1E2D4A] text-slate-300"
            title="Next Step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Stage Narration Card */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyber-cyan font-mono">
              Step {currentStep.id}: {currentStep.title}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">({currentStep.subtitle})</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {currentStep.narration}
          </p>
        </div>

        <button
          onClick={() => onSelectStep(currentStep)}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan text-cyber-cyan text-xs font-mono font-semibold transition-all flex items-center gap-1.5 self-start md:self-center"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Step Preset
        </button>
      </div>
    </div>
  );
};
