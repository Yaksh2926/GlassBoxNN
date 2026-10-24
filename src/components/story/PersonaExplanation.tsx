import React from 'react';
import { ActivationType } from '../../math/types';
import { MathView } from '../common/MathView';
import { Lightbulb, GraduationCap, Scale, BookOpen } from 'lucide-react';

interface PersonaExplanationProps {
  mode: 'beginner' | 'judge';
  onToggleMode: (mode: 'beginner' | 'judge') => void;
  tau: number;
  det: number;
  activation: ActivationType;
  datasetName: string;
}

export const PersonaExplanation: React.FC<PersonaExplanationProps> = ({
  mode,
  onToggleMode,
  tau,
  det,
  activation,
  datasetName,
}) => {
  // Generate dynamic contextual explanations based on current live state
  const getExplanation = () => {
    const isRankCollapsed = Math.abs(det) < 0.02;

    if (isRankCollapsed) {
      if (mode === 'beginner') {
        return {
          title: 'Paper Squashed into a Wire!',
          text: 'Imagine taking a 2D sheet of paper and stomping on it so hard it turns into a single thin string. Now, all your blue and pink dots are crushed onto the same line—you can never slice them apart with scissors anymore!',
        };
      } else {
        return {
          title: 'Dimension Collapse: Rank Deficiency & Kernel Triviality',
          text: 'Since det(W₁) ≈ 0, the rank of the transformation matrix is rank(W₁) ≤ 1. By the Rank-Nullity Theorem, dim(ker(W₁)) ≥ 1. The input vector space R² is mapped onto a 1-dimensional subspace, annihilating non-invertible topological information.',
        };
      }
    }

    if (tau <= 1.0) {
      if (mode === 'beginner') {
        return {
          title: 'Stretching and Rotating the Sheet of Space',
          text: 'Think of drawing your dots on a rubber sheet. First, the matrix spins the sheet, pulls it sideways, and tilts it. Notice that straight grid lines stay completely straight—you haven’t bent or creased the rubber yet!',
        };
      } else {
        return {
          title: 'Affine Homotopy & Linear Vector Space Action',
          text: 'We parametrize the affine map as H(x, τ) = (1 - τ)I x + τ(W₁x + b₁). For any τ ∈ [0, 1], this transformation preserves collinearity, parallelism, and ratio of distances along parallel lines. The Jacobian matrix is J = (1 - τ)I + τ W₁ with Jacobian determinant |det(J)| representing local volume scaling.',
        };
      }
    } else if (tau <= 2.0) {
      if (mode === 'beginner') {
        return {
          title: `Creasing Space with ${activation.toUpperCase()}`,
          text: `Now comes the magic: we physically fold the paper! Any part of the sheet pushed into the negative zone gets creased flat. Because space is now bent, blue dots and pink dots that used to be hopelessly mixed up now end up on opposite sides of a single scissor cut!`,
        };
      } else {
        return {
          title: `Non-Linear Topological Embedding (Cover's Theorem)`,
          text: `By Cover's Theorem on the Separability of Patterns, non-linearly separable manifolds in input space R² become linearly separable with high probability when transformed non-linearly into a feature space a₁ = σ(W₁x + b₁). The activation function breaks affine invariance and introduces piecewise-linear or sigmoidal curvature.`,
        };
      }
    } else {
      if (mode === 'beginner') {
        return {
          title: 'The Final Scissor Cut (Decision Boundary)',
          text: 'In this folded space, we draw one perfectly straight line across the canvas. When you unfold the paper back to the start, that single straight cut turns into an elegant, curved boundary that cleanly surrounds your classes!',
        };
      } else {
        return {
          title: 'Linear Hyperplane Separation in Transformed Coordinate Space',
          text: 'The output layer defines the affine hyperplane w₂ᵀ a₁ + b₂ = 0. Its inverse preimage in the original input space, {x ∈ R² : w₂ᵀ σ(W₁x + b₁) + b₂ = 0}, forms a non-linear algebraic variety whose curvature separates the disjoint topological sets.',
        };
      }
    }
  };

  const exp = getExplanation();

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 shadow-glass space-y-2">
      {/* Persona Toggle Header */}
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-1.5">
          {mode === 'beginner' ? (
            <Lightbulb className="w-4 h-4 text-cyber-cyan" />
          ) : (
            <GraduationCap className="w-4 h-4 text-cyber-magenta" />
          )}
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Dual-Persona Mathematical Lens
          </span>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex items-center bg-[#131B2E] p-1 rounded-lg border border-[#2A374F] text-[10px] font-mono">
          <button
            onClick={() => onToggleMode('beginner')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              mode === 'beginner'
                ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3 h-3" /> Explain Like I'm 12
          </button>
          <button
            onClick={() => onToggleMode('judge')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              mode === 'judge'
                ? 'bg-cyber-magenta text-white font-bold shadow-magenta-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3 h-3" /> Math Judge Rigor
          </button>
        </div>
      </div>

      {/* Explanation Content */}
      <div className="bg-[#131B2E] p-3 rounded-lg border border-[#2A374F] space-y-1">
        <h4
          className={`text-xs font-bold font-mono ${
            mode === 'beginner' ? 'text-cyber-cyan' : 'text-cyber-magenta'
          }`}
        >
          {exp.title}
        </h4>
        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{exp.text}</p>
      </div>
    </div>
  );
};
