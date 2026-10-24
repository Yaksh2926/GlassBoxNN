import React from 'react';
import { Matrix2x2 } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { MathView } from '../common/MathView';
import { CircleDot, MoveRight, Layers } from 'lucide-react';

interface SVDInspectorProps {
  W1: Matrix2x2;
  svdStep: 0 | 1 | 2 | 3;
  onSetSvdStep: (step: 0 | 1 | 2 | 3) => void;
  showSVD: boolean;
  onToggleShowSVD: (show: boolean) => void;
}

export const SVDInspector: React.FC<SVDInspectorProps> = ({
  W1,
  svdStep,
  onSetSvdStep,
  showSVD,
  onToggleShowSVD,
}) => {
  const svd = LinearAlgebra.svd(W1);

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass">
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-1.5">
          <CircleDot className="w-3.5 h-3.5 text-cyber-magenta" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            SVD Geometric Decomposition
          </h3>
        </div>
        <button
          onClick={() => onToggleShowSVD(!showSVD)}
          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
            showSVD
              ? 'bg-cyber-magenta/20 text-cyber-magenta border-cyber-magenta'
              : 'bg-[#131B2E] text-slate-400 border-[#2A374F] hover:text-white'
          }`}
        >
          {showSVD ? 'SVD Mode: ACTIVE' : 'Enable SVD Mode'}
        </button>
      </div>

      <div className="text-[11px] text-slate-300 font-mono">
        <MathView
          math="W_1 = U \Sigma V^T = \begin{pmatrix} u_{11} & u_{12} \\ u_{21} & u_{22} \end{pmatrix} \begin{pmatrix} \sigma_1 & 0 \\ 0 & \sigma_2 \end{pmatrix} \begin{pmatrix} v_{11} & v_{21} \\ v_{12} & v_{22} \end{pmatrix}"
          block
          className="text-xs text-cyber-cyan"
        />
      </div>

      {/* SVD Step Buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Geometric Sequence:
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
          <button
            onClick={() => onSetSvdStep(0)}
            className={`p-1.5 rounded border text-center transition-all ${
              svdStep === 0
                ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-400 hover:text-white'
            }`}
          >
            Direct W₁
          </button>
          <button
            onClick={() => onSetSvdStep(1)}
            className={`p-1.5 rounded border text-center transition-all ${
              svdStep === 1
                ? 'bg-cyber-violet/25 border-cyber-violet text-cyber-violet font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-400 hover:text-white'
            }`}
          >
            1. Vᵀ Rotate
          </button>
          <button
            onClick={() => onSetSvdStep(2)}
            className={`p-1.5 rounded border text-center transition-all ${
              svdStep === 2
                ? 'bg-cyber-amber/25 border-cyber-amber text-cyber-amber font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-400 hover:text-white'
            }`}
          >
            2. Σ Stretch
          </button>
          <button
            onClick={() => onSetSvdStep(3)}
            className={`p-1.5 rounded border text-center transition-all ${
              svdStep === 3
                ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-400 hover:text-white'
            }`}
          >
            3. U Rotate
          </button>
        </div>
      </div>

      {/* Numerical Matrices Display */}
      <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono bg-[#0B101D] p-2 rounded-lg border border-[#1E2D4A]">
        {/* Matrix U */}
        <div className="border-r border-[#1E2D4A] pr-1.5">
          <span className="text-cyber-magenta font-bold block mb-1">Matrix U (Output Rotation)</span>
          <div className="text-slate-300">
            [{svd.U[0][0].toFixed(2)}, {svd.U[0][1].toFixed(2)}]
          </div>
          <div className="text-slate-300">
            [{svd.U[1][0].toFixed(2)}, {svd.U[1][1].toFixed(2)}]
          </div>
        </div>

        {/* Matrix Sigma */}
        <div className="border-r border-[#1E2D4A] px-1.5">
          <span className="text-cyber-amber font-bold block mb-1">Matrix Σ (Singular Stretches)</span>
          <div className="text-cyber-amber font-semibold">
            [{svd.singularValues[0].toFixed(2)}, 0.00]
          </div>
          <div className="text-cyber-amber font-semibold">
            [0.00, {svd.singularValues[1].toFixed(2)}]
          </div>
        </div>

        {/* Matrix V^T */}
        <div className="pl-1.5">
          <span className="text-cyber-violet font-bold block mb-1">Matrix Vᵀ (Input Rotation)</span>
          <div className="text-slate-300">
            [{svd.VT[0][0].toFixed(2)}, {svd.VT[0][1].toFixed(2)}]
          </div>
          <div className="text-slate-300">
            [{svd.VT[1][0].toFixed(2)}, {svd.VT[1][1].toFixed(2)}]
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 font-mono bg-[#131B2E] p-2 rounded border border-[#2A374F] leading-relaxed">
        <span className="text-cyber-cyan font-bold">Singular Value Theorem:</span> Every linear
        transformation decomposes into a rotation to align axes, an orthogonal stretching of the
        unit sphere into an ellipse with semi-axes <MathView math="\sigma_1, \sigma_2" className="text-[9px]" />, and a final rotation.
      </div>
    </div>
  );
};
