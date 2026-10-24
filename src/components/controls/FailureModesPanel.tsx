import React from 'react';
import {
  AlertTriangle,
  ZapOff,
  Minimize2,
  FileText,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { MathView } from '../common/MathView';

interface FailureModesPanelProps {
  onTriggerSingularMatrix: () => void;
  onTriggerDeadReLU: () => void;
  onOpenSingularProof: () => void;
  isSingularActive: boolean;
  isDeadReLUActive: boolean;
}

export const FailureModesPanel: React.FC<FailureModesPanelProps> = ({
  onTriggerSingularMatrix,
  onTriggerDeadReLU,
  onOpenSingularProof,
  isSingularActive,
  isDeadReLUActive,
}) => {
  return (
    <div className="bg-[#0E1524] rounded-xl border border-rose-500/40 p-3 space-y-3 shadow-glass relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-2">
        <div className="flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
              Mathematical Failure Modes
              <span className="text-[9px] px-1.5 py-0.2 bg-rose-950/80 border border-rose-500/50 text-rose-300 rounded font-normal">
                Judge Suite
              </span>
            </h3>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          Theoretical Stress-Tests
        </span>
      </div>

      <p className="text-[11px] text-slate-300 leading-tight">
        Interactive demonstrations proving fundamental mathematical theorems where deep neural networks collapse or fail to learn.
      </p>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Preset 1: Singular Matrix (det(W1) = 0) */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isSingularActive
              ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/50'
              : 'bg-[#131B2E] border-[#1E2D4A] hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Minimize2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-xs font-bold text-white font-mono">
                1. Singular Matrix (det(W₁) = 0)
              </span>
            </div>
            {isSingularActive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/50 font-mono font-bold animate-pulse shrink-0">
                ACTIVE
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-300 space-y-1.5 mb-2 font-mono">
            <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A] text-center">
              <MathView
                math="W_1 = \begin{pmatrix} 1.5 & -1.5 \\ -1.0 & 1.0 \end{pmatrix} \implies \det(W_1) = 0"
                className="text-[10.5px] text-rose-300"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight font-sans">
              Rows are linearly dependent (<MathView math="R_2 = -\frac{2}{3} R_1" />). Collapses <MathView math="\mathbb{R}^2" /> onto a 1D line; 1D kernel <MathView math="\ker(W_1)" /> destroys data irreversibly.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onTriggerSingularMatrix}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
                isSingularActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-700/60 hover:border-rose-500'
              }`}
            >
              <Minimize2 className="w-3 h-3" />
              Trigger Collapse Animation
            </button>

            <button
              onClick={onOpenSingularProof}
              title="View Rigorous Mathematical Proof"
              className="py-1.5 px-2.5 rounded text-[11px] font-mono bg-[#1E2D4A] hover:bg-[#2A3F66] text-slate-200 border border-slate-600/60 transition-colors flex items-center gap-1 shrink-0"
            >
              <FileText className="w-3 h-3 text-cyber-cyan" />
              Proof
            </button>
          </div>
        </div>

        {/* Preset 2: Vanishing Gradient / Dead ReLU */}
        <div
          className={`p-2.5 rounded-lg border transition-all ${
            isDeadReLUActive
              ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50'
              : 'bg-[#131B2E] border-[#1E2D4A] hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <ZapOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white font-mono">
                2. Vanishing Gradient / Dead ReLU
              </span>
            </div>
            {isDeadReLUActive && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-mono font-bold animate-pulse shrink-0">
                ACTIVE
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-300 space-y-1.5 mb-2 font-mono">
            <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A] text-center">
              <MathView
                math="b_1 = \begin{pmatrix} -3.5 \\ -3.5 \end{pmatrix} \implies z_1 \le 0 \implies \text{ReLU}'(z_1) = 0"
                className="text-[10.5px] text-amber-300"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight font-sans">
              All preactivations are negative. The local derivative is zeroed out in the chain rule, completely cutting off backprop and stalling gradient descent.
            </p>
          </div>

          <button
            onClick={onTriggerDeadReLU}
            className={`w-full py-1.5 px-2 rounded text-[11px] font-bold font-mono transition-all flex items-center justify-center gap-1.5 ${
              isDeadReLUActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40'
                : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-700/60 hover:border-amber-500'
            }`}
          >
            <ZapOff className="w-3 h-3" />
            Trigger Dead ReLU & Trace Chain Rule
          </button>
        </div>
      </div>
    </div>
  );
};
