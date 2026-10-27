import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sliders,
  TrendingDown,
  Brain,
  Monitor,
  MousePointer,
  GraduationCap,
  BarChart3,
  Target,
  ChevronRight,
  Database,
  Cpu,
  LineChart,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { Point2D, NetworkWeights, Matrix2x2, Vector2D } from '../../math/types';
import { DatasetPreset, Datasets } from '../../math/datasets';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { Activations } from '../../math/activations';

interface ConsoleStudioProps {
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  dataset: Point2D[];
  setDataset: React.Dispatch<React.SetStateAction<Point2D[]>>;
  activeClass: 0 | 1;
  onSetActiveClass: (cls: 0 | 1) => void;
  onAddPoint: (pt: Point2D) => void;
  onUndoPoint: () => void;
  onClearDataset: () => void;
  weights: NetworkWeights;
  onChangeW1: (newW1: Matrix2x2) => void;
  onChangeB1: (newB1: Vector2D) => void;
  isTraining: boolean;
  onToggleTraining: () => void;
  onStepOnce: () => void;
  onResetModel: () => void;
  epoch: number;
  loss: number;
  accuracy: number;
  tau: number;
  onChangeTau: (updater: number | ((prevTau: number) => number)) => void;
  onTriggerSingularMatrix: () => void;
  onTriggerDeadReLU: () => void;
  isSingularActive: boolean;
  isDeadReLUActive: boolean;
  intuitionMode: boolean;
  onToggleIntuitionMode: () => void;
  onLaunchJudgeDemo: () => void;
  onSwitchToStory: () => void;
  onSwitchTo3DLoss: () => void;
  lastChangedParam?: string;
}

export const ConsoleStudio: React.FC<ConsoleStudioProps> = ({
  currentPreset,
  onSelectPreset,
  dataset,
  setDataset,
  activeClass,
  onSetActiveClass,
  onAddPoint,
  onUndoPoint,
  onClearDataset,
  weights,
  onChangeW1,
  onChangeB1,
  isTraining,
  onToggleTraining,
  onStepOnce,
  onResetModel,
  epoch,
  loss,
  accuracy,
  tau,
  onChangeTau,
  onTriggerSingularMatrix,
  onTriggerDeadReLU,
  isSingularActive,
  isDeadReLUActive,
  intuitionMode,
  onToggleIntuitionMode,
  onLaunchJudgeDemo,
  onSwitchToStory,
  onSwitchTo3DLoss,
  lastChangedParam = '',
}) => {
  // Local state for dataset configuration sliders matching Slide 2
  const [pointsPerClass, setPointsPerClass] = useState<number>(50);
  const [noiseLevel, setNoiseLevel] = useState<number>(0.1);
  const [hiddenNeurons, setHiddenNeurons] = useState<number>(2);
  const [activeParamTab, setActiveParamTab] = useState<'W1' | 'b1' | 'W2' | 'b2'>('W1');

  // Canvas refs and hover state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; prob: number } | null>(null);

  // Re-generate dataset when preset, pointsPerClass, or noiseLevel changes
  const handleDatasetParamsChange = (preset: DatasetPreset, pts: number, noise: number) => {
    const newPts = Datasets.generateWithParams(preset, pts, noise);
    setDataset(newPts);
  };

  // 2D Coordinate domain [-3, 3]
  const domain = 3.0;

  // Evaluate neural network forward pass at (x, y)
  const forwardPass = useCallback(
    (x: number, y: number): { z2: number; prob: number } => {
      // Input layer -> Hidden Layer 1
      const z1_0 = weights.W1[0][0] * x + weights.W1[0][1] * y + weights.b1[0];
      const z1_1 = weights.W1[1][0] * x + weights.W1[1][1] * y + weights.b1[1];

      // Fold activation via tau
      let a1_0 = z1_0;
      let a1_1 = z1_1;
      if (tau <= 1.0) {
        // Homotopy in progress
        a1_0 = (1 - tau) * x + tau * z1_0;
        a1_1 = (1 - tau) * y + tau * z1_1;
      } else {
        const foldT = tau - 1.0;
        a1_0 = Activations.interpolateFolding(z1_0, foldT, weights.activation);
        a1_1 = Activations.interpolateFolding(z1_1, foldT, weights.activation);
      }

      // Hidden -> Output
      const z2 = weights.W2[0] * a1_0 + weights.W2[1] * a1_1 + weights.b2;
      const prob = Activations.fn(z2, 'sigmoid');
      return { z2, prob };
    },
    [weights, tau]
  );

  // Render Coordinate Plane, Points, and Decision Boundary on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate transforms
    const toScreenX = (x: number) => ((x + domain) / (2 * domain)) * width;
    const toScreenY = (y: number) => ((domain - y) / (2 * domain)) * height;
    const toWorldX = (px: number) => (px / width) * (2 * domain) - domain;
    const toWorldY = (py: number) => domain - (py / height) * (2 * domain);

    // 1. Clear background
    ctx.fillStyle = '#0F0F17';
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Soft Heatmap (Fast 60x60 grid)
    const gridSize = 60;
    const cellW = width / gridSize;
    const cellH = height / gridSize;

    for (let i = 0; i < gridSize; i++) {
      const wx = toWorldX((i + 0.5) * cellW);
      for (let j = 0; j < gridSize; j++) {
        const wy = toWorldY((j + 0.5) * cellH);
        const { prob } = forwardPass(wx, wy);

        // Class 0 (silver grey) vs Class 1 (coral pink)
        if (prob > 0.5) {
          const alpha = Math.min(0.22, (prob - 0.5) * 0.44);
          ctx.fillStyle = `rgba(255, 94, 126, ${alpha})`;
        } else {
          const alpha = Math.min(0.18, (0.5 - prob) * 0.36);
          ctx.fillStyle = `rgba(142, 142, 158, ${alpha})`;
        }
        ctx.fillRect(i * cellW, j * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // 3. Grid Lines (-3 to +3)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1E1E2C';
    ctx.beginPath();
    for (let val = -3; val <= 3; val += 1) {
      if (val === 0) continue; // Axes drawn separately
      const sx = toScreenX(val);
      const sy = toScreenY(val);

      // Vertical line
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);

      // Horizontal line
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // 4. Main Coordinate Axes (X and Y)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#323246';
    ctx.beginPath();
    // X Axis
    const originY = toScreenY(0);
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);

    // Y Axis
    const originX = toScreenX(0);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // 5. Axis Tick Numbers
    ctx.fillStyle = '#6E6E85';
    ctx.font = '10px "Inter", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let val = -3; val <= 3; val += 1) {
      if (val === 0) continue;
      // X labels
      const sx = toScreenX(val);
      ctx.fillText(val.toString(), sx, originY + 4);

      // Y labels
      const sy = toScreenY(val);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(val.toString(), originX - 6, sy);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
    }

    // Origin label '0'
    ctx.fillText('0', originX - 8, originY + 4);

    // Axis End Titles 'X' and 'Y'
    ctx.fillStyle = '#9E9EAF';
    ctx.font = 'bold 11px "Inter", sans-serif';
    ctx.fillText('X', width - 12, originY + 4);
    ctx.fillText('Y', originX + 12, 10);

    // 6. Draw Decision Boundary (Contour where prob = 0.5 <=> z2 = 0)
    // Marching squares over an 80x80 sample grid
    const segs: Array<[[number, number], [number, number]]> = [];
    const step = 0.08;
    const zCache: number[][] = [];

    const minW = -domain;
    const maxW = domain;
    const nSteps = Math.ceil((maxW - minW) / step);

    for (let i = 0; i <= nSteps; i++) {
      zCache[i] = [];
      const wx = minW + i * step;
      for (let j = 0; j <= nSteps; j++) {
        const wy = minW + j * step;
        zCache[i][j] = forwardPass(wx, wy).z2;
      }
    }

    // Find zero-crossing segments
    for (let i = 0; i < nSteps; i++) {
      const wx0 = minW + i * step;
      const wx1 = wx0 + step;
      for (let j = 0; j < nSteps; j++) {
        const wy0 = minW + j * step;
        const wy1 = wy0 + step;

        const z00 = zCache[i][j];
        const z10 = zCache[i + 1][j];
        const z11 = zCache[i + 1][j + 1];
        const z01 = zCache[i][j + 1];

        // Linear interpolation for zero crossing
        const pts: [number, number][] = [];

        // Bottom edge (wy0, between wx0 and wx1)
        if ((z00 >= 0 && z10 < 0) || (z00 < 0 && z10 >= 0)) {
          const t = z00 / (z00 - z10);
          pts.push([wx0 + t * step, wy0]);
        }
        // Right edge (wx1, between wy0 and wy1)
        if ((z10 >= 0 && z11 < 0) || (z10 < 0 && z11 >= 0)) {
          const t = z10 / (z10 - z11);
          pts.push([wx1, wy0 + t * step]);
        }
        // Top edge (wy1, between wx0 and wx1)
        if ((z01 >= 0 && z11 < 0) || (z01 < 0 && z11 >= 0)) {
          const t = z01 / (z01 - z11);
          pts.push([wx0 + t * step, wy1]);
        }
        // Left edge (wx0, between wy0 and wy1)
        if ((z00 >= 0 && z01 < 0) || (z00 < 0 && z01 >= 0)) {
          const t = z00 / (z00 - z01);
          pts.push([wx0, wy0 + t * step]);
        }

        if (pts.length >= 2) {
          segs.push([pts[0], pts[1]]);
        }
      }
    }

    // Stroke the Decision Boundary with exact dashed line style matching Slide 2
    ctx.save();
    ctx.setLineDash([7, 5]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(255, 94, 126, 0.4)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    segs.forEach(([p1, p2]) => {
      ctx.moveTo(toScreenX(p1[0]), toScreenY(p1[1]));
      ctx.lineTo(toScreenX(p2[0]), toScreenY(p2[1]));
    });
    ctx.stroke();
    ctx.restore();

    // 7. Plot Data Points (Class 0: Silver Circles, Class 1: Coral Pink Diamonds)
    dataset.forEach(pt => {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);

      if (pt.label === 0) {
        // Class 0: Silver Grey Circular Point
        ctx.save();
        ctx.fillStyle = '#8E8E9E';
        ctx.strokeStyle = '#BDBDD0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        // Class 1: Vibrant Pink Coral Diamond
        ctx.save();
        ctx.fillStyle = '#FF5E7E';
        ctx.strokeStyle = '#FFA0B3';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#FF5E7E';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const r = 5.5;
        ctx.moveTo(sx, sy - r);
        ctx.lineTo(sx + r, sy);
        ctx.lineTo(sx, sy + r);
        ctx.lineTo(sx - r, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });

    // 8. Hover Coordinate Indicator
    if (hoverCoord) {
      const hx = toScreenX(hoverCoord.x);
      const hy = toScreenY(hoverCoord.y);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 94, 126, 0.6)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, height);
      ctx.moveTo(0, hy);
      ctx.lineTo(width, hy);
      ctx.stroke();
      ctx.restore();
    }
  }, [dataset, weights, tau, hoverCoord, forwardPass]);

  // Handle canvas clicks to add new data points
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const wx = (px / canvas.width) * (2 * domain) - domain;
    const wy = domain - (py / canvas.height) * (2 * domain);

    onAddPoint({
      x: parseFloat(wx.toFixed(3)),
      y: parseFloat(wy.toFixed(3)),
      label: activeClass,
      id: `custom-${activeClass}-${Date.now()}`,
    });
  };

  // Handle canvas mouse move for coordinate inspection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const wx = (px / canvas.width) * (2 * domain) - domain;
    const wy = domain - (py / canvas.height) * (2 * domain);

    const { prob } = forwardPass(wx, wy);
    setHoverCoord({
      x: parseFloat(wx.toFixed(2)),
      y: parseFloat(wy.toFixed(2)),
      prob: parseFloat(prob.toFixed(3)),
    });
  };

  const handleCanvasMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="w-full min-h-screen pt-4 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* ================= 1. HEADER & 4 BADGES (MATCHING SLIDE 2) ================= */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#262636] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-[#FF5E7E] rounded-full inline-block" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#FF5E7E]">
              MathX Ideathon
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Introducing <span className="text-[#FF5E7E]">GlassBox NN</span>
          </h1>
          <p className="text-sm md:text-base text-[#9E9EAF] mt-2 max-w-2xl">
            An interactive, zero-installation platform to explore, visualize and{' '}
            <strong className="text-white">understand neural networks</strong>.
          </p>
        </div>

        {/* 4 Feature Badges on Top Right */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 font-sans">
          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <Monitor className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Browser Based</strong>
            <span className="text-[10px] text-[#9E9EAF]">No installation required</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <MousePointer className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Interactive</strong>
            <span className="text-[10px] text-[#9E9EAF]">Hands-on learning</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <GraduationCap className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Beginner to Adv.</strong>
            <span className="text-[10px] text-[#9E9EAF]">Step-by-step guidance</span>
          </div>

          <div className="p-3 rounded-xl bg-[#14141E] border border-[#262636] flex flex-col items-center text-center space-y-1">
            <BarChart3 className="w-4 h-4 text-[#FF5E7E]" />
            <strong className="text-xs text-white">Math Made Visual</strong>
            <span className="text-[10px] text-[#9E9EAF]">See learning process</span>
          </div>
        </div>
      </section>

      {/* ================= 2. THE MAIN CONSOLE WINDOW (MATCHING SLIDE 2) ================= */}
      <div className="relative rounded-3xl border border-[#262636] bg-[#0E0E18] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Console Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#262636] bg-[#141422] flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF5E7E] to-[#FF4767] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,94,126,0.5)]">
              <Brain className="w-3.5 h-3.5" />
            </div>
            <span className="font-black text-sm text-white tracking-tight flex items-center gap-1">
              GlassBox <span className="text-[#FF5E7E]">NN</span>
            </span>
          </div>

          {/* Nav Tabs Matching Presentation */}
          <div className="flex items-center p-1 rounded-xl bg-[#0A0A10] border border-[#262636] text-xs font-semibold">
            <button
              className="px-3.5 py-1.5 rounded-lg bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold transition-all"
            >
              Playground
            </button>

            <button
              onClick={onSwitchToStory}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              The Story
            </button>

            <button
              onClick={onSwitchTo3DLoss}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              3D Loss Valley
            </button>

            <button
              onClick={onLaunchJudgeDemo}
              className="px-3.5 py-1.5 rounded-lg text-[#9E9EAF] hover:text-white transition-colors"
            >
              Demo
            </button>
          </div>

          {/* Right Mode Toggle & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleIntuitionMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                intuitionMode
                  ? 'border-[#FF5E7E]/60 bg-[#FF5E7E]/10 text-[#FF5E7E]'
                  : 'border-[#8B5CF6]/60 bg-[#8B5CF6]/10 text-[#C4B5FD]'
              }`}
            >
              <span>{intuitionMode ? '💡 Intuition' : '∑ Full Math'}</span>
            </button>

            <button
              onClick={onResetModel}
              className="p-1.5 rounded-xl border border-[#262636] bg-[#141422] text-[#9E9EAF] hover:text-white hover:border-[#FF5E7E]/50 transition-all"
              title="Reset Model Weights"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Console 3-Column Content */}
        <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= COLUMN 1: DATA & TASK + MODEL ARCHITECTURE ================= */}
          <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
            {/* 1.1 Data & Task Card */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#262636] space-y-4">
              <div className="flex items-center justify-between border-b border-[#262636] pb-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#FF5E7E]" />
                  Data & Task
                </span>
                <span className="text-[10px] text-[#9E9EAF] font-mono">2D Points</span>
              </div>

              {/* Dataset Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-[#9E9EAF] font-semibold block">Dataset</label>
                <select
                  value={currentPreset}
                  onChange={e => {
                    const preset = e.target.value as DatasetPreset;
                    onSelectPreset(preset);
                    handleDatasetParamsChange(preset, pointsPerClass, noiseLevel);
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-[#0A0A10] border border-[#262636] text-xs text-white font-medium focus:border-[#FF5E7E] focus:outline-none transition-colors"
                >
                  <option value="linear">Linear (Separable)</option>
                  <option value="xor">XOR (Nonlinear)</option>
                  <option value="moons">Two Moons</option>
                  <option value="circles">Concentric Rings</option>
                </select>
              </div>

              {/* Points Per Class Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#9E9EAF] font-semibold">Points per class</span>
                  <span className="font-mono text-white bg-[#0A0A10] px-2 py-0.5 rounded border border-[#262636]">
                    {pointsPerClass}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={pointsPerClass}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10);
                    setPointsPerClass(val);
                    handleDatasetParamsChange(currentPreset, val, noiseLevel);
                  }}
                  className="w-full accent-[#FF5E7E] cursor-pointer"
                />
              </div>

              {/* Noise Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#9E9EAF] font-semibold">Noise</span>
                  <span className="font-mono text-white bg-[#0A0A10] px-2 py-0.5 rounded border border-[#262636]">
                    {noiseLevel.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.5}
                  step={0.05}
                  value={noiseLevel}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setNoiseLevel(val);
                    handleDatasetParamsChange(currentPreset, pointsPerClass, val);
                  }}
                  className="w-full accent-[#FF5E7E] cursor-pointer"
                />
              </div>

              {/* Add Custom Point Class Toggle */}
              <div className="pt-2 border-t border-[#262636] flex items-center justify-between">
                <span className="text-[10px] text-[#9E9EAF]">Click Canvas to Add:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSetActiveClass(0)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                      activeClass === 0
                        ? 'border-white bg-white/20 text-white'
                        : 'border-[#262636] bg-[#0A0A10] text-[#8E8E9E]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#8E8E9E]" />
                    Class 0
                  </button>

                  <button
                    onClick={() => onSetActiveClass(1)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                      activeClass === 1
                        ? 'border-[#FF5E7E] bg-[#FF5E7E]/20 text-[#FF5E7E]'
                        : 'border-[#262636] bg-[#0A0A10] text-[#8E8E9E]'
                    }`}
                  >
                    <span className="w-2 h-2 rotate-45 bg-[#FF5E7E]" />
                    Class 1
                  </button>
                </div>
              </div>
            </div>

            {/* 1.2 Model Architecture Card */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#262636] space-y-3">
              <div className="flex items-center justify-between border-b border-[#262636] pb-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#FF5E7E]" />
                  Model Architecture
                </span>
                <span className="text-[10px] text-[#FF5E7E] font-mono">ReLU</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A10] border border-[#262636]">
                  <span className="text-[#9E9EAF]">Input Layer</span>
                  <span className="font-mono text-white font-semibold">2 (X, Y)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A10] border border-[#262636]">
                  <span className="text-[#9E9EAF]">Hidden Layer</span>
                  <span className="font-mono text-[#FF5E7E] font-bold">2 neurons</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A10] border border-[#262636]">
                  <span className="text-[#9E9EAF]">Output Layer</span>
                  <span className="font-mono text-white font-semibold">1 (Sigmoid)</span>
                </div>
              </div>
            </div>

            {/* 1.3 Big Coral Gradient Train Button */}
            <div className="space-y-2">
              <button
                onClick={onToggleTraining}
                className="w-full py-3.5 rounded-2xl btn-coral flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition-all active:scale-[0.98]"
              >
                {isTraining ? (
                  <>
                    <Pause className="w-4 h-4 fill-current animate-pulse" />
                    <span>Pause AI</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Train AI ▶</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onStepOnce}
                  disabled={isTraining}
                  className="py-2 px-3 rounded-xl border border-[#262636] bg-[#141422] hover:border-[#FF5E7E]/50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <span>Step +1</span>
                </button>

                <button
                  onClick={onResetModel}
                  className="py-2 px-3 rounded-xl border border-[#262636] bg-[#141422] hover:border-rose-500/50 text-[#9E9EAF] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: CLASSIFICATION PLANE ================= */}
          <div className="lg:col-span-6 space-y-3 flex flex-col items-center">
            {/* Header & Legend */}
            <div className="w-full flex items-center justify-between border-b border-[#262636] pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                  Classification Plane
                </h3>
              </div>

              {/* Legend matching Slide 2 */}
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-[#8E8E9E]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8E8E9E]" />
                  <span>Class 0</span>
                </div>

                <div className="flex items-center gap-1.5 text-[#FF5E7E]">
                  <span className="w-2.5 h-2.5 rotate-45 bg-[#FF5E7E]" />
                  <span>Class 1</span>
                </div>

                <div className="flex items-center gap-1.5 text-white">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-white inline-block" />
                  <span>Decision Boundary</span>
                </div>
              </div>
            </div>

            {/* The 2D Coordinate Grid Canvas */}
            <div className="relative w-full aspect-square max-h-[460px] rounded-2xl overflow-hidden border border-[#262636] bg-[#0F0F17] group">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                className="w-full h-full cursor-crosshair block"
              />

              {/* Hover Coordinate Badge */}
              {hoverCoord && (
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-[#0E0E18]/90 backdrop-blur-md border border-[#FF5E7E]/40 text-xs font-mono space-y-0.5 shadow-lg pointer-events-none">
                  <div className="text-white">
                    x: <span className="text-[#53D4F4]">{hoverCoord.x}</span>, y:{' '}
                    <span className="text-[#53D4F4]">{hoverCoord.y}</span>
                  </div>
                  <div className="text-[10px] text-[#FF5E7E]">
                    P(Class 1) = {(hoverCoord.prob * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* Space Origami Folding Slider (Continuous Homotopy τ) */}
            <div className="w-full p-3 rounded-2xl bg-[#141422] border border-[#262636] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9E9EAF] font-semibold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#FF5E7E]" />
                  Origami Space Fold (τ)
                </span>
                <span className="font-mono text-[#FF5E7E] font-bold">
                  {tau <= 1.0
                    ? `Affine Stretch (${tau.toFixed(2)})`
                    : `ReLU Crease Fold (${(tau - 1.0).toFixed(2)})`}
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={2.0}
                step={0.05}
                value={tau}
                onChange={e => onChangeTau(parseFloat(e.target.value))}
                className="w-full accent-[#FF5E7E] cursor-pointer"
              />
            </div>
          </div>

          {/* ================= COLUMN 3: METRICS & PARAMETERS ================= */}
          <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
            {/* 3.1 Training Metrics Card */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#262636] space-y-3">
              <div className="flex items-center justify-between border-b border-[#262636] pb-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <LineChart className="w-3.5 h-3.5 text-[#FF5E7E]" />
                  Training Metrics
                </span>
                {accuracy >= 0.95 && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Separated
                  </span>
                )}
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#9E9EAF]">Epoch</span>
                  <span className="text-white font-semibold">{epoch} / 1000</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#9E9EAF]">Accuracy</span>
                  <span
                    className={`text-xl font-black ${
                      accuracy >= 0.9 ? 'text-emerald-400' : 'text-[#FF5E7E]'
                    }`}
                  >
                    {(accuracy * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[#0A0A10] rounded-full overflow-hidden border border-[#262636]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5E7E] to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, accuracy * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#9E9EAF]">BCE Loss</span>
                  <span className="text-white font-bold">{loss.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* 3.2 Model Parameters Card (Matrix View matching Slide 2) */}
            <div className="p-4 rounded-2xl bg-[#141422] border border-[#262636] space-y-3">
              <div className="flex items-center justify-between border-b border-[#262636] pb-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-[#FF5E7E]" />
                  Model Parameters
                </span>
              </div>

              {/* Tabs: W1, b1, W2, b2 */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#0A0A10] border border-[#262636] text-[11px] font-mono font-bold">
                {(['W1', 'b1', 'W2', 'b2'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveParamTab(tab)}
                    className={`py-1 rounded-lg transition-all ${
                      activeParamTab === tab
                        ? 'bg-[#FF5E7E] text-white shadow-sm'
                        : 'text-[#9E9EAF] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Formatted Matrix Bracket Box Matching Slide 2 */}
              <div className="p-3.5 rounded-xl bg-[#0A0A10] border border-[#262636] font-mono text-xs space-y-1">
                {activeParamTab === 'W1' && (
                  <div className="space-y-1">
                    <div className="text-[#9E9EAF] text-[10px] uppercase font-bold">
                      Layer 1 Weights (2×2 Affine Matrix):
                    </div>
                    <div className="text-white text-sm flex items-center gap-2">
                      <span className="text-[#FF5E7E]">W₁ =</span>
                      <div className="border-l-2 border-r-2 border-white px-2 py-1 space-y-0.5">
                        <div className="flex gap-4">
                          <span>{weights.W1[0][0] >= 0 ? ` ${weights.W1[0][0].toFixed(2)}` : weights.W1[0][0].toFixed(2)}</span>
                          <span>{weights.W1[0][1] >= 0 ? ` ${weights.W1[0][1].toFixed(2)}` : weights.W1[0][1].toFixed(2)}</span>
                        </div>
                        <div className="flex gap-4">
                          <span>{weights.W1[1][0] >= 0 ? ` ${weights.W1[1][0].toFixed(2)}` : weights.W1[1][0].toFixed(2)}</span>
                          <span>{weights.W1[1][1] >= 0 ? ` ${weights.W1[1][1].toFixed(2)}` : weights.W1[1][1].toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeParamTab === 'b1' && (
                  <div className="space-y-1">
                    <div className="text-[#9E9EAF] text-[10px] uppercase font-bold">
                      Layer 1 Bias Vector:
                    </div>
                    <div className="text-white text-sm flex items-center gap-2">
                      <span className="text-[#FF5E7E]">b₁ =</span>
                      <div className="border-l-2 border-r-2 border-white px-2 py-1 space-y-0.5">
                        <div>{weights.b1[0].toFixed(2)}</div>
                        <div>{weights.b1[1].toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeParamTab === 'W2' && (
                  <div className="space-y-1">
                    <div className="text-[#9E9EAF] text-[10px] uppercase font-bold">
                      Output Weights (1×2 Vector):
                    </div>
                    <div className="text-white text-sm flex items-center gap-2">
                      <span className="text-[#FF5E7E]">W₂ =</span>
                      <div className="border-l-2 border-r-2 border-white px-2 py-1 flex gap-4">
                        <span>{weights.W2[0].toFixed(2)}</span>
                        <span>{weights.W2[1].toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeParamTab === 'b2' && (
                  <div className="space-y-1">
                    <div className="text-[#9E9EAF] text-[10px] uppercase font-bold">
                      Output Scalar Bias:
                    </div>
                    <div className="text-white text-sm flex items-center gap-2">
                      <span className="text-[#FF5E7E]">b₂ =</span>
                      <span className="font-bold">{weights.b2.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stress-Test Failure Mode Triggers */}
              <div className="space-y-2 pt-2 border-t border-[#262636]">
                <div className="text-[10px] text-[#9E9EAF] uppercase font-bold font-mono">
                  Failure Mode Stress-Tests:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onTriggerSingularMatrix}
                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    title="Trigger Singular Matrix: det(W1)=0 squashes space"
                  >
                    <span>💥 Squash det=0</span>
                  </button>

                  <button
                    onClick={onTriggerDeadReLU}
                    className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    title="Trigger Dead ReLU: derivative stalls at 0"
                  >
                    <span>🥶 Dead ReLU</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. BOTTOM BANNER (MATCHING SLIDE 2) ================= */}
        <div className="px-6 py-3.5 border-t border-[#262636] bg-[#141422] flex items-center justify-center gap-3 text-center">
          <div className="w-6 h-6 rounded-full bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
            <Target className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs md:text-sm text-white font-medium">
            A <strong className="text-[#FF5E7E]">zero-installation</strong> interactive observatory
            for neural network learning.
          </p>
        </div>
      </div>
    </div>
  );
};
