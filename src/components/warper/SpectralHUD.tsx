import React from 'react';
import { Matrix2x2 } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { MathView } from '../common/MathView';
import { Activity, AlertOctagon, Compass, ShieldAlert, Zap } from 'lucide-react';

interface SpectralHUDProps {
  W1: Matrix2x2;
}

export const SpectralHUD: React.FC<SpectralHUDProps> = ({ W1 }) => {
  const det = LinearAlgebra.det(W1);
  const trace = LinearAlgebra.trace(W1);
  const eigenRes = LinearAlgebra.eigen(W1);
  const svdRes = LinearAlgebra.svd(W1);
  const kappa = LinearAlgebra.conditionNumber(W1);

  const isRankCollapsed = Math.abs(det) < 0.02;
  const isIllConditioned = kappa > 25.0;

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass">
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
          Live Spectral HUD & Matrix Invariants
        </h3>
        <span className="text-[10px] font-mono text-slate-400">Layer 1 Transform</span>
      </div>

      {/* Rank Collapse Critical Warning Banner */}
      {isRankCollapsed && (
        <div className="bg-rose-950/50 border border-rose-500/80 rounded-lg p-2.5 flex items-start gap-2.5 text-rose-200 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight font-mono">
            <span className="font-bold text-rose-300 block">
              RANK COLLAPSE DETECTED: det(W₁) ≈ 0
            </span>
            2D input space has collapsed into a 1D line! Dimensionality is lost; Cover's theorem
            cannot separate classes along this collapsed direction.
          </div>
        </div>
      )}

      {/* Ill-conditioned warning */}
      {!isRankCollapsed && isIllConditioned && (
        <div className="bg-amber-950/40 border border-amber-500/80 rounded-lg p-2 flex items-start gap-2 text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[10px] font-mono leading-tight">
            <span className="font-bold text-amber-300 block">
              Ill-Conditioned Matrix (κ = {kappa.toFixed(1)})
            </span>
            Severe axis stretching creates narrow ravines in loss landscape, causing SGD oscillation.
          </div>
        </div>
      )}

      {/* Grid of Spectral Metrics */}
      <div className="grid grid-cols-3 gap-2 font-mono">
        {/* Metric 1: Determinant & Area Scaling */}
        <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F]">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">
            Determinant <MathView math="\det(W_1)" className="text-[10px] text-cyber-cyan" />
          </span>
          <div
            className={`text-sm font-bold ${
              isRankCollapsed ? 'text-rose-400' : 'text-cyber-cyan'
            }`}
          >
            {det.toFixed(3)}
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            Area Scale: {Math.abs(det).toFixed(2)}x
          </span>
        </div>

        {/* Metric 2: Trace */}
        <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F]">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">
            Trace <MathView math="\text{tr}(W_1)" className="text-[10px] text-cyber-magenta" />
          </span>
          <div className="text-sm font-bold text-cyber-magenta">{trace.toFixed(3)}</div>
          <span className="text-[9px] text-slate-400 block mt-0.5">Sum of Diag</span>
        </div>

        {/* Metric 3: Condition Number */}
        <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F]">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-1">
            Condition <MathView math="\kappa(W_1)" className="text-[10px] text-cyber-amber" />
          </span>
          <div
            className={`text-sm font-bold ${
              isIllConditioned ? 'text-amber-400' : 'text-cyber-amber'
            }`}
          >
            {kappa > 999 ? '> 999' : kappa.toFixed(2)}
          </div>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {kappa < 3 ? 'Isotropic' : 'Anisotropic'}
          </span>
        </div>
      </div>

      {/* Eigenvalues / Spectrum */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] font-mono text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-300 font-semibold uppercase flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyber-violet" />
            Eigenvalues <MathView math="\lambda_1, \lambda_2" className="text-cyber-violet text-[10px]" />
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
              eigenRes.isReal
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/50'
            }`}
          >
            {eigenRes.isReal ? 'Real Spectrum' : 'Complex Conjugate'}
          </span>
        </div>

        {eigenRes.isReal ? (
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A]">
              <span className="text-cyber-violet font-bold">λ₁ = </span>
              <span className="text-slate-100">
                {(eigenRes.values as [number, number])[0].toFixed(3)}
              </span>
            </div>
            <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A]">
              <span className="text-cyber-violet font-bold">λ₂ = </span>
              <span className="text-slate-100">
                {(eigenRes.values as [number, number])[1].toFixed(3)}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A] text-[11px] text-cyber-violet">
            λ₁,₂ = {(eigenRes.values as { real: number; imag: number }).real.toFixed(3)} ±{' '}
            {(eigenRes.values as { real: number; imag: number }).imag.toFixed(3)}i
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Rotational transformation in phase space (spiral trajectories)
            </span>
          </div>
        )}
      </div>

      {/* SVD Singular Values Preview */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] font-mono text-xs">
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold mb-1">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyber-cyan" />
            Singular Values <MathView math="\sigma_1, \sigma_2" className="text-cyber-cyan text-[10px]" />
          </span>
          <span className="text-slate-400 text-[9px]">Semi-Axes of Ellipse</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A]">
            <span className="text-cyber-cyan font-bold">σ₁ = </span>
            <span className="text-slate-100">{svdRes.singularValues[0].toFixed(3)}</span>
          </div>
          <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A]">
            <span className="text-cyber-cyan font-bold">σ₂ = </span>
            <span className="text-slate-100">{svdRes.singularValues[1].toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
