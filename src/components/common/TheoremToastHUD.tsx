import React from 'react';
import { AlertOctagon, ZapOff, X, FileText, CheckCircle2 } from 'lucide-react';
import { MathView } from './MathView';

export interface TheoremToast {
  type: 'singular' | 'dead_relu';
  title: string;
  theoremText: string;
  beginnerTitle?: string;
  beginnerText?: string;
  proofBadge?: string;
}

interface TheoremToastHUDProps {
  toast: TheoremToast | null;
  onClose: () => void;
  onOpenProofModal?: () => void;
  intuitionMode?: boolean;
}

export const TheoremToastHUD: React.FC<TheoremToastHUDProps> = ({
  toast,
  onClose,
  onOpenProofModal,
  intuitionMode = true,
}) => {
  if (!toast) return null;

  const isSingular = toast.type === 'singular';

  // Fallback to prompt-specified plain-English explainer strings
  const displayTitle = intuitionMode
    ? (toast.beginnerTitle || (isSingular ? '💥 Space Squashed Flat! (2D ➔ 1D Line)' : '🥶 Brain Freeze! (Zero Gradient Zone)'))
    : toast.title;

  const displayText = intuitionMode
    ? (toast.beginnerText || (isSingular
        ? 'You set the weights so both grid directions collapsed onto the exact same diagonal line. Once a 2D sheet of paper is squashed into a 1D string, the AI loses a whole dimension and can never separate the dots!'
        : 'All points got pushed into the negative zone where the ReLU fold is completely flat. On flat ground, a ball won\'t roll—so the slope (derivative) becomes 0, all compass nudges stop, and the AI freezes forever!'))
    : toast.theoremText;

  const proofBadge = toast.proofBadge || (isSingular
    ? 'det(W₁) = 0 ⟹ Rank(W₁) < 2 (Rank-Nullity Theorem)'
    : 'z ≤ 0 ⟹ ReLU\'(z) = 0 ⟹ ∇_W ℒ = 0 (Gradient Freeze)');

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92vw] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={`glass-hud px-4 py-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
          isSingular
            ? 'border-rose-500/60 bg-rose-950/80 text-rose-100 shadow-rose-950/40'
            : 'border-amber-500/60 bg-amber-950/80 text-amber-100 shadow-amber-950/40'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
              isSingular
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-amber-500/20 border-amber-500 text-amber-300'
            }`}
          >
            {isSingular ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : (
              <ZapOff className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {displayTitle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[#53D4F4]">
                {proofBadge}
              </span>
            </div>

            <p className="text-xs font-sans text-slate-200 leading-relaxed">
              {displayText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 mt-1 sm:mt-0">
          {isSingular && onOpenProofModal && (
            <button
              onClick={onOpenProofModal}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-mono font-bold text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-[#53D4F4]" />
              <span>Full Proof</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Dismiss Failure Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
