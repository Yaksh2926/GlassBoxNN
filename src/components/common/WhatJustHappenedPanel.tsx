import React, { useState } from 'react';
import { Sparkles, GraduationCap, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { NetworkWeights, Point2D } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { Activations } from '../../math/activations';
import { MathView } from '../common/MathView';

export type OperationContextType =
  | 'idle'
  | 'weight_change'
  | 'matrix_change'
  | 'activation_change'
  | 'homotopy_scrub'
  | 'point_selected'
  | 'training_step'
  | 'singular_collapse'
  | 'dead_relu'
  | 'view_loss'
  | 'view_graph';

interface WhatJustHappenedPanelProps {
  contextType: OperationContextType;
  personaMode: 'beginner' | 'judge';
  weights: NetworkWeights;
  tau: number;
  selectedPoint?: Point2D | null;
  lastChangedParam?: string;
  lossValue?: number;
  accuracy?: number;
  onClose?: () => void;
  className?: string;
}

export const WhatJustHappenedPanel: React.FC<WhatJustHappenedPanelProps> = ({
  contextType,
  personaMode,
  weights,
  tau,
  selectedPoint,
  lastChangedParam,
  lossValue,
  accuracy,
  onClose,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const det = LinearAlgebra.det(weights.W1);
  const trace = LinearAlgebra.trace(weights.W1);
  const cond = LinearAlgebra.conditionNumber(weights.W1);

  // Generate dynamic, context-accurate content based on current mathematical state
  const getContent = () => {
    switch (contextType) {
      case 'singular_collapse':
        return {
          title: 'Singular Matrix Rank Collapse [det(W₁) = 0]',
          explore:
            'The 2D coordinate plane was squashed completely flat into a single 1D diagonal line. Both input dimensions collapsed onto each other, destroying class separability.',
          judge: (
            <span>
              By the <strong>Rank-Nullity Theorem</strong>, <MathView math="\dim(\ker(W_1)) = 1" />, reducing range dimension to 1.
              Since <MathView math="\det(W_1) = 0.00" />, the operator is non-invertible; points differing by vectors in the nullspace project to identical preactivations.
            </span>
          ),
          metric: `det(W₁) = ${det.toFixed(3)} | κ(W₁) = ∞`,
        };

      case 'dead_relu':
        return {
          title: 'Dead ReLU Gradient Extinction [∇_W L = 0]',
          explore:
            'All data points landed in the negative zone where ReLU turns to zero. Because the slope is flat (zero), no learning signals can pass backward.',
          judge: (
            <span>
              For all samples <MathView math="\mathbf{x}" />, preactivations satisfy <MathView math="z_{1, i} \le 0" />. Since <MathView math="\sigma'(z) = 0" />,
              the multivariable chain rule product contains a zero factor: <MathView math="\frac{\partial \mathcal{L}}{\partial W_1} = 0" />, freezing weights permanently.
            </span>
          ),
          metric: `b₁ = [${weights.b1[0].toFixed(1)}, ${weights.b1[1].toFixed(1)}] | σ'(z) = 0`,
        };

      case 'point_selected':
        if (!selectedPoint) {
          return {
            title: 'Coordinate Selection',
            explore: 'Click any data point on the canvas to inspect its path through the network.',
            judge: <span>Coordinate inspection in ℝ². Select a datum to trace its affine image.</span>,
            metric: 'Awaiting selection',
          };
        }
        const z1_0 = weights.W1[0][0] * selectedPoint.x + weights.W1[0][1] * selectedPoint.y + weights.b1[0];
        const z1_1 = weights.W1[1][0] * selectedPoint.x + weights.W1[1][1] * selectedPoint.y + weights.b1[1];
        const a1_0 = Activations.fn(z1_0, weights.activation);
        const a1_1 = Activations.fn(z1_1, weights.activation);
        const z2 = weights.W2[0] * a1_0 + weights.W2[1] * a1_1 + weights.b2;
        const prob = Activations.fn(z2, 'sigmoid');
        return {
          title: `Inspecting Point (${selectedPoint.x.toFixed(2)}, ${selectedPoint.y.toFixed(2)}) — Class ${selectedPoint.label}`,
          explore: `This point mapped to pre-activation [${z1_0.toFixed(2)}, ${z1_1.toFixed(2)}], activated to [${a1_0.toFixed(2)}, ${a1_1.toFixed(2)}], yielding ${(prob * 100).toFixed(1)}% probability for Class 1.`,
          judge: (
            <span>
              Input <MathView math={`\\mathbf{x} = [${selectedPoint.x.toFixed(2)}, ${selectedPoint.y.toFixed(2)}]^T`} /> maps to preactivation <MathView math={`\\mathbf{z}_1 = [${z1_0.toFixed(2)}, ${z1_1.toFixed(2)}]^T`} /> and activated feature <MathView math={`\\mathbf{a}_1 = [${a1_0.toFixed(2)}, ${a1_1.toFixed(2)}]^T`} /> giving prediction <MathView math={`\\hat{y} = ${prob.toFixed(4)}`} />.
            </span>
          ),
          metric: `z₂ = ${z2.toFixed(3)} | ŷ = ${prob.toFixed(3)} | y = ${selectedPoint.label}`,
        };

      case 'activation_change':
        return {
          title: `Activation Function Set to ${weights.activation.toUpperCase()}`,
          explore:
            weights.activation === 'relu'
              ? 'ReLU folds the space along the coordinate axes, setting all negative values to zero like an origami crease.'
              : weights.activation === 'sigmoid'
              ? 'Sigmoid smoothly squashes the entire infinite plane into a compact (0, 1) square box.'
              : 'Tanh squashes space symmetrically into (-1, 1) with zero centering.',
          judge: (
            <span>
              Applied non-linear morphism <MathView math="\sigma: \mathbb{R}^2 \to \mathbb{R}^2" />.
              {weights.activation === 'relu'
                ? " Piecewise linear crease; projects negative half-space onto the boundary, validating Cover's Theorem."
                : ' Smooth diffeomorphism bounded in range with exponential saturation.'}
            </span>
          ),
          metric: `Activation: ${weights.activation.toUpperCase()}`,
        };

      case 'weight_change':
      case 'matrix_change':
        return {
          title: `Grid Stretch & Shift Knobs (W₁, b₁)${lastChangedParam ? ` — ${lastChangedParam}` : ''}`,
          explore: `You are manually stretching and rotating the coordinate rubber sheet! Watch how changing ${lastChangedParam || 'Weight W₁'} physically warps the grid. Parallelogram area scaled by ${Math.abs(det).toFixed(2)}x${det < 0 ? ' (reflected)' : ''}.`,
          judge: (
            <span>
              Updated operator <MathView math="W_1 \in \mathbb{R}^{2 \times 2}" />. Invariants: <MathView math={`\\det(W_1) = ${det.toFixed(3)}`} />, <MathView math={`\\text{tr}(W_1) = ${trace.toFixed(3)}`} />, condition number <MathView math={`\\kappa(W_1) = ${cond > 99 ? '\\infty' : cond.toFixed(2)}`} />.
            </span>
          ),
          metric: `det = ${det.toFixed(2)} | tr = ${trace.toFixed(2)} | κ = ${cond.toFixed(1)}`,
        };

      case 'homotopy_scrub':
        if (tau <= 1.0) {
          return {
            title: `Affine Linear Interpolation (τ = ${tau.toFixed(2)})`,
            explore: 'Linear transformation stage: coordinate grid lines remain straight and parallel while rotating and shearing.',
            judge: (
              <span>
                Homotopy <MathView math="H(\mathbf{x}, \tau) = (1 - \tau)\mathbf{x} + \tau(W_1 \mathbf{x} + \mathbf{b}_1)" />. Area scales as <MathView math="|\det((1-\tau)I + \tau W_1)|" />.
              </span>
            ),
            metric: `Stage: Affine Warp (τ ∈ [0, 1])`,
          };
        } else if (tau <= 2.0) {
          return {
            title: `Topological Space Folding (τ = ${tau.toFixed(2)})`,
            explore: 'Non-linear folding stage: the grid bends and creases along negative pre-activations, separating non-linear patterns.',
            judge: (
              <span>
                Activation homotopy <MathView math="H(\mathbf{x}, \tau) = (2 - \tau)\mathbf{z}_1 + (\tau - 1)\sigma(\mathbf{z}_1)" />. Demonstrates <strong>Cover's Theorem on Separability</strong>.
              </span>
            ),
            metric: `Stage: Non-Linear Crease (τ ∈ [1, 2])`,
          };
        } else {
          return {
            title: `Decision Boundary Evaluation (τ = ${tau.toFixed(2)})`,
            explore: 'Output stage: the final straight boundary line cuts across the folded space, partitioning Class 0 from Class 1.',
            judge: (
              <span>
                Hyperplane <MathView math="\mathcal{H} = \{ \mathbf{a}_1 \in \mathbb{R}^2 \mid \mathbf{w}_2^T \mathbf{a}_1 + b_2 = 0 \}" />. Back-projected to input space, this forms a non-linear decision manifold.
              </span>
            ),
            metric: `Stage: Hyperplane Cut (τ ∈ [2, 3])`,
          };
        }

      case 'training_step':
        return {
          title: 'Gradient Descent Parameter Update',
          explore: `Weights updated to minimize error. Current BCE loss is ${lossValue !== undefined ? lossValue.toFixed(4) : '...'}${accuracy !== undefined ? ` with accuracy ${(accuracy * 100).toFixed(0)}%` : ''}.`,
          judge: (
            <span>
              Optimizer step: <MathView math="\mathbf{\Theta}_{t+1} = \mathbf{\Theta}_t - \eta \nabla \mathcal{L}" />. Loss <MathView math={`\\mathcal{L} = ${lossValue?.toFixed(4) ?? '0.00'}`} />, accuracy = {accuracy ? `${(accuracy * 100).toFixed(1)}%` : '0%'}.
            </span>
          ),
          metric: `Loss: ${lossValue?.toFixed(4) ?? '—'} | Acc: ${accuracy ? `${(accuracy * 100).toFixed(0)}%` : '—'}`,
        };

      case 'view_loss':
        return {
          title: '3D Loss Surface & Hessian Curvature',
          explore: 'Viewing the parameter terrain: the ball rolls downhill toward the minimum where classification error is lowest.',
          judge: (
            <span>
              Parameter slice <MathView math="\mathcal{L}(w_{11}, w_{22})" />. Curvature governed by second-order Hessian <MathView math="H = \nabla^2 \mathcal{L}" />.
            </span>
          ),
          metric: 'Slice: W₁(1,1) vs W₁(2,2)',
        };

      case 'view_graph':
        return {
          title: 'Automatic Differentiation Silicon Graph',
          explore: 'Cyan particles pulse forward with values; magenta particles pulse backward carrying error signals.',
          judge: (
            <span>
              Symbolic multivariable chain rule: <MathView math="\frac{\partial \mathcal{L}}{\partial w_{ij}^{(1)}} = (\hat{y} - y) w_{2, i} \sigma'(z_{1, i}) x_j" />.
            </span>
          ),
          metric: 'Mode: Silicon Autodiff Flow',
        };

      default:
        return {
          title: 'Mathematical Observatory Ready',
          explore: 'Interact with matrix sliders, scrub the timeline, or select data points to observe geometric transformations.',
          judge: (
            <span>
              Full-rank operator <MathView math="W_1 \in \mathbb{R}^{2 \times 2}" />. <MathView math={`\\det(W_1) = ${det.toFixed(2)}`} />, <MathView math={`\\text{tr}(W_1) = ${trace.toFixed(2)}`} />, <MathView math={`\\kappa(W_1) = ${cond.toFixed(1)}`} />.
            </span>
          ),
          metric: `det = ${det.toFixed(2)} | κ = ${cond.toFixed(1)}`,
        };
    }
  };

  const content = getContent();

  return (
    <div
      className={`glass-hud rounded-xl border border-[#29374B] bg-[#111A2A]/95 text-[#F4F7FB] shadow-lg transition-all duration-200 ${className}`}
    >
      {/* Header Bar */}
      <div className="px-3.5 py-2 flex items-center justify-between border-b border-[#29374B]/70 bg-[#0B1020]/60">
        <div className="flex items-center gap-2">
          {personaMode === 'judge' ? (
            <GraduationCap className="w-3.5 h-3.5 text-[#53D4F4] shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#F7C76B] shrink-0" />
          )}
          <span className="text-[11px] font-semibold tracking-wide text-[#F4F7FB]">
            WHAT JUST HAPPENED?
          </span>
          <span className="text-[10px] font-mono text-[#9DAFC3] px-1.5 py-0.2 rounded bg-[#182438] border border-[#29374B]">
            {personaMode === 'judge' ? 'Math Rigor' : 'Explore Mode'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#53D4F4] hidden sm:inline mr-1">
            {content.metric}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[#9DAFC3] hover:text-[#F4F7FB] rounded hover:bg-[#182438] transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {isExpanded && (
        <div className="px-3.5 py-2.5 space-y-1.5 text-xs animate-in fade-in duration-150">
          <div className="font-medium text-[#F4F7FB] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#53D4F4] shrink-0" />
            <span>{content.title}</span>
          </div>
          <div className="text-[11px] text-[#9DAFC3] leading-relaxed pl-5 flex flex-wrap items-center gap-x-1">
            {personaMode === 'judge' ? content.judge : content.explore}
          </div>
        </div>
      )}
    </div>
  );
};
