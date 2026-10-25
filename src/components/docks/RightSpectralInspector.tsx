import React, { useState } from 'react';
import { Matrix2x2 } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { MathView } from '../common/MathView';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  CircleDot,
  Radio,
  Flame,
} from 'lucide-react';

interface RightSpectralInspectorProps {
  W1: Matrix2x2;
  tauSVD: number;
  onChangeTauSVD: (updater: number | ((prevTau: number) => number)) => void;
  warperMode: 'homotopy' | 'svd';
  onChangeWarperMode: (mode: 'homotopy' | 'svd') => void;
}

export const RightSpectralInspector: React.FC<RightSpectralInspectorProps> = ({
  W1,
  tauSVD,
  onChangeTauSVD,
  warperMode,
  onChangeWarperMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const det = LinearAlgebra.det(W1);
  const trace = LinearAlgebra.trace(W1);
  const kappa = LinearAlgebra.conditionNumber(W1);
  const eigenRes = LinearAlgebra.eigen(W1);
  const svd = LinearAlgebra.svd(W1);

  const isSingular = Math.abs(det) < 0.02;
  const isIllConditioned = kappa > 25.0;

  // Smoothly animate tauSVD to target step: 0, 1, 2, 3
  const animateToSVDStage = (targetTau: number) => {
    if (warperMode !== 'svd') onChangeWarperMode('svd');

    const startTau = tauSVD;
    const startTime = performance.now();
    const duration = 500;

    const stepAnim = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth ease
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      onChangeTauSVD(startTau + (targetTau - startTau) * ease);

      if (progress < 1.0) {
        requestAnimationFrame(stepAnim);
      }
    };

    requestAnimationFrame(stepAnim);
  };

  // Complex plane radar coordinates calculation
  // Radius of unit circle in SVG = 24px, Center = (45, 45)
  const center = 45;
  const unitRadius = 24;

  let eigenPoints: { x: number; y: number; label: string; isReal: boolean }[] = [];
  if (eigenRes.isReal) {
    const vals = eigenRes.values as [number, number];
    eigenPoints = [
      {
        x: Math.max(5, Math.min(85, center + vals[0] * unitRadius)),
        y: center,
        label: `λ₁=${vals[0].toFixed(2)}`,
        isReal: true,
      },
      {
        x: Math.max(5, Math.min(85, center + vals[1] * unitRadius)),
        y: center,
        label: `λ₂=${vals[1].toFixed(2)}`,
        isReal: true,
      },
    ];
  } else {
    const c = eigenRes.values as { real: number; imag: number };
    eigenPoints = [
      {
        x: Math.max(5, Math.min(85, center + c.real * unitRadius)),
        y: Math.max(5, Math.min(85, center - c.imag * unitRadius)),
        label: `λ₁`,
        isReal: false,
      },
      {
        x: Math.max(5, Math.min(85, center + c.real * unitRadius)),
        y: Math.max(5, Math.min(85, center + c.imag * unitRadius)),
        label: `λ₂`,
        isReal: false,
      },
    ];
  }

  // Singular values for SVD ellipse preview
  const s1 = Math.max(0.1, svd.singularValues[0]);
  const s2 = Math.max(0.1, svd.singularValues[1]);
  const maxS = Math.max(s1, s2, 1);
  const rx1 = Math.min(16, (s1 / maxS) * 16);
  const ry1 = Math.min(16, (s2 / maxS) * 16);

  return (
    <aside
      className={`fixed right-4 top-20 bottom-24 z-30 flex transition-all duration-300 ease-out select-none ${
        isCollapsed ? 'translate-x-[calc(100%-16px)]' : 'translate-x-0'
      }`}
    >
      {/* Collapse / Expand Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Expand Spectral Inspector' : 'Collapse Spectral Inspector'}
        className="self-center mr-1 w-5 h-12 glass-hud rounded-l-lg flex items-center justify-center text-slate-400 hover:text-white border-r-0 border-white/[0.08] hover:border-cyber-cyan/50 transition-colors shadow-lg"
      >
        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      <div className="w-88 h-full flex flex-col glass-hud rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
        {/* Dock Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-amber shadow-amber-glow" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase">
              02 // SPECTRAL & SVD
            </span>
          </div>
          <button
            onClick={() => onChangeWarperMode(warperMode === 'svd' ? 'homotopy' : 'svd')}
            className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              warperMode === 'svd'
                ? 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber font-bold'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.06] hover:text-white'
            }`}
          >
            {warperMode === 'svd' ? 'SVD Canvas Focus' : 'SVD Canvas'}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* SECTION 1: 3-METRIC TELEMETRY STRIP */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
                SPECTRAL INVARIANTS
              </span>
              <span className="text-[9px] font-mono text-slate-500">Live Invariants</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 font-mono">
              {/* det(W1) */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex flex-col justify-between">
                <span className="text-[8.5px] uppercase tracking-wider text-slate-400">det(W₁)</span>
                <span
                  className={`text-sm font-bold tabular-nums my-0.5 ${
                    isSingular ? 'text-rose-400 animate-pulse' : 'text-cyber-cyan'
                  }`}
                >
                  {det.toFixed(2)}
                </span>
                <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyber-cyan rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.abs(det) * 33)}%` }}
                  />
                </div>
                <span className="text-[8px] text-slate-400 mt-1 uppercase">
                  {isSingular ? 'COLLAPSED' : `Area ${Math.abs(det).toFixed(1)}x`}
                </span>
              </div>

              {/* tr(W1) */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex flex-col justify-between">
                <span className="text-[8.5px] uppercase tracking-wider text-slate-400">tr(W₁)</span>
                <span className="text-sm font-bold text-cyber-magenta tabular-nums my-0.5">
                  {trace.toFixed(2)}
                </span>
                <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyber-magenta rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.abs(trace) * 25)}%` }}
                  />
                </div>
                <span className="text-[8px] text-slate-400 mt-1 uppercase">λ₁ + λ₂</span>
              </div>

              {/* kappa(W1) */}
              <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] flex flex-col justify-between">
                <span className="text-[8.5px] uppercase tracking-wider text-slate-400">κ(W₁)</span>
                <span
                  className={`text-sm font-bold tabular-nums my-0.5 ${
                    isIllConditioned ? 'text-amber-400' : 'text-cyber-amber'
                  }`}
                >
                  {kappa > 99 ? '> 99' : kappa.toFixed(1)}
                </span>
                <div className="w-full bg-white/[0.06] h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isIllConditioned ? 'bg-amber-500' : 'bg-cyber-amber'
                    }`}
                    style={{ width: `${Math.min(100, (kappa / 20) * 100)}%` }}
                  />
                </div>
                <span className="text-[8px] text-slate-400 mt-1 uppercase">
                  {kappa < 3 ? 'Isotropic' : 'Ill-Cond'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: COMPLEX PLANE EIGENVALUE RADAR (MINI GRAPHIC) */}
          <div className="space-y-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
                EIGENVALUE COMPLEX RADAR
              </span>
              <span
                className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  eigenRes.isReal
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet/40'
                }`}
              >
                {eigenRes.isReal ? 'REAL SPECTRUM' : 'ROTATIONAL (COMPLEX)'}
              </span>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
              {/* 90x90px Miniature Complex Plane SVG */}
              <div className="relative w-[90px] h-[90px] shrink-0 bg-[#06080E] rounded-lg border border-white/[0.08] overflow-hidden">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  {/* Grid circle (unit circle |z| = 1) */}
                  <circle
                    cx="45"
                    cy="45"
                    r={unitRadius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />

                  {/* Horizontal Real Axis */}
                  <line
                    x1="4"
                    y1="45"
                    x2="86"
                    y2="45"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                  />
                  {/* Vertical Imag Axis */}
                  <line
                    x1="45"
                    y1="4"
                    x2="45"
                    y2="86"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1"
                  />

                  {/* Axis indicators */}
                  <text x="82" y="42" fill="#64748B" fontSize="6.5" fontFamily="monospace">
                    Re
                  </text>
                  <text x="47" y="10" fill="#64748B" fontSize="6.5" fontFamily="monospace">
                    Im
                  </text>

                  {/* If complex conjugate, draw vertical connecting line */}
                  {!eigenRes.isReal && eigenPoints.length === 2 && (
                    <line
                      x1={eigenPoints[0].x}
                      y1={eigenPoints[0].y}
                      x2={eigenPoints[1].x}
                      y2={eigenPoints[1].y}
                      stroke="rgba(139, 92, 246, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}

                  {/* Eigenvalue Points */}
                  {eigenPoints.map((pt, idx) => (
                    <g key={idx}>
                      {/* Outer pulse halo */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill={pt.isReal ? 'rgba(16, 185, 129, 0.25)' : 'rgba(139, 92, 246, 0.25)'}
                      />
                      {/* Core dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="2.5"
                        fill={pt.isReal ? '#10B981' : '#8B5CF6'}
                      />
                    </g>
                  ))}
                </svg>
              </div>

              {/* Numerical readout next to radar */}
              <div className="flex-1 font-mono text-[11px] space-y-1">
                {eigenRes.isReal ? (
                  <>
                    <div className="flex items-center justify-between text-slate-200">
                      <span className="text-emerald-400 font-bold">λ₁</span>
                      <span className="tabular-nums font-medium">
                        {(eigenRes.values as [number, number])[0].toFixed(3)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-200">
                      <span className="text-emerald-400 font-bold">λ₂</span>
                      <span className="tabular-nums font-medium">
                        {(eigenRes.values as [number, number])[1].toFixed(3)}
                      </span>
                    </div>
                    <span className="text-[8.5px] text-slate-400 block pt-0.5 leading-tight font-sans">
                      Collinear scaling along invariant eigen-directions.
                    </span>
                  </>
                ) : (
                  <>
                    <div className="text-cyber-violet font-bold text-[10.5px]">
                      {(eigenRes.values as { real: number; imag: number }).real.toFixed(2)} ±{' '}
                      {(eigenRes.values as { real: number; imag: number }).imag.toFixed(2)}i
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>Modulus |λ|:</span>
                      <span className="text-white font-bold tabular-nums">
                        {Math.hypot(
                          (eigenRes.values as { real: number; imag: number }).real,
                          (eigenRes.values as { real: number; imag: number }).imag
                        ).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[8.5px] text-slate-400 block leading-tight font-sans">
                      Generates 2D phase-plane rotation.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: VISUAL SVD PIPELINE (W1 = U \Sigma V^T) */}
          <div className="space-y-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
                SVD GEOMETRIC FACTORIZATION
              </span>
              <span className="text-[9px] font-mono text-cyber-amber">W₁ = U Σ Vᵀ</span>
            </div>

            {/* Clean KaTeX Matrices representation without duplicate text */}
            <div className="p-2 rounded-xl bg-black/40 border border-white/[0.05] overflow-x-auto text-center font-mono">
              <MathView
                math={`\\begin{pmatrix} ${W1[0][0].toFixed(1)} & ${W1[0][1].toFixed(1)} \\\\ ${W1[1][0].toFixed(1)} & ${W1[1][1].toFixed(1)} \\end{pmatrix} = \\begin{pmatrix} ${svd.U[0][0].toFixed(1)} & ${svd.U[0][1].toFixed(1)} \\\\ ${svd.U[1][0].toFixed(1)} & ${svd.U[1][1].toFixed(1)} \\end{pmatrix} \\begin{pmatrix} ${svd.singularValues[0].toFixed(1)} & 0 \\\\ 0 & ${svd.singularValues[1].toFixed(1)} \\end{pmatrix} \\begin{pmatrix} ${svd.VT[0][0].toFixed(1)} & ${svd.VT[0][1].toFixed(1)} \\\\ ${svd.VT[1][0].toFixed(1)} & ${svd.VT[1][1].toFixed(1)} \\end{pmatrix}`}
                className="text-[10.5px] text-slate-200"
              />
            </div>

            {/* 4-Stage Miniature SVG Visual Strip */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 block">
                Click step to animate main canvas:
              </span>

              <div className="grid grid-cols-4 gap-1 font-mono text-[9px]">
                {/* Stage 1: Unit Circle I */}
                <button
                  onClick={() => animateToSVDStage(0.0)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    tauSVD === 0.0
                      ? 'bg-cyber-cyan/20 border-cyber-cyan shadow-cyan-glow text-white'
                      : 'bg-[#10141F] border-white/[0.06] hover:border-white/20 text-slate-400'
                  }`}
                >
                  <svg viewBox="0 0 32 32" className="w-6 h-6">
                    <circle cx="16" cy="16" r="10" stroke="#00F5D4" strokeWidth="1.5" fill="none" />
                    <line x1="16" y1="16" x2="24" y2="16" stroke="#10B981" strokeWidth="1.5" />
                    <line x1="16" y1="16" x2="16" y2="8" stroke="#F59E0B" strokeWidth="1.5" />
                  </svg>
                  <span className="font-bold">01 // I</span>
                  <span className="text-[7.5px] text-slate-400">Unit Circle</span>
                </button>

                {/* Stage 2: Rotated V^T */}
                <button
                  onClick={() => animateToSVDStage(1.0)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    tauSVD > 0.0 && tauSVD <= 1.0
                      ? 'bg-cyber-violet/25 border-cyber-violet shadow-violet-glow text-white'
                      : 'bg-[#10141F] border-white/[0.06] hover:border-white/20 text-slate-400'
                  }`}
                >
                  <svg viewBox="0 0 32 32" className="w-6 h-6">
                    <circle cx="16" cy="16" r="10" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
                    <line x1="16" y1="16" x2="22" y2="10" stroke="#10B981" strokeWidth="1.5" />
                    <line x1="16" y1="16" x2="10" y2="10" stroke="#F59E0B" strokeWidth="1.5" />
                  </svg>
                  <span className="font-bold">02 // Vᵀ</span>
                  <span className="text-[7.5px] text-slate-400">Rotation</span>
                </button>

                {/* Stage 3: Stretched Ellipse Sigma */}
                <button
                  onClick={() => animateToSVDStage(2.0)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    tauSVD > 1.0 && tauSVD <= 2.0
                      ? 'bg-cyber-amber/25 border-cyber-amber shadow-amber-glow text-white'
                      : 'bg-[#10141F] border-white/[0.06] hover:border-white/20 text-slate-400'
                  }`}
                >
                  <svg viewBox="0 0 32 32" className="w-6 h-6">
                    <ellipse
                      cx="16"
                      cy="16"
                      rx={rx1}
                      ry={ry1}
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <line x1="16" y1="16" x2={16 + rx1} y2="16" stroke="#F59E0B" strokeWidth="1.5" />
                    <line x1="16" y1="16" x2="16" y2={16 - ry1} stroke="#8B5CF6" strokeWidth="1.5" />
                  </svg>
                  <span className="font-bold">03 // Σ</span>
                  <span className="text-[7.5px] text-slate-400">Stretch</span>
                </button>

                {/* Stage 4: Final U */}
                <button
                  onClick={() => animateToSVDStage(3.0)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    tauSVD > 2.0
                      ? 'bg-cyber-magenta/25 border-cyber-magenta shadow-magenta-glow text-white'
                      : 'bg-[#10141F] border-white/[0.06] hover:border-white/20 text-slate-400'
                  }`}
                >
                  <svg viewBox="0 0 32 32" className="w-6 h-6">
                    <g transform="rotate(35 16 16)">
                      <ellipse
                        cx="16"
                        cy="16"
                        rx={rx1}
                        ry={ry1}
                        stroke="#FF2A85"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <line x1="16" y1="16" x2={16 + rx1} y2="16" stroke="#FF2A85" strokeWidth="1.5" />
                    </g>
                  </svg>
                  <span className="font-bold">04 // U</span>
                  <span className="text-[7.5px] text-slate-400">Orientation</span>
                </button>
              </div>
            </div>

            {/* Live Singular Values readout */}
            <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[10px]">
              <div className="bg-black/30 p-1.5 rounded-lg border border-white/[0.05] flex items-center justify-between">
                <span className="text-cyber-cyan font-bold">σ₁:</span>
                <span className="text-white font-medium tabular-nums">
                  {svd.singularValues[0].toFixed(3)}
                </span>
              </div>
              <div className="bg-black/30 p-1.5 rounded-lg border border-white/[0.05] flex items-center justify-between">
                <span className="text-cyber-cyan font-bold">σ₂:</span>
                <span className="text-white font-medium tabular-nums">
                  {svd.singularValues[1].toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
