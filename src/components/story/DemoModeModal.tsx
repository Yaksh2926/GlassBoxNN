import React from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Layers,
  TrendingDown,
  GitBranch,
  Target,
  Maximize2,
} from 'lucide-react';
import { DatasetPreset, Datasets } from '../../math/datasets';
import { NetworkWeights } from '../../math/types';

export interface DemoStep {
  id: number;
  title: string;
  badge: string;
  viewMode: 'geometry' | 'loss' | 'graph';
  preset: DatasetPreset;
  weights: NetworkWeights;
  tau: number;
  spokenPitch: string;
  mathExplanation: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: 'The Linear Barrier: The XOR Dilemma',
    badge: '1. Problem Formulation',
    viewMode: 'geometry',
    preset: 'xor',
    weights: {
      W1: [[1.0, 0.0], [0.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 0.0,
    spokenPitch:
      "Notice how Class 0 (cyan circles) and Class 1 (pink diamonds) lie on opposite diagonals. In 1969, Minsky and Papert proved that no single hyperplane wᵀx + b = 0 can separate this pattern.",
    mathExplanation:
      "Linear inseparability in ℝ²: The convex hull of Class 0 intersects the convex hull of Class 1. No affine half-space can isolate the diagonal classes.",
  },
  {
    id: 2,
    title: 'Linear Affine Deformation Alone Fails',
    badge: '2. Affine Limitation',
    viewMode: 'geometry',
    preset: 'xor',
    weights: {
      W1: [[1.4, 0.8], [-0.6, 1.2]],
      b1: [0.2, -0.3],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 1.0,
    spokenPitch:
      "Even if we stretch, rotate, and shear the coordinate grid through matrix multiplication W₁x + b₁, straight parallel lines remain straight and parallel. Linear algebra alone cannot untangle the XOR parity.",
    mathExplanation:
      "Affine preservation of collinearity: Compositions of affine maps remain strictly affine: W₂(W₁x + b₁) + b₂ = (W₂W₁)x + (W₂b₁ + b₂). Depth adds zero expressive power without non-linearity.",
  },
  {
    id: 3,
    title: 'Singular Matrix Collapse (Rank-Nullity)',
    badge: '3. Failure Mode',
    viewMode: 'geometry',
    preset: 'xor',
    weights: {
      W1: [[1.5, -1.5], [-1.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 1.0,
    spokenPitch:
      "Watch what happens when the matrix determinant reaches zero: the entire 2D Cartesian plane collapses into a single 1D diagonal line! Information is irreversibly destroyed.",
    mathExplanation:
      "By the Rank-Nullity Theorem, dim(ker(W₁)) = 1. Points differing by any vector in the nullspace collapse to identical preactivations, rendering classification accuracy permanently bounded at 50%.",
  },
  {
    id: 4,
    title: 'Topological Space Folding (Cover\'s Theorem)',
    badge: '4. Non-Linear Solution',
    viewMode: 'geometry',
    preset: 'xor',
    weights: {
      W1: [[1.0, 1.0], [1.0, 1.0]],
      b1: [0.0, -0.8],
      W2: [1.2, -1.4],
      b2: 0.2,
      activation: 'relu',
    },
    tau: 2.2,
    spokenPitch:
      "When we activate the non-linear ReLU function, space creases like origami! The negative coordinate quadrant folds onto zero, pulling the two opposing Class 0 points together so a single straight cut separates them.",
    mathExplanation:
      "Cover's Theorem on Separability: Mapping non-linearly into latent feature space enables linear separation via hyperplane w₂ᵀa₁ + b₂ = 0.",
  },
  {
    id: 5,
    title: 'Multivariable Calculus: 3D Loss Landscapes',
    badge: '5. Optimization',
    viewMode: 'loss',
    preset: 'xor',
    weights: {
      W1: [[1.2, 0.5], [-0.5, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.2, -1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 0.0,
    spokenPitch:
      "Here we compute the true Binary Cross-Entropy loss surface and second-order Hessian curvature matrix. In the Optimizer Race, Adam rapidly navigates anisotropic ravines where Vanilla SGD violently oscillates.",
    mathExplanation:
      "Curvature is governed by the 2×2 Hessian H = ∇²ℒ. Eigenvalues μ₁, μ₂ classify local geometry into elliptic convex bowls, hyperbolic saddle points, or ill-conditioned valleys.",
  },
  {
    id: 6,
    title: 'Automatic Differentiation & The Chain Rule',
    badge: '6. Backpropagation',
    viewMode: 'graph',
    preset: 'xor',
    weights: {
      W1: [[1.0, 0.5], [0.3, 0.8]],
      b1: [0.0, 0.0],
      W2: [1.2, -1.0],
      b2: 0.0,
      activation: 'relu',
    },
    tau: 0.0,
    spokenPitch:
      "Every gradient is computed via exact calculus factor products. Hover over any connection to inspect live numerical multipliers, and watch how negative preactivations extinguish learning in Dead ReLUs.",
    mathExplanation:
      "Exact chain rule: ∂ℒ/∂w₁₁ = (ŷ - y) · w₂,1 · σ'(z₁,1) · x₁. When σ'(z) = 0, the zero factor propagates backward, causing complete gradient starvation.",
  },
];

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepIndex: number;
  onChangeStep: (index: number) => void;
  onApplyStep: (step: DemoStep) => void;
  personaMode: 'beginner' | 'judge';
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  currentStepIndex,
  onChangeStep,
  onApplyStep,
  personaMode,
}) => {
  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      onChangeStep(nextIndex);
      onApplyStep(DEMO_STEPS[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      onChangeStep(prevIndex);
      onApplyStep(DEMO_STEPS[prevIndex]);
    }
  };

  const handleJump = (index: number) => {
    onChangeStep(index);
    onApplyStep(DEMO_STEPS[index]);
  };

  const handleResetStep = () => {
    onApplyStep(currentStep);
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-2xl w-full rounded-2xl border border-[#29374B] bg-[#111A2A]/95 backdrop-blur-md shadow-2xl p-5 text-[#F4F7FB] animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#29374B]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wide text-[#F4F7FB]">
                GUIDED PITCH DEMO
              </span>
              <span className="ml-2 text-[10px] font-mono text-[#9DAFC3]">
                Step {currentStepIndex + 1} of {DEMO_STEPS.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetStep}
              className="p-1 text-[#9DAFC3] hover:text-[#F4F7FB] rounded hover:bg-[#182438] transition-colors"
              title="Reset to initial step state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#9DAFC3] hover:text-[#F4F7FB] rounded hover:bg-[#182438] transition-colors"
              title="Exit Demo Mode"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progression Indicators */}
        <div className="grid grid-cols-6 gap-1.5 py-3">
          {DEMO_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => handleJump(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-[#53D4F4] shadow-sm'
                  : idx < currentStepIndex
                  ? 'bg-[#29374B]'
                  : 'bg-[#182438]'
              }`}
              title={`Jump to ${step.title}`}
            />
          ))}
        </div>

        {/* Active Step Content */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#53D4F4] bg-[#182438] px-2 py-0.5 rounded border border-[#29374B]">
              {currentStep.badge}
            </span>
            <span className="text-[10px] font-mono text-[#9DAFC3] uppercase">
              View: {currentStep.viewMode.toUpperCase()}
            </span>
          </div>

          <h3 className="text-base font-bold text-[#F4F7FB]">
            {currentStep.title}
          </h3>

          {/* Spoken Pitch & Math Explanation */}
          <div className="p-3 rounded-lg bg-[#0B1020]/80 border border-[#29374B] text-xs leading-relaxed space-y-2">
            <div className="text-[#F4F7FB] flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F7C76B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F7C76B]">Spoken Pitch: </strong>
                <span>{currentStep.spokenPitch}</span>
              </div>
            </div>
            {personaMode === 'judge' && (
              <div className="text-[#9DAFC3] flex items-start gap-2 pt-1 border-t border-[#29374B]/50">
                <GraduationCap className="w-3.5 h-3.5 text-[#53D4F4] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#53D4F4]">Mathematical Rigor: </strong>
                  <span>{currentStep.mathExplanation}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="mt-4 pt-3 border-t border-[#29374B] flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed border-transparent text-[#9DAFC3]'
                : 'border-[#29374B] bg-[#182438] text-[#F4F7FB] hover:border-[#53D4F4]/50'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-[11px] font-mono text-[#9DAFC3]">
            {currentStepIndex + 1} / {DEMO_STEPS.length}
          </span>

          {currentStepIndex < DEMO_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#53D4F4] text-[#0B1020] px-4 py-1.5 rounded-lg hover:bg-[#68ddfc] transition-all"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#10B981] text-[#0B1020] px-4 py-1.5 rounded-lg hover:bg-[#25c48f] transition-all"
            >
              <span>Finish Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
