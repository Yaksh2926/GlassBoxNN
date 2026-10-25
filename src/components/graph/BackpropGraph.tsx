import React, { useState } from 'react';
import { Point2D, NetworkWeights, ChainRuleBreakdown } from '../../math/types';
import { NeuralEngine } from '../../math/neuralEngine';
import { Activations } from '../../math/activations';
import { MathView } from '../common/MathView';
import { GitBranch, AlertTriangle, Sparkles, Activity, Radio, ArrowRight, ArrowLeft } from 'lucide-react';

interface BackpropGraphProps {
  weights: NetworkWeights;
  dataset: Point2D[];
  className?: string;
}

export const BackpropGraph: React.FC<BackpropGraphProps> = ({
  weights,
  dataset,
  className = '',
}) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [hoveredWeight, setHoveredWeight] = useState<ChainRuleBreakdown['weightKey']>('W1_00');
  const [pulseMode, setPulseMode] = useState<'both' | 'forward' | 'backward'>('both');

  const currentSample = dataset[selectedSampleIndex] || dataset[0] || { x: 1, y: 1, label: 0 };

  // Calculate live chain rule breakdown for the current sample & hovered weight
  const breakdown = NeuralEngine.deriveChainRule(currentSample, weights, hoveredWeight);

  // Check health for dead ReLU / saturation across dataset
  const allOutputs = dataset.map(pt => NeuralEngine.forward(weights, [pt.x, pt.y]));
  const z1_0_vals = allOutputs.map(o => o.z1[0]);
  const z1_1_vals = allOutputs.map(o => o.z1[1]);

  const deadNeuron1 =
    weights.activation === 'relu' && z1_0_vals.every(v => v <= 0);
  const deadNeuron2 =
    weights.activation === 'relu' && z1_1_vals.every(v => v <= 0);

  // Calculate forward activations & multivariable gradients for each node
  const out = NeuralEngine.forward(weights, [currentSample.x, currentSample.y]);
  const y = currentSample.label;
  const yHat = out.yHat;
  const eps = 1e-15;
  const clampedYHat = Math.max(eps, Math.min(1 - eps, yHat));
  const lossVal = NeuralEngine.sampleLoss(yHat, y);

  const dL_dyHat = (clampedYHat - y) / (clampedYHat * (1 - clampedYHat));
  const dL_dz2 = clampedYHat - y;
  const dL_da10 = dL_dz2 * weights.W2[0];
  const dL_da11 = dL_dz2 * weights.W2[1];
  const da10_dz10 = Activations.derivative(out.z1[0], weights.activation);
  const da11_dz11 = Activations.derivative(out.z1[1], weights.activation);
  const dL_dz10 = dL_da10 * da10_dz10;
  const dL_dz11 = dL_da11 * da11_dz11;
  const dL_dx1 = dL_dz10 * weights.W1[0][0] + dL_dz11 * weights.W1[1][0];
  const dL_dx2 = dL_dz10 * weights.W1[0][1] + dL_dz11 * weights.W1[1][1];

  // Render a sleek hardware integrated circuit (IC) chip node
  const renderHardwareChip = (
    cx: number,
    cy: number,
    symbol: string,
    val: number,
    grad: number,
    theme: 'cyan' | 'violet' | 'magenta' | 'amber',
    isDead = false
  ) => {
    const w = 78;
    const h = 48;
    const x = cx - w / 2;
    const y = cy - h / 2;

    const maxGrad = 2.0;
    const barWidth = Math.max(2, Math.min(46, (grad / maxGrad) * 46));

    const colors = {
      cyan: { border: '#00F5D4', glow: 'rgba(0, 245, 212, 0.35)', text: '#00F5D4', bar: '#00F5D4' },
      violet: { border: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.35)', text: '#8B5CF6', bar: '#8B5CF6' },
      magenta: { border: '#FF2A85', glow: 'rgba(255, 42, 133, 0.35)', text: '#FF2A85', bar: '#FF2A85' },
      amber: { border: '#F59E0B', glow: 'rgba(245, 158, 11, 0.35)', text: '#F59E0B', bar: '#F59E0B' },
    }[theme];

    const strokeColor = isDead ? '#EF4444' : colors.border;
    const glowColor = isDead ? 'rgba(239, 68, 68, 0.6)' : colors.glow;

    return (
      <g className="cursor-default select-none transition-all">
        {/* Top and bottom IC copper pin connectors */}
        {[-22, 0, 22].map((offset, i) => (
          <React.Fragment key={i}>
            <rect x={cx + offset - 2} y={y - 3} width="4" height="3" fill="#D97706" rx="0.5" />
            <rect x={cx + offset - 2} y={y + h} width="4" height="3" fill="#D97706" rx="0.5" />
          </React.Fragment>
        ))}

        {/* Chip Chassis */}
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx="7"
          fill="#080C15"
          stroke={strokeColor}
          strokeWidth={isDead ? '2' : '1.5'}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />

        {/* Status LED */}
        <circle
          cx={x + 9}
          cy={y + 10}
          r="2.5"
          fill={isDead ? '#EF4444' : '#10B981'}
          className={isDead ? 'animate-ping' : ''}
        />

        {/* Symbol */}
        <text
          x={x + 17}
          y={y + 14}
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="bold"
          fontFamily="JetBrains Mono, monospace"
        >
          {symbol}
        </text>

        {/* Activation scalar value */}
        <text
          x={x + w - 8}
          y={y + 14}
          fill={isDead ? '#EF4444' : colors.text}
          fontSize="9.5"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
          fontWeight="bold"
        >
          {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
        </text>

        {/* Micro-divider line */}
        <line x1={x + 6} y1={y + 22} x2={x + w - 6} y2={y + 22} stroke="rgba(255, 255, 255, 0.08)" />

        {/* Local Gradient Sparkline */}
        <text x={x + 8} y={y + 34} fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
          |∇|
        </text>
        <rect x={x + 24} y={y + 28} width="46" height="5" rx="2.5" fill="rgba(255, 255, 255, 0.07)" />
        <rect
          x={x + 24}
          y={y + 28}
          width={barWidth}
          height="5"
          rx="2.5"
          fill={isDead ? '#EF4444' : colors.bar}
        />
        <text
          x={x + w - 8}
          y={y + 42}
          fill="#64748B"
          fontSize="7.5"
          fontFamily="JetBrains Mono, monospace"
          textAnchor="end"
        >
          {grad.toFixed(3)}
        </text>
      </g>
    );
  };

  // Node positions in SVG viewBox="0 0 530 180"
  const nodes = {
    x1: { cx: 60, cy: 45 },
    x2: { cx: 60, cy: 135 },
    a1_1: { cx: 195, cy: 45 },
    a1_2: { cx: 195, cy: 135 },
    yHat: { cx: 335, cy: 90 },
    loss: { cx: 460, cy: 90 },
  };

  // Edge definitions with key, from, to, and weight key
  const edges = [
    { key: 'W1_00', from: nodes.x1, to: nodes.a1_1, label: 'w₁₁' },
    { key: 'W1_01', from: nodes.x2, to: nodes.a1_1, label: 'w₁₂' },
    { key: 'W1_10', from: nodes.x1, to: nodes.a1_2, label: 'w₂₁' },
    { key: 'W1_11', from: nodes.x2, to: nodes.a1_2, label: 'w₂₂' },
    { key: 'W2_0', from: nodes.a1_1, to: nodes.yHat, label: 'w₂,₁' },
    { key: 'W2_1', from: nodes.a1_2, to: nodes.yHat, label: 'w₂,₂' },
    { key: 'loss', from: nodes.yHat, to: nodes.loss, label: 'BCE' },
  ];

  return (
    <div
      className={`glass-hud rounded-2xl border border-white/[0.08] p-4 space-y-3 shadow-hud flex flex-col ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyber-magenta animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            SILICON AUTODIFF COMPUTATIONAL GRAPH
          </h3>
        </div>

        {/* Controls: Signal Pulse Mode & Sample Selector */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {/* Signal flow toggle */}
          <div className="flex items-center bg-black/40 border border-white/[0.06] rounded-xl p-0.5">
            <button
              onClick={() => setPulseMode('both')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                pulseMode === 'both' ? 'bg-white/15 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Both Pulses
            </button>
            <button
              onClick={() => setPulseMode('forward')}
              className={`px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 ${
                pulseMode === 'forward'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan font-bold border border-cyber-cyan/40'
                  : 'text-slate-400'
              }`}
            >
              <ArrowRight className="w-2.5 h-2.5" /> Forward
            </button>
            <button
              onClick={() => setPulseMode('backward')}
              className={`px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 ${
                pulseMode === 'backward'
                  ? 'bg-cyber-magenta/20 text-cyber-magenta font-bold border border-cyber-magenta/40'
                  : 'text-slate-400'
              }`}
            >
              <ArrowLeft className="w-2.5 h-2.5" /> Backprop
            </button>
          </div>

          {/* Sample Picker */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/[0.06] px-2 py-1 rounded-xl">
            <span className="text-slate-400">Sample:</span>
            <select
              value={selectedSampleIndex}
              onChange={e => setSelectedSampleIndex(parseInt(e.target.value))}
              className="bg-transparent text-cyber-cyan font-bold outline-none cursor-pointer"
            >
              {dataset.slice(0, 8).map((pt, idx) => (
                <option key={idx} value={idx} className="bg-[#090D16] text-white">
                  #{idx + 1} ({pt.x.toFixed(1)}, {pt.y.toFixed(1)}) → y={pt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dead ReLU Warning Alert */}
      {(deadNeuron1 || deadNeuron2) && (
        <div className="bg-rose-950/60 border border-rose-500/80 rounded-xl p-2.5 flex items-start gap-2.5 text-rose-200 animate-pulse font-mono text-[11px]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300 block">
              DEAD RELU EXTINCTION DETECTED!
            </span>
            Neuron {deadNeuron1 ? '1' : ''} {deadNeuron2 ? '2' : ''} receives negative preactivation
            for all data samples. The local derivative is permanently 0, completely cutting off
            gradient updates upstream.
          </div>
        </div>
      )}

      {/* Interactive Silicon Node-Link SVG Graph */}
      <div className="relative bg-[#05070B] rounded-2xl p-3 border border-white/[0.06] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 530 180" className="w-full h-auto">
          {/* Defs for Glow Filters */}
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-magenta" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Circuit Traces & Animated Neon Glowing Particles */}
          <g>
            {edges.map(edge => {
              const isHovered = hoveredWeight === edge.key;
              const x1 = edge.from.cx + 38;
              const y1 = edge.from.cy;
              const x2 = edge.to.cx - 38;
              const y2 = edge.to.cy;

              return (
                <g
                  key={edge.key}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    if (edge.key !== 'loss') {
                      setHoveredWeight(edge.key as ChainRuleBreakdown['weightKey']);
                    }
                  }}
                >
                  {/* Invisible wide hit target */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="18" />

                  {/* Base wire trace */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isHovered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={isHovered ? '2.5' : '1.5'}
                  />

                  {/* Animated Forward Pulse (Electric Cyan) */}
                  {(pulseMode === 'both' || pulseMode === 'forward') && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#00F5D4"
                      strokeWidth={isHovered ? '3' : '2'}
                      className="flow-pulse-forward"
                      filter="url(#glow-cyan)"
                      opacity={isHovered ? 1 : 0.75}
                    />
                  )}

                  {/* Animated Backward Pulse (Laser Magenta) */}
                  {(pulseMode === 'both' || pulseMode === 'backward') && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#FF2A85"
                      strokeWidth={isHovered ? '3' : '2'}
                      className="flow-pulse-backward"
                      filter="url(#glow-magenta)"
                      opacity={isHovered ? 1 : 0.75}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. Hardware IC Chip Node Cards */}
          {/* Input Nodes x1 and x2 */}
          {renderHardwareChip(nodes.x1.cx, nodes.x1.cy, 'x₁', currentSample.x, Math.abs(dL_dx1), 'cyan')}
          {renderHardwareChip(nodes.x2.cx, nodes.x2.cy, 'x₂', currentSample.y, Math.abs(dL_dx2), 'cyan')}

          {/* Hidden Layer Neurons a1,1 and a1,2 */}
          {renderHardwareChip(
            nodes.a1_1.cx,
            nodes.a1_1.cy,
            'a₁,₁',
            out.a1[0],
            Math.abs(dL_da10),
            'violet',
            deadNeuron1 || da10_dz10 === 0
          )}
          {renderHardwareChip(
            nodes.a1_2.cx,
            nodes.a1_2.cy,
            'a₁,₂',
            out.a1[1],
            Math.abs(dL_da11),
            'violet',
            deadNeuron2 || da11_dz11 === 0
          )}

          {/* Output Node ŷ */}
          {renderHardwareChip(nodes.yHat.cx, nodes.yHat.cy, 'ŷ', out.yHat, Math.abs(dL_dz2), 'cyan')}

          {/* Loss Terminal ℒ */}
          {renderHardwareChip(nodes.loss.cx, nodes.loss.cy, 'ℒ', lossVal, Math.abs(dL_dyHat), 'magenta')}
        </svg>

        {/* Legend pills */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-cyan-glow" />
            Forward Pass: Activations σ(z)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyber-magenta shadow-magenta-glow" />
            Backprop: Gradients ∂ℒ/∂w
          </span>
        </div>
      </div>

      {/* Target Parameter Selector Buttons */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono">
          Hover / Select Target Weight:
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
          <button
            onClick={() => setHoveredWeight('W1_00')}
            className={`p-1.5 rounded-xl border text-center transition-all ${
              hoveredWeight === 'W1_00'
                ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold shadow-sm'
                : 'bg-black/30 border-white/[0.06] text-slate-300 hover:border-white/20'
            }`}
          >
            w₁₁ (x₁→a₁)
          </button>
          <button
            onClick={() => setHoveredWeight('W1_01')}
            className={`p-1.5 rounded-xl border text-center transition-all ${
              hoveredWeight === 'W1_01'
                ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold shadow-sm'
                : 'bg-black/30 border-white/[0.06] text-slate-300 hover:border-white/20'
            }`}
          >
            w₁₂ (x₂→a₁)
          </button>
          <button
            onClick={() => setHoveredWeight('W2_0')}
            className={`p-1.5 rounded-xl border text-center transition-all ${
              hoveredWeight === 'W2_0'
                ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan font-bold shadow-sm'
                : 'bg-black/30 border-white/[0.06] text-slate-300 hover:border-white/20'
            }`}
          >
            w₂,₁ (a₁→ŷ)
          </button>
          <button
            onClick={() => setHoveredWeight('W2_1')}
            className={`p-1.5 rounded-xl border text-center transition-all ${
              hoveredWeight === 'W2_1'
                ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan font-bold shadow-sm'
                : 'bg-black/30 border-white/[0.06] text-slate-300 hover:border-white/20'
            }`}
          >
            w₂,₂ (a₂→ŷ)
          </button>
        </div>
      </div>

      {/* Symbolic Chain Rule KaTeX Render & Numerical Breakdown */}
      <div className="bg-black/40 p-3 rounded-2xl border border-white/[0.06] space-y-2 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Analytical Chain Rule:
          </span>
          <span className="text-[10px] text-cyber-cyan font-bold">
            Target: {hoveredWeight}
          </span>
        </div>

        <div className="overflow-x-auto text-center py-1">
          <MathView math={breakdown.symbolicEquation} className="text-xs text-cyber-magenta font-bold" />
        </div>

        {/* Live Numerical Factors Multiplication */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1">
          <span className="text-[9.5px] text-slate-400 uppercase tracking-wider block">
            Numerical Floating-Point Factors:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs bg-[#05070B] p-2.5 rounded-xl border border-white/[0.06]">
            {breakdown.numericalTerms.map((num, i) => {
              const isZero = Math.abs(num) < 1e-4;
              return (
                <React.Fragment key={i}>
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono transition-all flex items-center gap-1 ${
                      isZero
                        ? 'bg-rose-950 text-rose-300 font-bold border border-rose-500 shadow-md shadow-rose-950/80 animate-pulse'
                        : 'text-slate-200'
                    }`}
                    title={`${breakdown.symbolicTerms[i]} = ${num.toFixed(4)}`}
                  >
                    {isZero ? (
                      <span className="flex items-center gap-1">
                        <span className="text-[11px] text-rose-300 font-extrabold">0.000</span>
                        <span className="text-[8px] bg-rose-900/90 text-rose-200 px-1 py-0.2 rounded uppercase tracking-wider font-sans">
                          ZEROED
                        </span>
                      </span>
                    ) : (
                      `(${num.toFixed(3)})`
                    )}
                  </span>
                  {i < breakdown.numericalTerms.length - 1 && (
                    <span className="text-slate-500 font-bold">×</span>
                  )}
                </React.Fragment>
              );
            })}
            <span className="text-slate-400 font-bold mx-1">=</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded ${
                breakdown.isDead
                  ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-sm animate-pulse'
                  : 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
              }`}
            >
              {breakdown.finalGradient.toFixed(4)}
            </span>
          </div>
        </div>

        {breakdown.isDead && (
          <div className="bg-rose-950/60 border border-rose-500/70 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-rose-200 mt-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <div className="font-bold text-rose-300 font-mono">
                Mathematical Proof: Training Stalls Permanently (Zero Gradient)
              </div>
              <p className="text-[10.5px] text-rose-200/90 font-sans leading-tight">
                {breakdown.deadReason ||
                  "Because the chain rule is a product of partial derivatives, any single zero factor nullifies the entire gradient: ∇ = 0. Upstream weights receive exactly 0 update, stalling optimization."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
