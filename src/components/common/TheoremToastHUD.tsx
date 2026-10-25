import React from 'react';
import { AlertOctagon, ZapOff, X, ArrowRight, FileText } from 'lucide-react';
import { MathView } from './MathView';

export interface TheoremToast {
  type: 'singular' | 'dead_relu';
  title: string;
  theoremText: string;
}

interface TheoremToastHUDProps {
  toast: TheoremToast | null;
  onClose: () => void;
  onOpenProofModal?: () => void;
}

export const TheoremToastHUD: React.FC<TheoremToastHUDProps> = ({
  toast,
  onClose,
  onOpenProofModal,
}) => {
  if (!toast) return null;

  const isSingular = toast.type === 'singular';

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-[92vw] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={`glass-hud px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ${
          isSingular
            ? 'border-rose-500/60 bg-rose-950/70 text-rose-100 shadow-rose-950/40'
            : 'border-amber-500/60 bg-amber-950/70 text-amber-100 shadow-amber-950/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isSingular
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-amber-500/20 border-amber-500 text-amber-300'
            }`}
          >
            {isSingular ? (
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            ) : (
              <ZapOff className="w-4 h-4 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest opacity-80">
              {toast.title}
            </span>
            <p className="text-xs font-sans text-slate-100 leading-tight">
              {toast.theoremText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSingular && onOpenProofModal && (
            <button
              onClick={onOpenProofModal}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-cyber-cyan" />
              Proof
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
