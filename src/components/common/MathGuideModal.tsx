import React from 'react';
import { X, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import { MathView } from './MathView';

interface MathGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathGuideModal: React.FC<MathGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0E1524] rounded-2xl border border-[#1E2D4A] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D4A] bg-[#0B101D]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-base font-bold text-white font-mono">
              GlassBox NN: Pure Mathematical Observatory Specification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#131B2E] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 font-sans leading-relaxed">
          {/* Section 1 */}
          <div className="bg-[#131B2E] p-4 rounded-xl border border-[#2A374F] space-y-2">
            <h3 className="text-sm font-bold text-cyber-cyan font-mono flex items-center gap-2">
              1. Cover's Theorem & Non-Linear Topological Folding
            </h3>
            <p>
              In 1965, Thomas M. Cover proved that a set of non-linearly separable patterns in input
              space <MathView math="\mathbb{R}^d" /> can be transformed into a space where they are
              linearly separable with high probability, provided the mapping is non-linear and the
              feature representation space is sufficiently rich:
            </p>
            <div className="bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView math="a_1 = \sigma(W_1 x + b_1)" className="text-cyber-cyan" />
            </div>
            <p>
              In <strong>GlassBox NN</strong>, the continuous homotopy parameter{' '}
              <MathView math="\tau \in [0, 3]" /> allows you to visually witness the Cartesian grid
              creasing along the piecewise-linear boundaries of ReLU or the sigmoidal curves of Tanh,
              unravelling non-linear geometries (like XOR and Concentric Rings) into linearly
              separable sets.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#131B2E] p-4 rounded-xl border border-[#2A374F] space-y-2">
            <h3 className="text-sm font-bold text-cyber-magenta font-mono flex items-center gap-2">
              2. Singular Value Decomposition (SVD) of Layer Transformations
            </h3>
            <p>
              Every matrix multiplication <MathView math="W_1 x" /> is geometrically factored via SVD:
            </p>
            <div className="bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView math="W_1 = U \Sigma V^T" className="text-cyber-magenta" />
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>
                <strong className="text-cyber-violet">Step 1 (Vᵀ):</strong> Orthogonal rotation/reflection aligning input basis vectors.
              </li>
              <li>
                <strong className="text-cyber-amber">Step 2 (Σ):</strong> Axis-aligned stretching of the unit circle into an ellipse with semi-axes <MathView math="\sigma_1, \sigma_2" />.
              </li>
              <li>
                <strong className="text-cyber-magenta">Step 3 (U):</strong> Final orthogonal rotation into the output coordinate frame.
              </li>
            </ul>
            <p>
              The <strong>Condition Number</strong> <MathView math="\kappa(W) = \sigma_1 / \sigma_2" /> measures the eccentricity of this ellipse; when <MathView math="\kappa \gg 1" />, gradient descent zig-zags in deep ravines.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-[#131B2E] p-4 rounded-xl border border-[#2A374F] space-y-2">
            <h3 className="text-sm font-bold text-cyber-amber font-mono flex items-center gap-2">
              3. Multivariable Calculus & The Hessian Curvature Matrix
            </h3>
            <p>
              The 3D Loss surface <MathView math="\mathcal{L}(\theta_1, \theta_2)" /> is governed by
              its gradient vector <MathView math="-\nabla \mathcal{L}" /> (steepest downhill,
              strictly orthogonal to contour isoclines) and its second-order Hessian matrix:
            </p>
            <div className="bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView math="H = \begin{pmatrix} \frac{\partial^2 \mathcal{L}}{\partial \theta_1^2} & \frac{\partial^2 \mathcal{L}}{\partial \theta_1 \partial \theta_2} \\ \frac{\partial^2 \mathcal{L}}{\partial \theta_2 \partial \theta_1} & \frac{\partial^2 \mathcal{L}}{\partial \theta_2^2} \end{pmatrix}" className="text-cyber-amber" />
            </div>
            <p>
              By Clairaut's Theorem, mixed partials are symmetric (<MathView math="H_{12} = H_{21}" />). The eigenvalues <MathView math="\mu_1, \mu_2" /> of <MathView math="H" /> classify local curvature:
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
              <div className="bg-[#0B101D] p-2 rounded border border-[#1E2D4A]">
                <span className="text-emerald-400 font-bold block">μ₁ &gt; 0, μ₂ &gt; 0</span>
                Local Minimum (Convex Bowl)
              </div>
              <div className="bg-[#0B101D] p-2 rounded border border-[#1E2D4A]">
                <span className="text-cyber-magenta font-bold block">μ₁ · μ₂ &lt; 0</span>
                Saddle Point (Plateau)
              </div>
              <div className="bg-[#0B101D] p-2 rounded border border-[#1E2D4A]">
                <span className="text-cyber-amber font-bold block">μ₁ &lt; 0, μ₂ &lt; 0</span>
                Local Maximum (Peak)
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-[#131B2E] p-4 rounded-xl border border-[#2A374F] space-y-2">
            <h3 className="text-sm font-bold text-cyber-violet font-mono flex items-center gap-2">
              4. Analytical Backpropagation & Dead ReLU Extinction
            </h3>
            <p>
              Backpropagation evaluates the multivariable Chain Rule backwards from the Loss node:
            </p>
            <div className="bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView math="\frac{\partial \mathcal{L}}{\partial w_{11}} = \frac{\partial \mathcal{L}}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z_2} \cdot \frac{\partial z_2}{\partial a_{1,1}} \cdot \frac{\partial a_{1,1}}{\partial z_{1,1}} \cdot \frac{\partial z_{1,1}}{\partial w_{11}}" className="text-cyber-violet" />
            </div>
            <p>
              Because <MathView math="\text{ReLU}'(z) = 0" /> for all <MathView math="z \le 0" />, a neuron whose preactivations are pushed negative by bad weight updates or high learning rates will produce a local derivative of exactly <MathView math="0" />, permanently extinguishing upstream gradient flow (the infamous <strong>Dead ReLU Problem</strong>).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E2D4A] bg-[#0B101D] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">MathX GTBIT Ideathon • Infinity Society</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-cyan text-black font-bold hover:bg-cyber-cyan/90 transition-colors"
          >
            Enter Observatory
          </button>
        </div>
      </div>
    </div>
  );
};
