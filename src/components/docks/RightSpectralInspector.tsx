import React, { useState } from 'react';
import { Matrix2x2, Point2D, NetworkWeights } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { Activations } from '../../math/activations';
import { MathView } from '../common/MathView';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  BookOpen,
  Layers,
  CircleDot,
  Radio,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface RightSpectralInspectorProps {
  W1: Matrix2x2;
  weights?: NetworkWeights;
  selectedPoint?: Point2D | null;
  onClearSelectedPoint?: () => void;
  tauSVD: number;
  onChangeTauSVD: (updater: number | ((prevTau: number) => number)) => void;
  warperMode: 'homotopy' | 'svd';
  onChangeWarperMode: (mode: 'homotopy' | 'svd') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const RightSpectralInspector: React.FC<RightSpectralInspectorProps> = ({
  W1,
  weights,
  selectedPoint = null,
  onClearSelectedPoint,
  tauSVD,
  onChangeTauSVD,
  warperMode,
  onChangeWarperMode,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const collapsed = isCollapsed || internalCollapsed;

  const det = LinearAlgebra.det(W1);
  const trace = LinearAlgebra.trace(W1);
  const kappa = LinearAlgebra.conditionNumber(W1);
  const eigenRes = LinearAlgebra.eigen(W1);
  const svd = LinearAlgebra.svd(W1);

  const isSingular = Math.abs(det) < 0.02;
  const isIllConditioned = kappa > 25.0;

  // Selected Point Computations
  let pointTelemetry = null;
  if (selectedPoint && weights) {
    const z1_0 = weights.W1[0][0] * selectedPoint.x + weights.W1[0][1] * selectedPoint.y + weights.b1[0];
    const z1_1 = weights.W1[1][0] * selectedPoint.x + weights.W1[1][1] * selectedPoint.y + weights.b1[1];
    const a1_0 = Activations.fn(z1_0, weights.activation);
    const a1_1 = Activations.fn(z1_1, weights.activation);
    const z2 = weights.W2[0] * a1_0 + weights.W2[1] * a1_1 + weights.b2;
    const yHat = Activations.fn(z2, 'sigmoid');
    const predClass = yHat >= 0.5 ? 1 : 0;
    const isCorrect = predClass === selectedPoint.label;
    const bceLoss =
      selectedPoint.label === 1
        ? -Math.log(Math.max(1e-7, yHat))
        : -Math.log(Math.max(1e-7, 1 - yHat));

    pointTelemetry = {
      x: selectedPoint.x,
      y: selectedPoint.y,
      label: selectedPoint.label,
      z1: [z1_0, z1_1],
      a1: [a1_0, a1_1],
      z2,
      yHat,
      predClass,
      isCorrect,
      bceLoss,
    };
  }

  // SVD stage jump helper
  const animateToSVDStage = (targetTau: number) => {
    if (warperMode !== 'svd') onChangeWarperMode('svd');
    onChangeTauSVD(targetTau);
  };

  // Complex plane radar coordinates
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

  return (
    <aside
      className={`fixed right-3 top-16 bottom-20 z-30 flex transition-all duration-300 ease-out select-none ${
        collapsed ? 'translate-x-[calc(100%-12px)]' : 'translate-x-0'
      }`}
    >
      {/* Collapse Handle */}
      <button
        onClick={() => {
          if (onToggleCollapse) onToggleCollapse();
          else setInternalCollapsed(!internalCollapsed);
        }}
        className="self-center mr-0.5 w-4 h-10 rounded-l-md border border-r-0 border-[#29374B] bg-[#111A2A] hover:bg-[#182438] text-[#9DAFC3] hover:text-[#F4F7FB] flex items-center justify-center transition-colors shadow-md"
        title={collapsed ? 'Expand Inspector' : 'Collapse Inspector'}
      >
        {collapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      <div className="w-[275px] h-full flex flex-col rounded-xl overflow-hidden border border-[#29374B] bg-[#111A2A]/95 backdrop-blur-md shadow-xl text-[#F4F7FB]">
        {/* Dock Header */}
        <div className="px-3.5 py-2.5 border-b border-[#29374B] flex items-center justify-between bg-[#0B1020]/60">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#F7C76B]" />
            <span className="text-xs font-semibold tracking-wide text-[#F4F7FB]">
              MATHEMATICAL INSPECTOR
            </span>
          </div>
          <button
            onClick={() => onChangeWarperMode(warperMode === 'svd' ? 'homotopy' : 'svd')}
            className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
              warperMode === 'svd'
                ? 'bg-[#F7C76B]/20 text-[#F7C76B] border-[#F7C76B] font-bold'
                : 'bg-[#182438] text-[#9DAFC3] border-[#29374B] hover:text-[#F4F7FB]'
            }`}
          >
            {warperMode === 'svd' ? 'SVD Active' : 'SVD Mode'}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
          {/* CONTEXT SECTION: SELECTED POINT TELEMETRY (IF ACTIVE) */}
          {pointTelemetry ? (
            <div className="p-2.5 rounded-lg bg-[#0B1020] border border-[#53D4F4]/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#53D4F4] font-semibold flex items-center gap-1">
                  <Target className="w-3 h-3" /> SELECTED DATUM
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold flex items-center gap-1 ${
                    pointTelemetry.isCorrect
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : 'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}
                >
                  {pointTelemetry.isCorrect ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                  {pointTelemetry.isCorrect ? 'Correct' : 'Misclassified'}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-[#9DAFC3]">
                  <span>Input (x₁, x₂)</span>
                  <span className="text-[#F4F7FB]">({pointTelemetry.x.toFixed(2)}, {pointTelemetry.y.toFixed(2)})</span>
                </div>
                <div className="flex justify-between text-[#9DAFC3]">
                  <span>Pre-act z₁</span>
                  <span className="text-[#53D4F4]">[{pointTelemetry.z1[0].toFixed(2)}, {pointTelemetry.z1[1].toFixed(2)}]</span>
                </div>
                <div className="flex justify-between text-[#9DAFC3]">
                  <span>Post-act a₁</span>
                  <span className="text-[#F078C5]">[{pointTelemetry.a1[0].toFixed(2)}, {pointTelemetry.a1[1].toFixed(2)}]</span>
                </div>
                <div className="flex justify-between text-[#9DAFC3]">
                  <span>Output ŷ (Prob)</span>
                  <span className="text-[#F7C76B] font-bold">{(pointTelemetry.yHat * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-[#9DAFC3]">
                  <span>Individual BCE</span>
                  <span className="text-[#EF4444]">{pointTelemetry.bceLoss.toFixed(4)}</span>
                </div>
              </div>

              {onClearSelectedPoint && (
                <button
                  onClick={onClearSelectedPoint}
                  className="w-full py-1 text-[9px] font-mono text-center text-[#9DAFC3] hover:text-[#F4F7FB] border border-[#29374B] rounded bg-[#182438]"
                >
                  Deselect Point
                </button>
              )}
            </div>
          ) : null}

          {/* SECTION 1: SPECTRAL INVARIANTS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DAFC3] font-semibold">
                Spectral Invariants
              </span>
              <span className="text-[9px] font-mono text-[#53D4F4]">W₁ ∈ ℝ²ˣ²</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              {/* det(W1) */}
              <div className="p-2 rounded-lg bg-[#0B1020] border border-[#29374B] flex flex-col justify-between">
                <span className="text-[#9DAFC3] block">det(W₁)</span>
                <span
                  className={`text-sm font-bold tabular-nums my-0.5 ${
                    isSingular ? 'text-[#EF4444] animate-pulse' : 'text-[#53D4F4]'
                  }`}
                >
                  {det.toFixed(2)}
                </span>
                <span className="text-[8px] text-[#9DAFC3] uppercase">
                  {isSingular ? 'COLLAPSED' : `Area ${Math.abs(det).toFixed(1)}x`}
                </span>
              </div>

              {/* tr(W1) */}
              <div className="p-2 rounded-lg bg-[#0B1020] border border-[#29374B] flex flex-col justify-between">
                <span className="text-[#9DAFC3] block">tr(W₁)</span>
                <span className="text-sm font-bold text-[#F078C5] tabular-nums my-0.5">
                  {trace.toFixed(2)}
                </span>
                <span className="text-[8px] text-[#9DAFC3] uppercase">λ₁ + λ₂</span>
              </div>

              {/* kappa(W1) */}
              <div className="p-2 rounded-lg bg-[#0B1020] border border-[#29374B] flex flex-col justify-between">
                <span className="text-[#9DAFC3] block">κ(W₁)</span>
                <span
                  className={`text-sm font-bold tabular-nums my-0.5 ${
                    isIllConditioned ? 'text-[#F7C76B]' : 'text-[#53D4F4]'
                  }`}
                >
                  {kappa > 99 ? '> 99' : kappa.toFixed(1)}
                </span>
                <span className="text-[8px] text-[#9DAFC3] uppercase">
                  {kappa < 3 ? 'Isotropic' : 'Ill-Cond'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: COMPLEX EIGENVALUE RADAR */}
          <div className="space-y-1.5 pt-2 border-t border-[#29374B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DAFC3] font-semibold">
                Eigenvalue Spectrum
              </span>
              <span
                className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                  eigenRes.isReal
                    ? 'bg-[#10B981]/20 text-[#10B981]'
                    : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                }`}
              >
                {eigenRes.isReal ? 'Real Spectrum' : 'Rotational (ℂ)'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0B1020] border border-[#29374B]">
              {/* Miniature SVG Radar */}
              <div className="relative w-[75px] h-[75px] shrink-0 bg-[#0B1020] rounded border border-[#29374B] overflow-hidden">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle
                    cx="45"
                    cy="45"
                    r={unitRadius}
                    fill="none"
                    stroke="#29374B"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <line x1="4" y1="45" x2="86" y2="45" stroke="#29374B" strokeWidth="1" />
                  <line x1="45" y1="4" x2="45" y2="86" stroke="#29374B" strokeWidth="1" />
                  <text x="80" y="42" fill="#9DAFC3" fontSize="6" fontFamily="monospace">Re</text>
                  <text x="47" y="10" fill="#9DAFC3" fontSize="6" fontFamily="monospace">Im</text>

                  {eigenPoints.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="4" fill={pt.isReal ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'} />
                      <circle cx={pt.x} cy={pt.y} r="2" fill={pt.isReal ? '#10B981' : '#8B5CF6'} />
                    </g>
                  ))}
                </svg>
              </div>

              <div className="flex-1 font-mono text-[10px] space-y-1">
                {eigenRes.isReal ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#9DAFC3]">λ₁ (Real):</span>
                      <span className="text-[#10B981] font-bold">{(eigenRes.values as [number, number])[0].toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9DAFC3]">λ₂ (Real):</span>
                      <span className="text-[#10B981] font-bold">{(eigenRes.values as [number, number])[1].toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#9DAFC3]">Real Part:</span>
                      <span className="text-[#8B5CF6]">{(eigenRes.values as any).real.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9DAFC3]">Imag Part:</span>
                      <span className="text-[#8B5CF6]">±{(eigenRes.values as any).imag.toFixed(2)}i</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: 4-STAGE SVD DECOMPOSITION */}
          <div className="space-y-1.5 pt-2 border-t border-[#29374B]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9DAFC3] font-semibold">
                SVD: W₁ = U Σ Vᵀ
              </span>
              <span className="text-[9px] font-mono text-[#F7C76B]">
                σ₁: {svd.singularValues[0].toFixed(2)} | σ₂: {svd.singularValues[1].toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
              {[
                { stage: 0, label: '0. I', desc: 'Unit Circle' },
                { stage: 1, label: '1. Vᵀ', desc: 'Rotation' },
                { stage: 2, label: '2. Σ', desc: 'Stretching' },
                { stage: 3, label: '3. U', desc: 'Output Rot' },
              ].map(s => (
                <button
                  key={s.stage}
                  onClick={() => animateToSVDStage(s.stage)}
                  className={`py-1 rounded border transition-all text-center ${
                    warperMode === 'svd' && Math.round(tauSVD) === s.stage
                      ? 'border-[#F7C76B] bg-[#182438] text-[#F7C76B] font-bold'
                      : 'border-[#29374B] bg-[#111A2A] text-[#9DAFC3] hover:text-[#F4F7FB]'
                  }`}
                  title={s.desc}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 4: PROGRESSIVE DISCLOSURE — ADVANCED MATH DERIVATIONS */}
          <div className="pt-2 border-t border-[#29374B]">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#182438] border border-[#29374B] text-[10px] font-mono text-[#9DAFC3] hover:text-[#F4F7FB] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#53D4F4]" />
                <span>ADVANCED MATHEMATICAL PROOFS</span>
              </span>
              {isAdvancedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {isAdvancedOpen && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#0B1020] border border-[#29374B] text-[10px] leading-relaxed space-y-2 text-[#9DAFC3] font-mono animate-in fade-in duration-150">
                <div>
                  <strong className="text-[#F4F7FB] block">Rank-Nullity Theorem:</strong>
                  <span>dim(V) = rank(W₁) + nullity(W₁) = 2</span>
                  <p className="mt-0.5 text-[#9DAFC3] text-[9.5px]">
                    If det(W₁) = 0, nullity ≥ 1, collapsing range dimension to 1.
                  </p>
                </div>

                <div className="pt-1 border-t border-[#29374B]/50">
                  <strong className="text-[#F4F7FB] block">Cover's Theorem (1965):</strong>
                  <span>Non-linear projection untangles XOR into linear separability.</span>
                </div>

                <div className="pt-1 border-t border-[#29374B]/50">
                  <strong className="text-[#F4F7FB] block">Characteristic Equation:</strong>
                  <span>λ² - tr(W₁)λ + det(W₁) = 0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
