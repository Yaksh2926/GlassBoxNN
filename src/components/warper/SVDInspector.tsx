import React from 'react';
import { Matrix2x2 } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { MathView } from '../common/MathView';
import { CircleDot, Play, Pause, RotateCcw, ArrowRight, Sparkles, Activity } from 'lucide-react';

interface SVDInspectorProps {
  W1: Matrix2x2;
  tauSVD: number;
  onChangeTauSVD: (updater: number | ((prevTau: number) => number)) => void;
  warperMode: 'homotopy' | 'svd';
  onChangeWarperMode: (mode: 'homotopy' | 'svd') => void;
}

export const SVDInspector: React.FC<SVDInspectorProps> = ({
  W1,
  tauSVD,
  onChangeTauSVD,
  warperMode,
  onChangeWarperMode,
}) => {
  const svd = LinearAlgebra.svd(W1);
  const det = LinearAlgebra.det(W1);
  const kappa = LinearAlgebra.conditionNumber(W1);

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-1.5">
          <CircleDot className="w-4 h-4 text-cyber-amber" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            SVD Geometric Decomposition (U Σ Vᵀ)
          </h3>
        </div>
        <button
          onClick={() => onChangeWarperMode(warperMode === 'svd' ? 'homotopy' : 'svd')}
          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
            warperMode === 'svd'
              ? 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber font-bold'
              : 'bg-[#131B2E] text-slate-400 border-[#2A374F] hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          {warperMode === 'svd' ? 'SVD Active on Canvas' : 'Focus Canvas on SVD'}
        </button>
      </div>

      {/* KaTeX Live Matrix Equation */}
      <div className="bg-[#0B101D] p-3 rounded-lg border border-[#1E2D4A] space-y-1.5 font-mono text-[11px] overflow-x-auto">
        <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center justify-between">
          <span>Live Matrix Factorization:</span>
          <span className="text-cyber-cyan">W₁ = U · Σ · Vᵀ</span>
        </div>
        <div className="text-center py-1">
          <MathView
            math={`\\begin{pmatrix} ${W1[0][0].toFixed(2)} & ${W1[0][1].toFixed(2)} \\\\ ${W1[1][0].toFixed(2)} & ${W1[1][1].toFixed(2)} \\end{pmatrix} = \\begin{pmatrix} ${svd.U[0][0].toFixed(2)} & ${svd.U[0][1].toFixed(2)} \\\\ ${svd.U[1][0].toFixed(2)} & ${svd.U[1][1].toFixed(2)} \\end{pmatrix} \\begin{pmatrix} ${svd.singularValues[0].toFixed(2)} & 0.00 \\\\ 0.00 & ${svd.singularValues[1].toFixed(2)} \\end{pmatrix} \\begin{pmatrix} ${svd.VT[0][0].toFixed(2)} & ${svd.VT[0][1].toFixed(2)} \\\\ ${svd.VT[1][0].toFixed(2)} & ${svd.VT[1][1].toFixed(2)} \\end{pmatrix}`}
            block
            className="text-xs text-slate-100"
          />
        </div>
      </div>

      {/* Sub-Scrubber Controls */}
      <div className="space-y-1.5 bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] font-mono text-xs">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-300 font-semibold uppercase">3-Stage SVD Sub-Scrubber:</span>
          <span className="text-cyber-amber font-bold">τ_svd = {tauSVD.toFixed(2)}</span>
        </div>

        <input
          type="range"
          min="0"
          max="3"
          step="0.01"
          value={tauSVD}
          onChange={e => {
            if (warperMode !== 'svd') onChangeWarperMode('svd');
            onChangeTauSVD(parseFloat(e.target.value));
          }}
          className="w-full slider-amber"
        />

        {/* 4 stage selector buttons */}
        <div className="grid grid-cols-4 gap-1 text-[9px] pt-1">
          <button
            onClick={() => {
              if (warperMode !== 'svd') onChangeWarperMode('svd');
              onChangeTauSVD(0.0);
            }}
            className={`p-1 rounded border text-center transition-all ${
              tauSVD === 0.0
                ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
                : 'bg-[#0B101D] border-[#1E2D4A] text-slate-400 hover:text-white'
            }`}
          >
            0: Circle (I)
          </button>
          <button
            onClick={() => {
              if (warperMode !== 'svd') onChangeWarperMode('svd');
              onChangeTauSVD(1.0);
            }}
            className={`p-1 rounded border text-center transition-all ${
              tauSVD > 0.0 && tauSVD <= 1.0
                ? 'bg-cyber-violet/25 border-cyber-violet text-cyber-violet font-bold'
                : 'bg-[#0B101D] border-[#1E2D4A] text-slate-400 hover:text-white'
            }`}
          >
            1: Vᵀ Rotate
          </button>
          <button
            onClick={() => {
              if (warperMode !== 'svd') onChangeWarperMode('svd');
              onChangeTauSVD(2.0);
            }}
            className={`p-1 rounded border text-center transition-all ${
              tauSVD > 1.0 && tauSVD <= 2.0
                ? 'bg-cyber-amber/25 border-cyber-amber text-cyber-amber font-bold'
                : 'bg-[#0B101D] border-[#1E2D4A] text-slate-400 hover:text-white'
            }`}
          >
            2: Σ Ellipse
          </button>
          <button
            onClick={() => {
              if (warperMode !== 'svd') onChangeWarperMode('svd');
              onChangeTauSVD(3.0);
            }}
            className={`p-1 rounded border text-center transition-all ${
              tauSVD > 2.0
                ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold'
                : 'bg-[#0B101D] border-[#1E2D4A] text-slate-400 hover:text-white'
            }`}
          >
            3: U Rotate
          </button>
        </div>
      </div>

      {/* 3 Matrix Cards with Explanations */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
        {/* Card 1: V^T */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            tauSVD <= 1.0
              ? 'bg-[#131B2E] border-cyber-violet shadow-violet-glow'
              : 'bg-[#0B101D] border-[#1E2D4A]'
          }`}
        >
          <span className="text-cyber-violet font-bold block mb-1">1. Matrix Vᵀ</span>
          <div className="text-slate-200">
            [{svd.VT[0][0].toFixed(2)}, {svd.VT[0][1].toFixed(2)}]
          </div>
          <div className="text-slate-200">
            [{svd.VT[1][0].toFixed(2)}, {svd.VT[1][1].toFixed(2)}]
          </div>
          <p className="text-[9px] text-slate-400 mt-1 leading-tight">
            Input space orthogonal rotation aligning canonical singular vectors.
          </p>
        </div>

        {/* Card 2: Sigma */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            tauSVD > 1.0 && tauSVD <= 2.0
              ? 'bg-[#131B2E] border-cyber-amber shadow-amber-glow'
              : 'bg-[#0B101D] border-[#1E2D4A]'
          }`}
        >
          <span className="text-cyber-amber font-bold block mb-1">2. Matrix Σ</span>
          <div className="text-cyber-amber font-semibold">
            [{svd.singularValues[0].toFixed(2)}, 0.00]
          </div>
          <div className="text-cyber-amber font-semibold">
            [0.00, {svd.singularValues[1].toFixed(2)}]
          </div>
          <p className="text-[9px] text-slate-400 mt-1 leading-tight">
            Diagonal stretching: Unit circle deforms into ellipse with semi-axes σ₁ & σ₂.
          </p>
        </div>

        {/* Card 3: U */}
        <div
          className={`p-2 rounded-lg border transition-all ${
            tauSVD > 2.0
              ? 'bg-[#131B2E] border-cyber-magenta shadow-magenta-glow'
              : 'bg-[#0B101D] border-[#1E2D4A]'
          }`}
        >
          <span className="text-cyber-magenta font-bold block mb-1">3. Matrix U</span>
          <div className="text-slate-200">
            [{svd.U[0][0].toFixed(2)}, {svd.U[0][1].toFixed(2)}]
          </div>
          <div className="text-slate-200">
            [{svd.U[1][0].toFixed(2)}, {svd.U[1][1].toFixed(2)}]
          </div>
          <p className="text-[9px] text-slate-400 mt-1 leading-tight">
            Output space orthogonal rotation orienting ellipse into final state.
          </p>
        </div>
      </div>

      {/* SVD Key Invariant Properties */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] font-mono text-[10px] space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Area Scaling |det(W₁)|:</span>
          <span className="text-cyber-cyan font-bold">{Math.abs(det).toFixed(3)} (= σ₁ · σ₂)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Condition Number κ(W₁):</span>
          <span className="text-cyber-amber font-bold">
            {kappa > 999 ? '> 999' : kappa.toFixed(2)} (= σ₁ / σ₂)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Ellipse Eccentricity e:</span>
          <span className="text-cyber-violet font-bold">
            {svd.singularValues[0] > 0
              ? Math.sqrt(Math.max(0, 1 - (svd.singularValues[1] / svd.singularValues[0]) ** 2)).toFixed(3)
              : '0.000'}
          </span>
        </div>
      </div>
    </div>
  );
};
