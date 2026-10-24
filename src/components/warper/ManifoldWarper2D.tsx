import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point2D, Matrix2x2, Vector2D, NetworkWeights, ActivationType } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { Activations } from '../../math/activations';
import { MathView } from '../common/MathView';
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  CircleDot,
  Sparkles,
  MoveRight,
  Maximize2,
  Compass,
} from 'lucide-react';

interface ManifoldWarper2DProps {
  weights: NetworkWeights;
  dataset: Point2D[];
  tau: number; // Continuous homotopy parameter in [0, 3]
  onChangeTau: (updater: number | ((prevTau: number) => number)) => void;
  tauSVD: number; // Continuous SVD parameter in [0, 3]
  onChangeTauSVD: (updater: number | ((prevTau: number) => number)) => void;
  warperMode: 'homotopy' | 'svd';
  onChangeWarperMode: (mode: 'homotopy' | 'svd') => void;
  onAddPoint: (pt: Point2D) => void;
  activeClass: 0 | 1;
  showHeatmap: boolean;
}

export const ManifoldWarper2D: React.FC<ManifoldWarper2DProps> = ({
  weights,
  dataset,
  tau,
  onChangeTau,
  tauSVD,
  onChangeTauSVD,
  warperMode,
  onChangeWarperMode,
  onAddPoint,
  activeClass,
  showHeatmap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingHomotopy, setIsPlayingHomotopy] = useState(false);
  const [isPlayingSVD, setIsPlayingSVD] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Coordinate domain [-3.5, 3.5]
  const domain = 3.5;

  // Calculate live SVD decomposition
  const svd = LinearAlgebra.svd(weights.W1);

  // Auto-play Homotopy space folding
  useEffect(() => {
    if (!isPlayingHomotopy) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      onChangeTau((prevTau: number) => {
        let nextTau = prevTau + dt * 0.85;
        if (nextTau > 3.0) nextTau = 0.0;
        return nextTau;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingHomotopy, onChangeTau]);

  // Auto-play SVD 3-stage continuous animation
  useEffect(() => {
    if (!isPlayingSVD) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      onChangeTauSVD((prevTau: number) => {
        let nextTau = prevTau + dt * 0.75;
        if (nextTau > 3.0) nextTau = 0.0;
        return nextTau;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingSVD, onChangeTauSVD]);

  // Core Mapping Function: R^2 -> R^2 based on active mode
  const mapPoint = useCallback(
    (x: number, y: number): [number, number] => {
      if (warperMode === 'svd') {
        // Continuous 3-stage SVD Transformation
        const M = LinearAlgebra.interpolateSVDMatrix(weights.W1, tauSVD);
        const transformed = LinearAlgebra.transformVector(M, [x, y]);
        return [transformed[0], transformed[1]];
      }

      // Continuous Neural Homotopy: tau in [0, 3]
      if (tau <= 1.0) {
        // Stage 1: Linear Interpolation from Identity to W1 * x + b1
        const t = tau;
        const z1_0 = weights.W1[0][0] * x + weights.W1[0][1] * y + weights.b1[0];
        const z1_1 = weights.W1[1][0] * x + weights.W1[1][1] * y + weights.b1[1];
        return [(1 - t) * x + t * z1_0, (1 - t) * y + t * z1_1];
      } else if (tau <= 2.0) {
        // Stage 2: Topological Folding via Activation Function
        const t = tau - 1.0;
        const z1_0 = weights.W1[0][0] * x + weights.W1[0][1] * y + weights.b1[0];
        const z1_1 = weights.W1[1][0] * x + weights.W1[1][1] * y + weights.b1[1];
        const a1_0 = Activations.interpolateFolding(z1_0, t, weights.activation);
        const a1_1 = Activations.interpolateFolding(z1_1, t, weights.activation);
        return [a1_0, a1_1];
      } else {
        // Stage 3: Output Projection & Decision Hyperplane
        const z1_0 = weights.W1[0][0] * x + weights.W1[0][1] * y + weights.b1[0];
        const z1_1 = weights.W1[1][0] * x + weights.W1[1][1] * y + weights.b1[1];
        const a1_0 = Activations.fn(z1_0, weights.activation);
        const a1_1 = Activations.fn(z1_1, weights.activation);
        return [a1_0, a1_1];
      }
    },
    [weights, warperMode, tau, tauSVD]
  );

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = width / (domain * 2);

    const toScreen = (x: number, y: number): [number, number] => [
      cx + x * scale,
      cy - y * scale,
    ];

    const toWorld = (sx: number, sy: number): [number, number] => [
      (sx - cx) / scale,
      (cy - sy) / scale,
    ];

    // Clear background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Decision Boundary Probability Heatmap (only in Homotopy mode)
    if (showHeatmap && warperMode === 'homotopy') {
      const res = 48;
      const cellW = width / res;
      const cellH = height / res;

      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const [wx, wy] = toWorld((i + 0.5) * cellW, (j + 0.5) * cellH);
          const z1_0 = weights.W1[0][0] * wx + weights.W1[0][1] * wy + weights.b1[0];
          const z1_1 = weights.W1[1][0] * wx + weights.W1[1][1] * wy + weights.b1[1];
          const a1_0 = Activations.fn(z1_0, weights.activation);
          const a1_1 = Activations.fn(z1_1, weights.activation);
          const z2 = weights.W2[0] * a1_0 + weights.W2[1] * a1_1 + weights.b2;
          const prob = Activations.fn(z2, 'sigmoid');

          if (prob < 0.5) {
            const alpha = (0.5 - prob) * 0.45;
            ctx.fillStyle = `rgba(0, 245, 212, ${alpha})`;
          } else {
            const alpha = (prob - 0.5) * 0.45;
            ctx.fillStyle = `rgba(255, 42, 133, ${alpha})`;
          }
          ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
        }
      }
    }

    // 2. Draw Transformed Cartesian Grid Lines
    const gridRange = 3.0;
    const gridStep = 0.5;
    const samplesPerLine = 40;

    ctx.lineWidth = 1;

    // Horizontal grid lines: y = const
    for (let gy = -gridRange; gy <= gridRange + 1e-5; gy += gridStep) {
      const isAxis = Math.abs(gy) < 1e-4;
      ctx.strokeStyle = isAxis ? 'rgba(148, 163, 184, 0.5)' : 'rgba(30, 45, 74, 0.4)';
      ctx.beginPath();
      for (let s = 0; s <= samplesPerLine; s++) {
        const gx = -gridRange + (s / samplesPerLine) * (2 * gridRange);
        const [mx, my] = mapPoint(gx, gy);
        const [sx, sy] = toScreen(mx, my);
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Vertical grid lines: x = const
    for (let gx = -gridRange; gx <= gridRange + 1e-5; gx += gridStep) {
      const isAxis = Math.abs(gx) < 1e-4;
      ctx.strokeStyle = isAxis ? 'rgba(148, 163, 184, 0.5)' : 'rgba(30, 45, 74, 0.4)';
      ctx.beginPath();
      for (let s = 0; s <= samplesPerLine; s++) {
        const gy = -gridRange + (s / samplesPerLine) * (2 * gridRange);
        const [mx, my] = mapPoint(gx, gy);
        const [sx, sy] = toScreen(mx, my);
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Helper: Draw Arrow
    const drawArrow = (
      from: [number, number],
      to: [number, number],
      color: string,
      label: string,
      lineWidth = 2.5
    ) => {
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const angle = Math.atan2(dy, dx);
      const headLen = 9;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;

      ctx.beginPath();
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(to[0], to[1]);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(to[0], to[1]);
      ctx.lineTo(
        to[0] - headLen * Math.cos(angle - Math.PI / 6),
        to[1] - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        to[0] - headLen * Math.cos(angle + Math.PI / 6),
        to[1] - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 11px monospace';
      ctx.fillText(label, to[0] + 8, to[1] - 4);
    };

    // 3. Render Unit Circle / SVD Ellipse Deformation (SVD Breakdown Mode)
    if (warperMode === 'svd') {
      const circlePts = 120;
      ctx.beginPath();

      // Sample unit circle x^2 + y^2 = 1 and transform through SVD
      for (let i = 0; i <= circlePts; i++) {
        const theta = (i / circlePts) * 2 * Math.PI;
        const ucX = Math.cos(theta);
        const ucY = Math.sin(theta);
        const [mx, my] = mapPoint(ucX, ucY);
        const [sx, sy] = toScreen(mx, my);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }

      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 245, 212, 0.12)';
      ctx.fill();

      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Principal Semi-Axes Vectors of the Ellipse
      const axes = LinearAlgebra.getSVDEllipseAxes(weights.W1, tauSVD);
      const originScreen = toScreen(0, 0);

      const sAxis1 = toScreen(axes.axis1[0], axes.axis1[1]);
      const sAxis2 = toScreen(axes.axis2[0], axes.axis2[1]);

      drawArrow(
        originScreen,
        sAxis1,
        '#F59E0B',
        `σ₁: ${axes.len1.toFixed(2)}`,
        3.0
      );
      drawArrow(
        originScreen,
        sAxis2,
        '#8B5CF6',
        `σ₂: ${axes.len2.toFixed(2)}`,
        3.0
      );
    } else {
      // Shaded Unit Square in Homotopy Mode
      const o = mapPoint(0, 0);
      const pI = mapPoint(1, 0);
      const pDiag = mapPoint(1, 1);
      const pJ = mapPoint(0, 1);

      const sO = toScreen(o[0], o[1]);
      const sI = toScreen(pI[0], pI[1]);
      const sDiag = toScreen(pDiag[0], pDiag[1]);
      const sJ = toScreen(pJ[0], pJ[1]);

      ctx.fillStyle = 'rgba(0, 245, 212, 0.12)';
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.4)';
      ctx.beginPath();
      ctx.moveTo(sO[0], sO[1]);
      ctx.lineTo(sI[0], sI[1]);
      ctx.lineTo(sDiag[0], sDiag[1]);
      ctx.lineTo(sJ[0], sJ[1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Basis Vectors î and ĵ
      drawArrow(sO, sI, '#10B981', 'î');
      drawArrow(sO, sJ, '#F59E0B', 'ĵ');
    }

    // 4. Invariant Eigen-axes (Homotopy mode)
    const eigenRes = LinearAlgebra.eigen(weights.W1);
    if (warperMode === 'homotopy' && eigenRes.isReal && eigenRes.vectors && tau >= 0.8 && tau <= 1.5) {
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#8B5CF6';

      const v1 = eigenRes.vectors[0];
      const v2 = eigenRes.vectors[1];

      const p1a = toScreen(-v1[0] * 3, -v1[1] * 3);
      const p1b = toScreen(v1[0] * 3, v1[1] * 3);
      ctx.beginPath();
      ctx.moveTo(p1a[0], p1a[1]);
      ctx.lineTo(p1b[0], p1b[1]);
      ctx.stroke();

      const p2a = toScreen(-v2[0] * 3, -v2[1] * 3);
      const p2b = toScreen(v2[0] * 3, v2[1] * 3);
      ctx.beginPath();
      ctx.moveTo(p2a[0], p2a[1]);
      ctx.lineTo(p2b[0], p2b[1]);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // 5. Draw Decision Boundary Hyperplane (Homotopy mode tau >= 1.5)
    if (warperMode === 'homotopy' && tau >= 1.5) {
      const w2_0 = weights.W2[0];
      const w2_1 = weights.W2[1];
      const b2 = weights.b2;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 10;
      ctx.beginPath();

      if (Math.abs(w2_1) > 1e-4) {
        const xA = -3.5;
        const yA = (-b2 - w2_0 * xA) / w2_1;
        const xB = 3.5;
        const yB = (-b2 - w2_0 * xB) / w2_1;
        const sA = toScreen(xA, yA);
        const sB = toScreen(xB, yB);
        ctx.moveTo(sA[0], sA[1]);
        ctx.lineTo(sB[0], sB[1]);
      } else if (Math.abs(w2_0) > 1e-4) {
        const xConst = -b2 / w2_0;
        const sA = toScreen(xConst, -3.5);
        const sB = toScreen(xConst, 3.5);
        ctx.moveTo(sA[0], sA[1]);
        ctx.lineTo(sB[0], sB[1]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 6. Draw Dataset Data Points
    for (const pt of dataset) {
      const [mx, my] = mapPoint(pt.x, pt.y);
      const [sx, sy] = toScreen(mx, my);

      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, 2 * Math.PI);

      if (pt.label === 0) {
        ctx.fillStyle = '#00F5D4';
        ctx.strokeStyle = '#042F2C';
        ctx.shadowColor = 'rgba(0, 245, 212, 0.7)';
      } else {
        ctx.fillStyle = '#FF2A85';
        ctx.strokeStyle = '#38061B';
        ctx.shadowColor = 'rgba(255, 42, 133, 0.7)';
      }

      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 7. Crosshair at Origin
    const [scx, scy] = toScreen(0, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scx - 6, scy);
    ctx.lineTo(scx + 6, scy);
    ctx.moveTo(scx, scy - 6);
    ctx.lineTo(scx, scy + 6);
    ctx.stroke();
  }, [weights, dataset, tau, tauSVD, warperMode, showHeatmap, mapPoint]);

  // Click on canvas to add point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = canvas.width / (domain * 2);

    const x = (sx - cx) / scale;
    const y = (cy - sy) / scale;

    onAddPoint({
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2)),
      label: activeClass,
      id: `custom-${Date.now()}`,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / rect.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = canvas.width / (domain * 2);

    const x = (sx - cx) / scale;
    const y = (cy - sy) / scale;
    setHoverCoord({ x, y });
  };

  const getSVDStageLabel = () => {
    if (tauSVD <= 1.0) {
      const pct = Math.round(tauSVD * 100);
      return `SVD Stage 1: Orthogonal Rotation/Reflection by Vᵀ [${pct}%]`;
    } else if (tauSVD <= 2.0) {
      const pct = Math.round((tauSVD - 1.0) * 100);
      return `SVD Stage 2: Diagonal Scaling Σ = diag(σ₁, σ₂) [${pct}%] (Unit Circle → Ellipse)`;
    } else {
      const pct = Math.round((tauSVD - 2.0) * 100);
      return `SVD Stage 3: Final Orthogonal Rotation by U [${pct}%] (W₁ = U Σ Vᵀ)`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 shadow-glass">
      {/* Top Header & Mode Toggle Switch */}
      <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-[#1E2D4A]/60 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-cyan" />
              2D Manifold Warper & Geometry Engine
            </h2>
          </div>
          <p className="text-[11px] font-mono text-cyber-cyan">
            {warperMode === 'svd'
              ? getSVDStageLabel()
              : tau <= 1.0
              ? `Phase 1: Affine Warp (1 - τ)I + τ(W₁x + b₁)`
              : tau <= 2.0
              ? `Phase 2: Topological Fold via ${weights.activation.toUpperCase()}`
              : `Phase 3: Decision Boundary Hyperplane`}
          </p>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex items-center bg-[#131B2E] p-1 rounded-lg border border-[#2A374F] text-[10px] font-mono">
          <button
            onClick={() => {
              setIsPlayingSVD(false);
              onChangeWarperMode('homotopy');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              warperMode === 'homotopy'
                ? 'bg-cyber-cyan text-black font-bold shadow-cyan-glow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" /> Neural Homotopy (τ)
          </button>
          <button
            onClick={() => {
              setIsPlayingHomotopy(false);
              onChangeWarperMode('svd');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              warperMode === 'svd'
                ? 'bg-cyber-amber text-black font-bold shadow-amber-glow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <CircleDot className="w-3 h-3" /> SVD Breakdown (UΣVᵀ)
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 min-h-[330px] flex items-center justify-center bg-[#090D16] rounded-lg overflow-hidden border border-[#1E2D4A]/50 cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={520}
          height={520}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          className="w-full h-full object-contain"
        />

        {/* Overlay Badges */}
        <div className="absolute top-2 left-2 bg-[#0E1524]/85 backdrop-blur-md px-2.5 py-1.5 rounded text-[10px] font-mono border border-[#1E2D4A] text-slate-300 pointer-events-none space-y-1">
          {warperMode === 'svd' ? (
            <>
              <div className="flex items-center gap-1.5 text-cyber-cyan font-bold">
                <span className="w-2 h-2 rounded-full border border-cyber-cyan bg-cyber-cyan/30" />
                Unit Circle deforming into Ellipse
              </div>
              <div className="flex items-center gap-1.5 text-cyber-amber">
                <span className="w-2.5 h-0.5 bg-cyber-amber inline-block" />
                Semi-major axis σ₁ = {svd.singularValues[0].toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5 text-cyber-violet">
                <span className="w-2.5 h-0.5 bg-cyber-violet inline-block" />
                Semi-minor axis σ₂ = {svd.singularValues[1].toFixed(2)}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Basis î
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Basis ĵ
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00F5D4]" /> Class 0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF2A85]" /> Class 1
              </span>
            </div>
          )}
        </div>

        {/* Coordinate HUD */}
        {hoverCoord && (
          <div className="absolute bottom-2 left-2 bg-[#0E1524]/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono border border-[#1E2D4A] text-slate-300 pointer-events-none">
            x: <span className="text-cyber-cyan">{hoverCoord.x.toFixed(2)}</span>, y:{' '}
            <span className="text-cyber-cyan">{hoverCoord.y.toFixed(2)}</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 bg-[#0E1524]/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono border border-[#1E2D4A] text-slate-400 pointer-events-none">
          Click canvas to add point
        </div>
      </div>

      {/* SVD LIVE KATEX MATRICES BANNER */}
      {warperMode === 'svd' && (
        <div className="mt-2.5 bg-[#0B101D] p-2.5 rounded-lg border border-[#1E2D4A] font-mono text-[11px] overflow-x-auto">
          <div className="text-center">
            <MathView
              math={`W_1 = U \\cdot \\Sigma \\cdot V^T`}
              block
              className="text-xs text-cyber-amber font-bold mb-1"
            />
            <MathView
              math={`\\begin{pmatrix} ${weights.W1[0][0].toFixed(2)} & ${weights.W1[0][1].toFixed(2)} \\\\ ${weights.W1[1][0].toFixed(2)} & ${weights.W1[1][1].toFixed(2)} \\end{pmatrix} = \\begin{pmatrix} ${svd.U[0][0].toFixed(2)} & ${svd.U[0][1].toFixed(2)} \\\\ ${svd.U[1][0].toFixed(2)} & ${svd.U[1][1].toFixed(2)} \\end{pmatrix} \\begin{pmatrix} ${svd.singularValues[0].toFixed(2)} & 0.00 \\\\ 0.00 & ${svd.singularValues[1].toFixed(2)} \\end{pmatrix} \\begin{pmatrix} ${svd.VT[0][0].toFixed(2)} & ${svd.VT[0][1].toFixed(2)} \\\\ ${svd.VT[1][0].toFixed(2)} & ${svd.VT[1][1].toFixed(2)} \\end{pmatrix}`}
              block
              className="text-xs text-slate-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[9px] mt-2 pt-2 border-t border-[#1E2D4A]">
            <span
              className={`p-1 rounded font-bold transition-all ${
                tauSVD > 2.0 ? 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta' : 'text-slate-400'
              }`}
            >
              U: Output Rotation
            </span>
            <span
              className={`p-1 rounded font-bold transition-all ${
                tauSVD > 1.0 && tauSVD <= 2.0
                  ? 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber'
                  : 'text-slate-400'
              }`}
            >
              Σ: Ellipse Semi-Axes (σ₁, σ₂)
            </span>
            <span
              className={`p-1 rounded font-bold transition-all ${
                tauSVD <= 1.0
                  ? 'bg-cyber-violet/20 text-cyber-violet border border-cyber-violet'
                  : 'text-slate-400'
              }`}
            >
              Vᵀ: Input Rotation
            </span>
          </div>
        </div>
      )}

      {/* CONTROLS BAR: SVD 3-Stage Sub-Scrubber vs Homotopy Scrubber */}
      <div className="mt-2.5 space-y-2 pt-2 border-t border-[#1E2D4A]/60">
        {warperMode === 'svd' ? (
          /* SVD 3-STAGE SUB-SCRUBBER */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200 flex items-center gap-1.5 font-semibold">
                <CircleDot className="w-3.5 h-3.5 text-cyber-amber" />
                SVD 3-Stage Sub-Scrubber <span className="text-cyber-amber">τ_svd ∈ [0, 3]</span>:
              </span>
              <span className="text-cyber-amber font-bold bg-[#131B2E] px-2 py-0.5 rounded border border-[#2A374F]">
                τ_svd = {tauSVD.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlayingSVD(!isPlayingSVD)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPlayingSVD
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500'
                    : 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber hover:bg-cyber-amber/30'
                }`}
              >
                {isPlayingSVD ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause SVD
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Animate SVD
                  </>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="3"
                step="0.01"
                value={tauSVD}
                onChange={e => {
                  setIsPlayingSVD(false);
                  onChangeTauSVD(parseFloat(e.target.value));
                }}
                className="flex-1 slider-amber"
              />

              <button
                onClick={() => {
                  setIsPlayingSVD(false);
                  onChangeTauSVD(0);
                }}
                className="p-1.5 rounded-lg bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] text-slate-300"
                title="Reset to Unit Circle (τ_svd = 0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SVD 3 Stage Presets */}
            <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono text-center">
              <button
                onClick={() => {
                  setIsPlayingSVD(false);
                  onChangeTauSVD(0.0);
                }}
                className={`p-1.5 rounded border transition-colors ${
                  tauSVD === 0.0
                    ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/15 font-bold'
                    : 'border-[#1E2D4A] text-slate-400 hover:text-white'
                }`}
              >
                Stage 0: Unit Circle (I)
              </button>
              <button
                onClick={() => {
                  setIsPlayingSVD(false);
                  onChangeTauSVD(1.0);
                }}
                className={`p-1.5 rounded border transition-colors ${
                  tauSVD > 0.0 && tauSVD <= 1.0
                    ? 'border-cyber-violet text-cyber-violet bg-cyber-violet/20 font-bold'
                    : 'border-[#1E2D4A] text-slate-400 hover:text-white'
                }`}
              >
                Stage 1: [0→1] Rotate Vᵀ
              </button>
              <button
                onClick={() => {
                  setIsPlayingSVD(false);
                  onChangeTauSVD(2.0);
                }}
                className={`p-1.5 rounded border transition-colors ${
                  tauSVD > 1.0 && tauSVD <= 2.0
                    ? 'border-cyber-amber text-cyber-amber bg-cyber-amber/20 font-bold'
                    : 'border-[#1E2D4A] text-slate-400 hover:text-white'
                }`}
              >
                Stage 2: [1→2] Stretch Σ (Ellipse)
              </button>
              <button
                onClick={() => {
                  setIsPlayingSVD(false);
                  onChangeTauSVD(3.0);
                }}
                className={`p-1.5 rounded border transition-colors ${
                  tauSVD > 2.0
                    ? 'border-cyber-magenta text-cyber-magenta bg-cyber-magenta/20 font-bold'
                    : 'border-[#1E2D4A] text-slate-400 hover:text-white'
                }`}
              >
                Stage 3: [2→3] Rotate U (W₁)
              </button>
            </div>
          </div>
        ) : (
          /* NEURAL HOMOTOPY SCRUBBER */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-200 flex items-center gap-1.5 font-semibold">
                Neural Homotopy Scrubber <span className="text-cyber-cyan">τ ∈ [0, 3]</span>:
              </span>
              <span className="text-cyber-cyan font-bold bg-[#131B2E] px-2 py-0.5 rounded border border-[#2A374F]">
                τ = {tau.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlayingHomotopy(!isPlayingHomotopy)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPlayingHomotopy
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500'
                    : 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan/25'
                }`}
              >
                {isPlayingHomotopy ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Play Folding
                  </>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="3"
                step="0.01"
                value={tau}
                onChange={e => {
                  setIsPlayingHomotopy(false);
                  onChangeTau(parseFloat(e.target.value));
                }}
                className="flex-1"
              />

              <button
                onClick={() => {
                  setIsPlayingHomotopy(false);
                  onChangeTau(0);
                }}
                className="p-1.5 rounded-lg bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] text-slate-300"
                title="Reset to Input Space (τ = 0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Phase Markers */}
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center pt-1 text-slate-400">
              <div
                onClick={() => {
                  setIsPlayingHomotopy(false);
                  onChangeTau(1.0);
                }}
                className={`cursor-pointer p-1 rounded border transition-colors ${
                  tau <= 1.0
                    ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 font-bold'
                    : 'border-transparent hover:border-[#1E2D4A]'
                }`}
              >
                [0 → 1] Affine Warp
              </div>
              <div
                onClick={() => {
                  setIsPlayingHomotopy(false);
                  onChangeTau(2.0);
                }}
                className={`cursor-pointer p-1 rounded border transition-colors ${
                  tau > 1.0 && tau <= 2.0
                    ? 'border-cyber-magenta text-cyber-magenta bg-cyber-magenta/10 font-bold'
                    : 'border-transparent hover:border-[#1E2D4A]'
                }`}
              >
                [1 → 2] Non-Linear Fold
              </div>
              <div
                onClick={() => {
                  setIsPlayingHomotopy(false);
                  onChangeTau(3.0);
                }}
                className={`cursor-pointer p-1 rounded border transition-colors ${
                  tau > 2.0
                    ? 'border-cyber-amber text-cyber-amber bg-cyber-amber/10 font-bold'
                    : 'border-transparent hover:border-[#1E2D4A]'
                }`}
              >
                [2 → 3] Hyperplane Cut
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
