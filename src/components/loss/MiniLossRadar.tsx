import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Point2D, NetworkWeights, Matrix2x2 } from '../../math/types';
import { LossLandscape, ParamAccessors } from '../../math/lossLandscape';
import { NeuralEngine } from '../../math/neuralEngine';
import { Maximize2, Radio, Sparkles } from 'lucide-react';

interface MiniLossRadarProps {
  dataset: Point2D[];
  weights: NetworkWeights;
  onUpdateWeights: (newWeights: NetworkWeights) => void;
  onExpand: () => void;
  className?: string;
}

export const MiniLossRadar: React.FC<MiniLossRadarProps> = ({
  dataset,
  weights,
  onUpdateWeights,
  onExpand,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);

  // Focus slice on diagonal weights (w11, w22)
  const [currP1, currP2] = ParamAccessors.W1_diag.get(weights);
  const currentLoss = useMemo(
    () => (dataset.length > 0 ? NeuralEngine.computeLoss(dataset, weights) : 0),
    [dataset, weights]
  );

  // Generate lightweight 24x24 resolution loss grid
  const landscape = useMemo(() => {
    return LossLandscape.generateGrid(dataset, weights, 'W1_diag', 24, 2.8);
  }, [dataset, weights]);

  // Render 2D contour heatmap on mini canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const res = landscape.grid.length;
    const cellW = width / res;
    const cellH = height / res;

    const minL = landscape.minLoss;
    const maxL = Math.max(minL + 0.001, landscape.maxLoss);

    // 1. Draw smooth loss heatmap
    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const val = landscape.grid[r][c];
        const t = Math.max(0, Math.min(1, (val - minL) / (maxL - minL)));

        // Electric Cyber Color Ramp: Obsidian -> Cyan -> Magenta -> Amber
        let rCol = 0, gCol = 0, bCol = 0;
        if (t < 0.35) {
          // Basin: Deep Obsidian to Cyan
          const u = t / 0.35;
          rCol = Math.round(5 + u * 0);
          gCol = Math.round(7 + u * 230);
          bCol = Math.round(15 + u * 195);
        } else if (t < 0.75) {
          // Slope: Cyan to Magenta
          const u = (t - 0.35) / 0.4;
          rCol = Math.round(0 + u * 255);
          gCol = Math.round(230 - u * 188);
          bCol = Math.round(210 - u * 77);
        } else {
          // Peak: Magenta to Amber
          const u = (t - 0.75) / 0.25;
          rCol = 255;
          gCol = Math.round(42 + u * 116);
          bCol = Math.round(133 - u * 122);
        }

        ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
        ctx.fillRect(c * cellW, (res - 1 - r) * cellH, cellW + 1, cellH + 1);
      }
    }

    // 2. Draw subtle contour iso-curves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 0.75;
    const numLevels = 6;
    for (let lvl = 1; lvl < numLevels; lvl++) {
      const targetLoss = minL + (lvl / numLevels) * (maxL - minL);
      for (let r = 0; r < res - 1; r++) {
        for (let c = 0; c < res - 1; c++) {
          const v00 = landscape.grid[r][c];
          const v10 = landscape.grid[r][c + 1];
          if ((v00 - targetLoss) * (v10 - targetLoss) < 0) {
            ctx.strokeRect((c + 0.5) * cellW, (res - 1 - r) * cellH, 1, 1);
          }
        }
      }
    }

    // 3. Coordinate axes at origin (0, 0)
    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    if (p1Min < 0 && p1Max > 0) {
      const ox = ((0 - p1Min) / (p1Max - p1Min)) * width;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ox, 0);
      ctx.lineTo(ox, height);
      ctx.stroke();
    }
    if (p2Min < 0 && p2Max > 0) {
      const oy = (1 - (0 - p2Min) / (p2Max - p2Min)) * height;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, oy);
      ctx.lineTo(width, oy);
      ctx.stroke();
    }

    // 4. Draw Current Parameter Ball with Outer Glow Halo
    const ballX = Math.max(
      6,
      Math.min(width - 6, ((currP1 - p1Min) / (p1Max - p1Min)) * width)
    );
    const ballY = Math.max(
      6,
      Math.min(height - 6, (1 - (currP2 - p2Min) / (p2Max - p2Min)) * height)
    );

    // Outer pulsating halo
    ctx.beginPath();
    ctx.arc(ballX, ballY, 9, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 245, 212, 0.35)';
    ctx.fill();

    // Core ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#00F5D4';
    ctx.shadowColor = '#00F5D4';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // White center specular reflection
    ctx.beginPath();
    ctx.arc(ballX - 1, ballY - 1, 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }, [landscape, currP1, currP2]);

  // Click & Drag on mini radar to change parameters live
  const updateParamsFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const sy = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    const p1 = p1Min + (sx / rect.width) * (p1Max - p1Min);
    const p2 = p2Min + (1 - sy / rect.height) * (p2Max - p2Min);

    const roundedP1 = Math.round(p1 * 100) / 100;
    const roundedP2 = Math.round(p2 * 100) / 100;

    const newW1: Matrix2x2 = [
      [roundedP1, weights.W1[0][1]],
      [weights.W1[1][0], roundedP2],
    ];
    onUpdateWeights({ ...weights, W1: newW1 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateParamsFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    updateParamsFromPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`glass-hud rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-2 w-[210px] select-none pointer-events-auto ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-white/[0.06] font-mono text-[10px]">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-cyber-cyan animate-pulse" />
          <span className="font-bold text-white tracking-wider">LOSS RADAR</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyber-magenta font-bold tabular-nums">
            ℒ={currentLoss.toFixed(3)}
          </span>
          <button
            onClick={onExpand}
            title="Expand to Full 3D Loss Arena"
            className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mini 2D Contour Canvas */}
      <div className="relative mt-1 rounded-xl overflow-hidden border border-white/[0.08] bg-[#05070B] cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={194}
          height={116}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
          title="Drag to steer parameters (w11, w22) across loss surface"
        />

        {/* Sub-label coordinates */}
        <div className="absolute bottom-1 right-1 pointer-events-none px-1 rounded bg-black/70 text-[8px] font-mono text-slate-400 tabular-nums">
          ({currP1.toFixed(1)}, {currP2.toFixed(1)})
        </div>
      </div>
    </div>
  );
};
