import React from 'react';
import { OptimizerType, RaceResult } from '../../math/types';
import { MathView } from '../common/MathView';
import { TrendingDown, Trophy, Zap, AlertCircle } from 'lucide-react';

interface OptimizerLossChartProps {
  raceData: Record<OptimizerType, RaceResult> | null;
  currentStep: number;
  totalSteps: number;
}

export const OptimizerLossChart: React.FC<OptimizerLossChartProps> = ({
  raceData,
  currentStep,
  totalSteps,
}) => {
  if (!raceData) {
    return (
      <div className="bg-[#131B2E] p-3 rounded-lg border border-[#2A374F] text-center text-xs font-mono text-slate-400">
        Click anywhere on the loss surface to drop balls and start the optimizer race!
      </div>
    );
  }

  const sgdSteps = raceData.sgd.steps;
  const momSteps = raceData.momentum.steps;
  const adamSteps = raceData.adam.steps;

  // Find min and max loss across all steps
  let minLoss = Infinity;
  let maxLoss = -Infinity;

  [...sgdSteps, ...momSteps, ...adamSteps].forEach(s => {
    if (s.loss < minLoss) minLoss = s.loss;
    if (s.loss > maxLoss) maxLoss = s.loss;
  });

  const lossRange = Math.max(1e-4, maxLoss - minLoss);
  const chartWidth = 460;
  const chartHeight = 110;
  const padLeft = 35;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 22;

  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const toX = (stepIdx: number) => padLeft + (stepIdx / (totalSteps - 1)) * plotW;
  const toY = (lossVal: number) => padTop + (1 - (lossVal - minLoss) / lossRange) * plotH;

  // Generate SVG path for an optimizer trajectory up to current step
  const getPathD = (steps: typeof sgdSteps, drawLimit: number) => {
    if (steps.length === 0) return '';
    const count = Math.min(drawLimit, steps.length);
    let d = '';
    for (let i = 0; i < count; i++) {
      const x = toX(i);
      const y = toY(steps[i].loss);
      if (i === 0) d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      else d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };

  // Current values at currentStep
  const curIdx = Math.max(0, Math.min(currentStep - 1, totalSteps - 1));
  const curSGD = sgdSteps[curIdx]?.loss ?? sgdSteps[0]?.loss ?? 0;
  const curMom = momSteps[curIdx]?.loss ?? momSteps[0]?.loss ?? 0;
  const curAdam = adamSteps[curIdx]?.loss ?? adamSteps[0]?.loss ?? 0;

  // Determine current leader
  let leaderName = 'SGD';
  let leaderLoss = curSGD;
  let leaderColor = '#00F5D4';

  if (curAdam <= curSGD && curAdam <= curMom) {
    leaderName = 'Adam';
    leaderLoss = curAdam;
    leaderColor = '#FF2A85';
  } else if (curMom <= curSGD && curMom <= curAdam) {
    leaderName = 'Momentum';
    leaderLoss = curMom;
    leaderColor = '#F59E0B';
  }

  return (
    <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] font-mono text-xs space-y-2">
      {/* Header & Leader Banner */}
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <TrendingDown className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>Real-Time Loss vs. Epoch Curves:</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          <Trophy className="w-3 h-3 text-cyber-amber" />
          <span className="text-slate-400">Current Leader:</span>
          <span style={{ color: leaderColor }} className="font-bold">
            {leaderName} (ℒ = {leaderLoss.toFixed(4)})
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative bg-[#0B101D] rounded border border-[#1E2D4A] p-1 flex justify-center">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
          {/* Grid lines */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={chartWidth - padRight}
            y2={padTop}
            stroke="#1E2D4A"
            strokeDasharray="2,2"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH / 2}
            x2={chartWidth - padRight}
            y2={padTop + plotH / 2}
            stroke="#1E2D4A"
            strokeDasharray="2,2"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={chartWidth - padRight}
            y2={padTop + plotH}
            stroke="#1E2D4A"
          />

          {/* Y Axis Labels */}
          <text
            x={padLeft - 4}
            y={padTop + 4}
            fill="#64748B"
            fontSize="8"
            textAnchor="end"
            fontFamily="monospace"
          >
            {maxLoss.toFixed(2)}
          </text>
          <text
            x={padLeft - 4}
            y={padTop + plotH}
            fill="#64748B"
            fontSize="8"
            textAnchor="end"
            fontFamily="monospace"
          >
            {minLoss.toFixed(2)}
          </text>

          {/* X Axis Labels */}
          <text
            x={padLeft}
            y={chartHeight - 4}
            fill="#64748B"
            fontSize="8"
            textAnchor="start"
            fontFamily="monospace"
          >
            Ep 0
          </text>
          <text
            x={padLeft + plotW / 2}
            y={chartHeight - 4}
            fill="#64748B"
            fontSize="8"
            textAnchor="middle"
            fontFamily="monospace"
          >
            Ep {Math.floor(totalSteps / 2)}
          </text>
          <text
            x={chartWidth - padRight}
            y={chartHeight - 4}
            fill="#64748B"
            fontSize="8"
            textAnchor="end"
            fontFamily="monospace"
          >
            Ep {totalSteps}
          </text>

          {/* Ghost Full Trajectories (faded in background) */}
          <path
            d={getPathD(sgdSteps, totalSteps)}
            fill="none"
            stroke="#00F5D4"
            strokeWidth="1"
            opacity="0.2"
          />
          <path
            d={getPathD(momSteps, totalSteps)}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1"
            opacity="0.2"
          />
          <path
            d={getPathD(adamSteps, totalSteps)}
            fill="none"
            stroke="#FF2A85"
            strokeWidth="1"
            opacity="0.2"
          />

          {/* Active Animated Paths up to currentStep */}
          <path
            d={getPathD(sgdSteps, currentStep)}
            fill="none"
            stroke="#00F5D4"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={getPathD(momSteps, currentStep)}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={getPathD(adamSteps, currentStep)}
            fill="none"
            stroke="#FF2A85"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Current Step Vertical Marker */}
          {currentStep > 0 && (
            <line
              x1={toX(curIdx)}
              y1={padTop}
              x2={toX(curIdx)}
              y2={padTop + plotH}
              stroke="#FFFFFF"
              strokeDasharray="2,2"
              strokeWidth="1"
              opacity="0.6"
            />
          )}

          {/* Glowing Lead Points */}
          {currentStep > 0 && (
            <>
              <circle
                cx={toX(curIdx)}
                cy={toY(curSGD)}
                r="3.5"
                fill="#00F5D4"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
              <circle
                cx={toX(curIdx)}
                cy={toY(curMom)}
                r="3.5"
                fill="#F59E0B"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
              <circle
                cx={toX(curIdx)}
                cy={toY(curAdam)}
                r="3.5"
                fill="#FF2A85"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </>
          )}
        </svg>
      </div>

      {/* Live Metric Badges for each Optimizer at currentStep */}
      <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
        {/* SGD Chip */}
        <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
            <span className="text-cyber-cyan font-bold">SGD:</span>
          </div>
          <span className="text-slate-200 font-semibold">{curSGD.toFixed(4)}</span>
        </div>

        {/* Momentum Chip */}
        <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyber-amber" />
            <span className="text-cyber-amber font-bold">Momentum:</span>
          </div>
          <span className="text-slate-200 font-semibold">{curMom.toFixed(4)}</span>
        </div>

        {/* Adam Chip */}
        <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyber-magenta" />
            <span className="text-cyber-magenta font-bold">Adam:</span>
          </div>
          <span className="text-slate-200 font-semibold">{curAdam.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
