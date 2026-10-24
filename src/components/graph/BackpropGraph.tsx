import React, { useState } from 'react';
import { Point2D, NetworkWeights, ChainRuleBreakdown } from '../../math/types';
import { NeuralEngine } from '../../math/neuralEngine';
import { MathView } from '../common/MathView';
import { GitBranch, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface BackpropGraphProps {
  weights: NetworkWeights;
  dataset: Point2D[];
}

export const BackpropGraph: React.FC<BackpropGraphProps> = ({ weights, dataset }) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [hoveredWeight, setHoveredWeight] = useState<ChainRuleBreakdown['weightKey']>('W1_00');

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

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-cyber-magenta" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Interactive Chain-Rule & Backprop Engine
          </h3>
        </div>

        {/* Sample Picker */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-slate-400">Sample:</span>
          <select
            value={selectedSampleIndex}
            onChange={e => setSelectedSampleIndex(parseInt(e.target.value))}
            className="bg-[#131B2E] text-slate-200 px-1.5 py-0.5 rounded border border-[#2A374F] focus:border-cyber-magenta focus:outline-none"
          >
            {dataset.slice(0, 10).map((pt, idx) => (
              <option key={idx} value={idx}>
                #{idx + 1} ({pt.x.toFixed(1)}, {pt.y.toFixed(1)}) → y={pt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dead ReLU Warning Alert */}
      {(deadNeuron1 || deadNeuron2) && (
        <div className="bg-rose-950/50 border border-rose-500/80 rounded-lg p-2 flex items-start gap-2 text-rose-200 animate-pulse font-mono text-[10px]">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300 block">
              DEAD RELU EXTINCTION DETECTED!
            </span>
            Neuron {deadNeuron1 ? '1' : ''} {deadNeuron2 ? '2' : ''} receives negative preactivation
            for ALL data samples. The local derivative is permanently 0, completely blocking
            backpropagation updates to upstream weights.
          </div>
        </div>
      )}

      {/* Interactive Node-Link SVG Graph */}
      <div className="relative bg-[#090D16] rounded-lg p-2 border border-[#1E2D4A]/50 flex items-center justify-center">
        <svg viewBox="0 0 460 170" className="w-full h-auto">
          {/* Edge definitions */}
          {/* Layer 1 Edges: (x1, x2) -> (z1_1, z1_2) */}
          <g className="cursor-pointer">
            {/* W1_00: x1 -> z1_1 */}
            <line
              x1="60"
              y1="50"
              x2="170"
              y2="50"
              stroke={hoveredWeight === 'W1_00' ? '#FF2A85' : '#1E2D4A'}
              strokeWidth={hoveredWeight === 'W1_00' ? '3' : '1.5'}
              onMouseEnter={() => setHoveredWeight('W1_00')}
            />
            {/* W1_01: x2 -> z1_1 */}
            <line
              x1="60"
              y1="120"
              x2="170"
              y2="50"
              stroke={hoveredWeight === 'W1_01' ? '#FF2A85' : '#1E2D4A'}
              strokeWidth={hoveredWeight === 'W1_01' ? '3' : '1.5'}
              onMouseEnter={() => setHoveredWeight('W1_01')}
            />
            {/* W1_10: x1 -> z1_2 */}
            <line
              x1="60"
              y1="50"
              x2="170"
              y2="120"
              stroke={hoveredWeight === 'W1_10' ? '#FF2A85' : '#1E2D4A'}
              strokeWidth={hoveredWeight === 'W1_10' ? '3' : '1.5'}
              onMouseEnter={() => setHoveredWeight('W1_10')}
            />
            {/* W1_11: x2 -> z1_2 */}
            <line
              x1="60"
              y1="120"
              x2="170"
              y2="120"
              stroke={hoveredWeight === 'W1_11' ? '#FF2A85' : '#1E2D4A'}
              strokeWidth={hoveredWeight === 'W1_11' ? '3' : '1.5'}
              onMouseEnter={() => setHoveredWeight('W1_11')}
            />

            {/* Layer 2 Edges: (a1_1, a1_2) -> z2 */}
            {/* W2_0: a1_1 -> z2 */}
            <line
              x1="250"
              y1="50"
              x2="340"
              y2="85"
              stroke={hoveredWeight === 'W2_0' ? '#FF2A85' : '#1E2D4A'}
              strokeWidth={hoveredWeight === 'W2_0' ? '3' : '1.5'}
              onMouseEnter={() => setHoveredWeight('W2_0')}
            />
            {/* W2_1: a1_2 -> z2 */}
            <line
              x1="250"
              y1="120"
              x2="340"
              y2="85"
              stroke={hoveredWeight === 'W2_1' ? '#FF2A85' : '#1E2D4A'}
              strokeWidth={hoveredWeight === 'W2_1' ? '3' : '1.5'}
              onMouseEnter={() => setHoveredWeight('W2_1')}
            />

            {/* Edge to Output & Loss: z2 -> yHat -> L */}
            <line x1="340" y1="85" x2="410" y2="85" stroke="#00F5D4" strokeWidth="2" />
          </g>

          {/* Node: x1 */}
          <circle cx="60" cy="50" r="16" fill="#131B2E" stroke="#00F5D4" strokeWidth="2" />
          <text x="60" y="54" fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="middle">
            x₁
          </text>

          {/* Node: x2 */}
          <circle cx="60" cy="120" r="16" fill="#131B2E" stroke="#00F5D4" strokeWidth="2" />
          <text x="60" y="124" fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="middle">
            x₂
          </text>

          {/* Hidden Neuron 1: z1_1 / a1_1 */}
          <circle
            cx="210"
            cy="50"
            r="18"
            fill={deadNeuron1 ? '#450A0A' : '#131B2E'}
            stroke={deadNeuron1 ? '#EF4444' : '#8B5CF6'}
            strokeWidth="2"
          />
          <text x="210" y="54" fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="middle">
            a₁,₁
          </text>

          {/* Hidden Neuron 2: z1_2 / a1_2 */}
          <circle
            cx="210"
            cy="120"
            r="18"
            fill={deadNeuron2 ? '#450A0A' : '#131B2E'}
            stroke={deadNeuron2 ? '#EF4444' : '#8B5CF6'}
            strokeWidth="2"
          />
          <text x="210" y="124" fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="middle">
            a₁,₂
          </text>

          {/* Output Node: z2 & yHat */}
          <circle cx="340" cy="85" r="18" fill="#131B2E" stroke="#00F5D4" strokeWidth="2" />
          <text x="340" y="89" fill="#E2E8F0" fontSize="10" fontFamily="monospace" textAnchor="middle">
            ŷ
          </text>

          {/* Loss Node: L */}
          <circle cx="415" cy="85" r="16" fill="#131B2E" stroke="#FF2A85" strokeWidth="2" />
          <text x="415" y="89" fill="#FF2A85" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            ℒ
          </text>
        </svg>

        <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
          Hover weight edges to trace chain rule
        </span>
      </div>

      {/* Quick Weight Selector Buttons */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Select Target Parameter:
        </span>
        <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
          <button
            onClick={() => setHoveredWeight('W1_00')}
            className={`p-1 rounded border text-center transition-colors ${
              hoveredWeight === 'W1_00'
                ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-300'
            }`}
          >
            w₁₁ (x₁→a₁)
          </button>
          <button
            onClick={() => setHoveredWeight('W1_01')}
            className={`p-1 rounded border text-center transition-colors ${
              hoveredWeight === 'W1_01'
                ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-300'
            }`}
          >
            w₁₂ (x₂→a₁)
          </button>
          <button
            onClick={() => setHoveredWeight('W2_0')}
            className={`p-1 rounded border text-center transition-colors ${
              hoveredWeight === 'W2_0'
                ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-300'
            }`}
          >
            w₂,₁ (a₁→ŷ)
          </button>
          <button
            onClick={() => setHoveredWeight('W2_1')}
            className={`p-1 rounded border text-center transition-colors ${
              hoveredWeight === 'W2_1'
                ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan font-bold'
                : 'bg-[#131B2E] border-[#2A374F] text-slate-300'
            }`}
          >
            w₂,₂ (a₂→ŷ)
          </button>
        </div>
      </div>

      {/* Symbolic Chain Rule KaTeX Render */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] space-y-1.5 font-mono">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
          Symbolic Calculus Chain:
        </span>
        <div className="overflow-x-auto text-center py-1">
          <MathView math={breakdown.symbolicEquation} className="text-xs text-cyber-magenta" />
        </div>

        {/* Numerical Floating-Point Factor Multiplication */}
        <div className="pt-2 border-t border-[#1E2D4A] space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Live Numerical Factors:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1 text-[11px] bg-[#0B101D] p-2 rounded border border-[#1E2D4A]">
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
              className={`font-bold px-2 py-0.5 rounded ${
                breakdown.isDead
                  ? 'bg-rose-950 text-rose-300 border border-rose-500 shadow-sm animate-pulse'
                  : 'bg-cyber-cyan/20 text-cyber-cyan'
              }`}
            >
              {breakdown.finalGradient.toFixed(4)}
            </span>
          </div>
        </div>

        {breakdown.isDead && (
          <div className="bg-rose-950/60 border border-rose-500/70 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-rose-200 mt-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <div className="font-bold text-rose-300 font-mono">
                Mathematical Proof: Training Stalls Permanently (Zero Gradient)
              </div>
              <p className="text-[10.5px] text-rose-200/90 font-sans leading-tight">
                {breakdown.deadReason || "Because the chain rule is a product of partial derivatives, any single zero factor (here, the activation derivative) nullifies the entire gradient: ∇ = 0. Upstream weights receive exactly 0 update, stalling optimization."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
