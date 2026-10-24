import React from 'react';
import { X, AlertOctagon, GraduationCap, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { MathView } from './MathView';

interface SingularProofModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingularProofModal: React.FC<SingularProofModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0E1524] rounded-2xl border border-rose-500/60 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D4A] bg-[#0B101D]">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-white font-mono">
              Proof: Irreversible Information Loss in Rank-Deficient Layers
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#131B2E] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Proof Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
          {/* Matrix & Determinant */}
          <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#2A374F] space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold font-mono block">
              1. Linear Dependency & Vanishing Determinant:
            </span>
            <p>
              Consider the layer transformation matrix <MathView math="W_1" /> with linearly dependent rows (Row 2 = <MathView math="-2/3" /> × Row 1):
            </p>
            <div className="bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView
                math="W_1 = \begin{pmatrix} 1.5 & -1.5 \\ -1.0 & 1.0 \end{pmatrix} \implies \det(W_1) = (1.5)(1.0) - (-1.5)(-1.0) = 0"
                className="text-rose-400 font-bold"
              />
            </div>
            <p>
              Because <MathView math="\det(W_1) = 0" />, the matrix is <strong>singular and non-invertible</strong>.
            </p>
          </div>

          {/* Rank-Nullity Theorem */}
          <div className="bg-[#131B2E] p-3.5 rounded-xl border border-[#2A374F] space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold font-mono block">
              2. The Rank-Nullity Theorem & The Kernel (Null Space):
            </span>
            <p>
              By the fundamental <strong>Rank-Nullity Theorem</strong> of linear algebra:
            </p>
            <div className="bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView
                math="\dim(\mathbb{R}^2) = \text{rank}(W_1) + \text{nullity}(W_1) \implies 2 = 1 + \dim(\ker(W_1))"
                className="text-cyber-cyan font-bold"
              />
            </div>
            <p>
              Hence, <MathView math="\dim(\ker(W_1)) = 1" />. The kernel consists of an entire 1D line of vectors:
            </p>
            <div className="bg-[#0B101D] p-2 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView
                math="\ker(W_1) = \left\{ x \in \mathbb{R}^2 : W_1 x = 0 \right\} = \text{span}\left\{ \begin{pmatrix} 1 \\ 1 \end{pmatrix} \right\}"
                className="text-cyber-amber"
              />
            </div>
            <p>
              Every vector along the diagonal line <MathView math="x_1 = x_2" /> is annihilated to exactly <MathView math="\vec{0}" />.
            </p>
          </div>

          {/* Irreversibility Theorem */}
          <div className="bg-rose-950/30 p-3.5 rounded-xl border border-rose-500/50 space-y-2">
            <span className="text-[10px] text-rose-300 uppercase font-semibold font-mono block">
              3. Why Downstream Layers Can NEVER Recover Lost Data:
            </span>
            <p className="text-slate-200">
              Let <MathView math="x_A" /> (Class 0, Cyan) and <MathView math="x_B" /> (Class 1, Magenta) be any two distinct points in input space such that their difference lies in the kernel:
            </p>
            <div className="bg-[#0B101D] p-2 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView
                math="x_A - x_B \in \ker(W_1) \implies W_1(x_A - x_B) = 0 \implies W_1 x_A = W_1 x_B"
                className="text-rose-400 font-bold"
              />
            </div>
            <p>
              Now consider any arbitrary subsequent layers, whether deep neural network layers, arbitrary activations <MathView math="\sigma" />, or output weights <MathView math="W_2" />:
            </p>
            <div className="bg-[#0B101D] p-2 rounded-lg border border-[#1E2D4A] text-center font-mono">
              <MathView
                math="\hat{y}(x_A) = \sigma(W_2 \sigma(W_1 x_A + b_1) + b_2) = \sigma(W_2 \sigma(W_1 x_B + b_1) + b_2) = \hat{y}(x_B)"
                className="text-slate-100"
              />
            </div>
            <p className="font-semibold text-rose-300">
              The predictions for <MathView math="x_A" /> and <MathView math="x_B" /> are mathematically IDENTICAL. No training algorithm, no matter how many epochs or what optimizer is used, can ever separate these points again.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1E2D4A] bg-[#0B101D] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">GTBIT MathX Failure Mode Demonstration</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-cyan text-black font-bold hover:bg-cyber-cyan/90 transition-colors"
          >
            Acknowledge Proof
          </button>
        </div>
      </div>
    </div>
  );
};
