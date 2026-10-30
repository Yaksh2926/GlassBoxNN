import React from 'react';
import { OptimizerType, RaceResult } from '../../math/types';
import { TrendingDown, Trophy, Zap, AlertCircle, Sparkles } from 'lucide-react';

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
      <div className="p-4 rounded-2xl bg-[#0E0E18] border border-[#262636] text-center text-xs font-sans text-[#9E9EAF] flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FF5E7E]" />
        <span>Click anywhere on the loss surface to drop balls and start the optimizer race!</span>
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
  const chartWidth = 520;
  const chartHeight = 120;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 24;

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
  let leaderColor = '#53D4F4';

  if (curAdam <= curSGD && curAdam <= curMom) {
    leaderName = 'Adam';
    leaderLoss = curAdam;
    leaderColor = '#FF5E7E';
  } else if (curMom <= curSGD && curMom <= curAdam) {
    leaderName = 'Momentum';
    leaderLoss = curMom;
    leaderColor = '#F7C76B';
  }

  const isCompleted = currentStep >= totalSteps;

  return (
    <div className="p-4 rounded-2xl bg-[#0E0E18] border border-[#262636] font-sans space-y-3">
      {/* Header & Leader Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-white font-semibold">
          <TrendingDown className="w-4 h-4 text-[#FF5E7E]" />
          <span>Real-Time Loss vs. Epoch Curves:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#9E9EAF] text-xs">
            {isCompleted ? '🏆 Final Winner:' : 'Leading Optimizer:'}
          </span>
          <span
            style={{ color: leaderColor, borderColor: `${leaderColor}50`, backgroundColor: `${leaderColor}15` }}
            className="px-2.5 py-0.5 rounded-full font-bold font-mono text-xs border shadow-sm flex items-center gap-1.5"
          >
            <Trophy className="w-3 h-3" />
            {leaderName} (ℒ = {leaderLoss.toFixed(4)})
          </span>
        </div>
      </div>

      {/* SVG Loss Curve Chart */}
      <div className="relative bg-[#0C0C14] rounded-xl border border-[#262636] p-2 flex justify-center overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
          {/* Subtle Grid lines */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={chartWidth - padRight}
            y2={padTop}
            stroke="#262636"
            strokeDasharray="3,3"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH / 2}
            x2={chartWidth - padRight}
            y2={padTop + plotH / 2}
            stroke="#262636"
            strokeDasharray="3,3"
          />
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={chartWidth - padRight}
            y2={padTop + plotH}
            stroke="#262636"
          />

          {/* Y Axis Loss Labels */}
          <text
            x={padLeft - 6}
            y={padTop + 4}
            fill="#9E9EAF"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {maxLoss.toFixed(2)}
          </text>
          <text
            x={padLeft - 6}
            y={padTop + plotH}
            fill="#9E9EAF"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {minLoss.toFixed(2)}
          </text>

          {/* X Axis Epoch Labels */}
          <text
            x={padLeft}
            y={chartHeight - 4}
            fill="#9E9EAF"
            fontSize="9"
            textAnchor="start"
            fontFamily="monospace"
          >
            Ep 0
          </text>
          <text
            x={padLeft + plotW / 2}
            y={chartHeight - 4}
            fill="#9E9EAF"
            fontSize="9"
            textAnchor="middle"
            fontFamily="monospace"
          >
            Ep {Math.floor(totalSteps / 2)}
          </text>
          <text
            x={chartWidth - padRight}
            y={chartHeight - 4}
            fill="#9E9EAF"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            Ep {totalSteps}
          </text>

          {/* Ghost Full Trajectories (faint guide in background) */}
          <path
            d={getPathD(sgdSteps, totalSteps)}
            fill="none"
            stroke="#53D4F4"
            strokeWidth="1.5"
            opacity="0.18"
          />
          <path
            d={getPathD(momSteps, totalSteps)}
            fill="none"
            stroke="#F7C76B"
            strokeWidth="1.5"
            opacity="0.18"
          />
          <path
            d={getPathD(adamSteps, totalSteps)}
            fill="none"
            stroke="#FF5E7E"
            strokeWidth="1.5"
            opacity="0.18"
          />

          {/* Active Animated Paths up to currentStep */}
          <path
            d={getPathD(sgdSteps, currentStep)}
            fill="none"
            stroke="#53D4F4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={getPathD(momSteps, currentStep)}
            fill="none"
            stroke="#F7C76B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={getPathD(adamSteps, currentStep)}
            fill="none"
            stroke="#FF5E7E"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Vertical Current Scrubber Cursor Line */}
          {currentStep > 0 && (
            <line
              x1={toX(curIdx)}
              y1={padTop}
              x2={toX(curIdx)}
              y2={padTop + plotH}
              stroke="#FFFFFF"
              strokeDasharray="2,2"
              strokeWidth="1.5"
              opacity="0.6"
            />
          )}

          {/* Glowing Lead Points at head */}
          {currentStep > 0 && (
            <>
              <circle
                cx={toX(curIdx)}
                cy={toY(curSGD)}
                r="4"
                fill="#53D4F4"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <circle
                cx={toX(curIdx)}
                cy={toY(curMom)}
                r="4"
                fill="#F7C76B"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <circle
                cx={toX(curIdx)}
                cy={toY(curAdam)}
                r="4.5"
                fill="#FF5E7E"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
            </>
          )}
        </svg>
      </div>

      {/* Live Metric Badges for each Optimizer at currentStep */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {/* SGD Chip */}
        <div className="bg-[#141422] p-2 rounded-xl border border-[#262636] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#53D4F4] shadow-[0_0_6px_#53D4F4]" />
            <span className="text-[#53D4F4] font-bold">SGD:</span>
          </div>
          <span className="font-mono text-white font-semibold">ℒ = {curSGD.toFixed(4)}</span>
        </div>

        {/* Momentum Chip */}
        <div className="bg-[#141422] p-2 rounded-xl border border-[#262636] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F7C76B] shadow-[0_0_6px_#F7C76B]" />
            <span className="text-[#F7C76B] font-bold">Momentum:</span>
          </div>
          <span className="font-mono text-white font-semibold">ℒ = {curMom.toFixed(4)}</span>
        </div>

        {/* Adam Chip */}
        <div className="bg-[#141422] p-2 rounded-xl border border-[#262636] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E] shadow-[0_0_6px_#FF5E7E]" />
            <span className="text-[#FF5E7E] font-bold">Adam:</span>
          </div>
          <span className="font-mono text-white font-semibold">ℒ = {curAdam.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
