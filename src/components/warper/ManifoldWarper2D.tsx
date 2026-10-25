import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point2D, Matrix2x2, Vector2D, NetworkWeights } from '../../math/types';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { Activations } from '../../math/activations';

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
  className?: string;
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
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Coordinate domain [-3.5, 3.5]
  const domain = 3.5;

  // Core Mapping Function: R^2 -> R^2 based on active mode
  const mapPoint = useCallback(
    (x: number, y: number): [number, number] => {
      if (warperMode === 'svd') {
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
        // Stage 3: Output Projection
        const z1_0 = weights.W1[0][0] * x + weights.W1[0][1] * y + weights.b1[0];
        const z1_1 = weights.W1[1][0] * x + weights.W1[1][1] * y + weights.b1[1];
        const a1_0 = Activations.fn(z1_0, weights.activation);
        const a1_1 = Activations.fn(z1_1, weights.activation);
        return [a1_0, a1_1];
      }
    },
    [weights, warperMode, tau, tauSVD]
  );

  // Resize and Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Canvas scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    const cx = width / 2;
    const cy = height / 2;
    // Scale so domain fits cleanly with padding
    const minDim = Math.min(width, height);
    const scale = minDim / (domain * 2.1);

    const toScreen = (x: number, y: number): [number, number] => [
      cx + x * scale,
      cy - y * scale,
    ];

    const toWorld = (sx: number, sy: number): [number, number] => [
      (sx - cx) / scale,
      (cy - sy) / scale,
    ];

    // 1. Clear background to Obsidian void
    ctx.fillStyle = '#05070B';
    ctx.fillRect(0, 0, width, height);

    // 2. Decision Boundary Probability Heatmap
    if (showHeatmap && warperMode === 'homotopy') {
      const res = 56;
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
            const alpha = (0.5 - prob) * 0.35;
            ctx.fillStyle = `rgba(0, 245, 212, ${alpha})`;
          } else {
            const alpha = (prob - 0.5) * 0.35;
            ctx.fillStyle = `rgba(255, 42, 133, ${alpha})`;
          }
          ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
        }
      }
    }

    // 3. Sub-grid & Major Grid (3Blue1Brown Style)
    const gridRange = 3.5;
    const samplesPerLine = 48;

    // Faint Sub-grid lines every 0.25 units
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    for (let gy = -gridRange; gy <= gridRange + 1e-5; gy += 0.25) {
      if (Math.abs(gy % 1.0) < 0.05) continue; // skip major lines
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
    for (let gx = -gridRange; gx <= gridRange + 1e-5; gx += 0.25) {
      if (Math.abs(gx % 1.0) < 0.05) continue;
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

    // Crisp Major Grid lines every 1.0 unit
    for (let gy = -gridRange; gy <= gridRange + 1e-5; gy += 1.0) {
      const isAxis = Math.abs(gy) < 1e-4;
      ctx.lineWidth = isAxis ? 1.5 : 1.0;
      ctx.strokeStyle = isAxis ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 245, 212, 0.14)';
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

    for (let gx = -gridRange; gx <= gridRange + 1e-5; gx += 1.0) {
      const isAxis = Math.abs(gx) < 1e-4;
      ctx.lineWidth = isAxis ? 1.5 : 1.0;
      ctx.strokeStyle = isAxis ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 245, 212, 0.14)';
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

    // Helper: Draw Vector Arrow with glowing hat
    const drawVector = (
      from: [number, number],
      to: [number, number],
      color: string,
      label: string,
      lineWidth = 2.5
    ) => {
      const dx = to[0] - from[0];
      const dy = to[1] - from[1];
      const angle = Math.atan2(dy, dx);
      const headLen = 10;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

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
      ctx.shadowBlur = 0;

      // Vector label with background pill
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      const labelMetrics = ctx.measureText(label);
      const lx = to[0] + 10;
      const ly = to[1] - 4;

      ctx.fillStyle = 'rgba(5, 7, 11, 0.85)';
      ctx.fillRect(lx - 2, ly - 10, labelMetrics.width + 4, 13);
      ctx.fillStyle = color;
      ctx.fillText(label, lx, ly);
    };

    // 4. Parallelogram & Basis Vectors î and ĵ (Homotopy Mode)
    if (warperMode === 'homotopy') {
      const pO = mapPoint(0, 0);
      const pI = mapPoint(1, 0);
      const pDiag = mapPoint(1, 1);
      const pJ = mapPoint(0, 1);

      const sO = toScreen(pO[0], pO[1]);
      const sI = toScreen(pI[0], pI[1]);
      const sDiag = toScreen(pDiag[0], pDiag[1]);
      const sJ = toScreen(pJ[0], pJ[1]);

      // Fill Transformed Parallelogram
      ctx.beginPath();
      ctx.moveTo(sO[0], sO[1]);
      ctx.lineTo(sI[0], sI[1]);
      ctx.lineTo(sDiag[0], sDiag[1]);
      ctx.lineTo(sJ[0], sJ[1]);
      ctx.closePath();

      // Translucent emerald / cyan gradient fill
      const grad = ctx.createLinearGradient(sO[0], sO[1], sDiag[0], sDiag[1]);
      grad.addColorStop(0, 'rgba(0, 245, 212, 0.22)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.12)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 245, 212, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Floating Area Label inside centroid of parallelogram
      const centroidX = (sO[0] + sI[0] + sDiag[0] + sJ[0]) / 4;
      const centroidY = (sO[1] + sI[1] + sDiag[1] + sJ[1]) / 4;

      // Calculate live determinant area scaling
      const detVal = LinearAlgebra.det(weights.W1);
      const currentArea = (1 - Math.min(1, tau)) * 1.0 + Math.min(1, tau) * Math.abs(detVal);

      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      const areaText = `Area = |det| = ${currentArea.toFixed(2)}x`;
      const textWidth = ctx.measureText(areaText).width;

      ctx.fillStyle = 'rgba(5, 7, 11, 0.85)';
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(centroidX - textWidth / 2 - 5, centroidY - 8, textWidth + 10, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00F5D4';
      ctx.textAlign = 'center';
      ctx.fillText(areaText, centroidX, centroidY + 3);
      ctx.textAlign = 'start'; // reset

      // Draw Basis Vectors î and ĵ
      drawVector(sO, sI, '#10B981', 'î');
      drawVector(sO, sJ, '#F59E0B', 'ĵ');
    }

    // 5. Activation Fold Crease Lines (tau in [1, 2])
    if (warperMode === 'homotopy' && tau >= 0.9 && tau <= 2.2) {
      // Line 1: w11 * x + w12 * y + b1 = 0
      // Line 2: w21 * x + w22 * y + b2 = 0
      const lines = [
        { w: weights.W1[0], b: weights.b1[0], label: 'Fold Axis 1' },
        { w: weights.W1[1], b: weights.b1[1], label: 'Fold Axis 2' },
      ];

      lines.forEach(({ w, b, label }, idx) => {
        if (Math.abs(w[0]) < 1e-4 && Math.abs(w[1]) < 1e-4) return;

        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = idx === 0 ? 'rgba(139, 92, 246, 0.85)' : 'rgba(255, 42, 133, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = idx === 0 ? '#8B5CF6' : '#FF2A85';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        const foldSamples = 40;
        for (let s = 0; s <= foldSamples; s++) {
          const tLine = -3.5 + (s / foldSamples) * 7.0;
          let lx = 0, ly = 0;
          if (Math.abs(w[1]) > Math.abs(w[0])) {
            lx = tLine;
            ly = (-b - w[0] * lx) / w[1];
          } else {
            ly = tLine;
            lx = (-b - w[1] * ly) / w[0];
          }

          const [mx, my] = mapPoint(lx, ly);
          const [sx, sy] = toScreen(mx, my);
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    // 6. SVD Unit Circle & Ellipse Deformation (SVD Mode)
    if (warperMode === 'svd') {
      const circlePts = 140;
      ctx.beginPath();
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
      ctx.fillStyle = 'rgba(0, 245, 212, 0.14)';
      ctx.fill();

      ctx.strokeStyle = '#00F5D4';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Principal Semi-Axes Vectors of the Ellipse
      const axes = LinearAlgebra.getSVDEllipseAxes(weights.W1, tauSVD);
      const originScreen = toScreen(0, 0);
      const sAxis1 = toScreen(axes.axis1[0], axes.axis1[1]);
      const sAxis2 = toScreen(axes.axis2[0], axes.axis2[1]);

      drawVector(originScreen, sAxis1, '#F59E0B', `σ₁: ${axes.len1.toFixed(2)}`, 2.5);
      drawVector(originScreen, sAxis2, '#8B5CF6', `σ₂: ${axes.len2.toFixed(2)}`, 2.5);
    }

    // 7. Decision Boundary Hyperplane (tau >= 1.5)
    if (warperMode === 'homotopy' && tau >= 1.5) {
      const w2_0 = weights.W2[0];
      const w2_1 = weights.W2[1];
      const b2 = weights.b2;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#00F5D4';
      ctx.shadowBlur = 12;
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

    // 8. Data Points with Outer Halos & White Cores
    for (const pt of dataset) {
      const [mx, my] = mapPoint(pt.x, pt.y);
      const [sx, sy] = toScreen(mx, my);

      // Outer radial glow halo
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, 2 * Math.PI);
      ctx.fillStyle = pt.label === 0 ? 'rgba(0, 245, 212, 0.28)' : 'rgba(255, 42, 133, 0.28)';
      ctx.fill();

      // Colored body ring
      ctx.beginPath();
      ctx.arc(sx, sy, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = pt.label === 0 ? '#00F5D4' : '#FF2A85';
      ctx.shadowColor = pt.label === 0 ? 'rgba(0, 245, 212, 0.9)' : 'rgba(255, 42, 133, 0.9)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Crisp White Core Dot
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

    // 9. Coordinate Crosshair at Origin
    const [scx, scy] = toScreen(0, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scx - 8, scy);
    ctx.lineTo(scx + 8, scy);
    ctx.moveTo(scx, scy - 8);
    ctx.lineTo(scx, scy + 8);
    ctx.stroke();
  }, [weights, dataset, tau, tauSVD, warperMode, showHeatmap, mapPoint]);

  // Click on canvas to add a point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const minDim = Math.min(rect.width, rect.height);
    const scale = minDim / (domain * 2.1);

    const x = (sx - cx) / scale;
    const y = (cy - sy) / scale;

    onAddPoint({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      label: activeClass,
    });
  };

  // Hover coordinate tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const minDim = Math.min(rect.width, rect.height);
    const scale = minDim / (domain * 2.1);

    setHoverCoord({
      x: (sx - cx) / scale,
      y: (cy - sy) / scale,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#05070B] ${className}`}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverCoord(null)}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Coordinate Telemetry HUD (Bottom Left) */}
      {hoverCoord && (
        <div className="absolute bottom-6 left-6 pointer-events-none z-10 glass-pill px-3 py-1 rounded-full text-[10px] font-mono text-slate-300">
          <span>x: <strong className="text-cyber-cyan tabular-nums">{hoverCoord.x.toFixed(2)}</strong></span>
          <span className="mx-2 text-slate-600">|</span>
          <span>y: <strong className="text-cyber-amber tabular-nums">{hoverCoord.y.toFixed(2)}</strong></span>
        </div>
      )}
    </div>
  );
};
