import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Point2D,
  NetworkWeights,
  OptimizerType,
  RaceResult,
  LossLandscapeGrid,
} from '../../math/types';
import { LossLandscape, ParamAccessors } from '../../math/lossLandscape';
import { MathView } from '../common/MathView';
import {
  Mountain,
  Trophy,
  Compass,
  Play,
  RotateCcw,
  CheckCircle,
  TrendingDown,
  Box,
  Map,
} from 'lucide-react';

interface LossLandscapeViewProps {
  dataset: Point2D[];
  weights: NetworkWeights;
  onSelectParam: (p1: number, p2: number) => void;
}

export const LossLandscapeView: React.FC<LossLandscapeViewProps> = ({
  dataset,
  weights,
  onSelectParam,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | 'contour'>('3d');
  const [sliceKey, setSliceKey] = useState<'W1_diag' | 'W1_row1' | 'W2_both'>('W1_diag');
  const [resolution, setResolution] = useState<number>(35);

  // 3D Canvas ref
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const contourCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Race Mode state
  const [raceActive, setRaceActive] = useState<boolean>(false);
  const [raceStepIndex, setRaceStepIndex] = useState<number>(0);
  const [raceData, setRaceData] = useState<Record<OptimizerType, RaceResult> | null>(null);
  const raceAnimRef = useRef<number | null>(null);

  // Compute Loss Landscape Grid & Hessian
  const landscape = useMemo(() => {
    return LossLandscape.generateGrid(dataset, weights, sliceKey, resolution, 2.8);
  }, [dataset, weights, sliceKey, resolution]);

  const hessian = useMemo(() => {
    return LossLandscape.computeHessian(dataset, weights, sliceKey);
  }, [dataset, weights, sliceKey]);

  // Current parameter coordinates
  const accessor = ParamAccessors[sliceKey] || ParamAccessors.W1_diag;
  const [currP1, currP2] = accessor.get(weights);

  // 1. Initialize & Update Three.js 3D Surface
  useEffect(() => {
    if (viewMode !== '3d' || !threeMountRef.current) return;

    const mount = threeMountRef.current;
    const width = mount.clientWidth || 480;
    const height = mount.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -9, 8);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 1.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Clear mount and append
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5d4, 1.2);
    dirLight1.position.set(5, -5, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff2a85, 1.0);
    dirLight2.position.set(-5, 5, 8);
    scene.add(dirLight2);

    // Build 3D Surface Mesh
    const res = resolution;
    const geometry = new THREE.PlaneGeometry(6, 6, res - 1, res - 1);
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const minL = landscape.minLoss;
    const maxL = Math.max(minL + 0.001, landscape.maxLoss);

    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const idx = r * res + c;
        const lossVal = landscape.grid[r][c];
        // Scale z height
        const normalizedZ = (lossVal - minL) / (maxL - minL);
        pos.setZ(idx, Math.min(3.5, normalizedZ * 2.8));

        // Vertex Color Gradient (Cyan in valley -> Violet -> Magenta at peaks)
        const col = new THREE.Color();
        col.setHSL(0.5 - normalizedZ * 0.45, 0.95, 0.5 + normalizedZ * 0.2);
        colors[idx * 3] = col.r;
        colors[idx * 3 + 1] = col.g;
        colors[idx * 3 + 2] = col.b;
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      wireframe: false,
      roughness: 0.35,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    const surfaceMesh = new THREE.Mesh(geometry, mat);
    scene.add(surfaceMesh);

    // Add wireframe overlay for mathematical grid lines
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e2d4a,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireMesh = new THREE.Mesh(geometry, wireMat);
    scene.add(wireMesh);

    // Current Network State Glowing Sphere
    // Map (currP1, currP2) to 3D surface coordinates [-3, 3] x [-3, 3]
    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    const normX = ((currP1 - p1Min) / (p1Max - p1Min) - 0.5) * 6;
    const normY = ((currP2 - p2Min) / (p2Max - p2Min) - 0.5) * 6;

    // Approximate Z from current loss
    const curLoss = landscape.grid[Math.floor(res / 2)][Math.floor(res / 2)];
    const normZ = Math.min(3.5, ((curLoss - minL) / (maxL - minL)) * 2.8);

    const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f5d4,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(normX, normY, normZ + 0.12);
    scene.add(sphere);

    // Steepest Downhill Negative Gradient Vector Arrow
    const dir = new THREE.Vector3(-hessian.eigenvalues[0], -hessian.eigenvalues[1], -0.2).normalize();
    const arrow = new THREE.ArrowHelper(dir, sphere.position, 1.2, 0x00f5d4, 0.3, 0.18);
    scene.add(arrow);

    // Simple Orbit Drag Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationAngle = 0;
    let elevationAngle = 0.5;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotationAngle += dx * 0.008;
      elevationAngle = Math.max(0.15, Math.min(1.4, elevationAngle + dy * 0.008));

      const radius = 11;
      camera.position.x = radius * Math.cos(rotationAngle) * Math.cos(elevationAngle);
      camera.position.y = radius * Math.sin(rotationAngle) * Math.cos(elevationAngle);
      camera.position.z = radius * Math.sin(elevationAngle);
      camera.lookAt(0, 0, 1.0);
    };

    const onMouseUp = () => (isDragging = false);

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      geometry.dispose();
      mat.dispose();
    };
  }, [viewMode, landscape, hessian, currP1, currP2, resolution]);

  // 2. High-Res 2D Contour Heatmap Canvas Rendering
  useEffect(() => {
    if (viewMode !== 'contour' || !contourCanvasRef.current) return;

    const canvas = contourCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const res = resolution;

    const minL = landscape.minLoss;
    const maxL = Math.max(minL + 0.001, landscape.maxLoss);

    // Draw Heatmap Cells
    const cellW = width / res;
    const cellH = height / res;

    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const val = landscape.grid[r][c];
        const t = Math.max(0, Math.min(1, (val - minL) / (maxL - minL)));

        // Colormap: Deep Navy -> Cyan -> Violet -> Magenta -> Amber
        const rCol = Math.round(t < 0.5 ? 0 : (t - 0.5) * 2 * 255);
        const gCol = Math.round(t < 0.5 ? t * 2 * 245 : (1 - t) * 245);
        const bCol = Math.round(t < 0.7 ? 212 : (1 - t) * 200);

        ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
        // Flip y so row 0 is bottom
        ctx.fillRect(c * cellW, (res - 1 - r) * cellH, cellW + 1, cellH + 1);
      }
    }

    // Draw Contour Iso-Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    const numLevels = 8;
    for (let lvl = 1; lvl < numLevels; lvl++) {
      const targetLoss = minL + (lvl / numLevels) * (maxL - minL);
      // Simple marching squares segment drawing
      for (let r = 0; r < res - 1; r++) {
        for (let c = 0; c < res - 1; c++) {
          const v00 = landscape.grid[r][c];
          const v10 = landscape.grid[r][c + 1];
          const v01 = landscape.grid[r + 1][c];
          if ((v00 - targetLoss) * (v10 - targetLoss) < 0) {
            const x = (c + 0.5) * cellW;
            const y = (res - 1 - r) * cellH;
            ctx.strokeRect(x, y, 1, 1);
          }
        }
      }
    }

    // Draw Race Trajectories if active
    if (raceData) {
      Object.values(raceData).forEach(race => {
        ctx.strokeStyle = race.color;
        ctx.fillStyle = race.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const p1Min = landscape.param1Range[0];
        const p1Max = landscape.param1Range[1];
        const p2Min = landscape.param2Range[0];
        const p2Max = landscape.param2Range[1];

        const stepsToDraw = Math.min(raceStepIndex, race.steps.length);
        for (let s = 0; s < stepsToDraw; s++) {
          const step = race.steps[s];
          const sx = ((step.p1 - p1Min) / (p1Max - p1Min)) * width;
          const sy = (1 - (step.p2 - p2Min) / (p2Max - p2Min)) * height;
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Ball at current position
        if (stepsToDraw > 0) {
          const curStep = race.steps[stepsToDraw - 1];
          const sx = ((curStep.p1 - p1Min) / (p1Max - p1Min)) * width;
          const sy = (1 - (curStep.p2 - p2Min) / (p2Max - p2Min)) * height;
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }

    // Draw Current Parameter Ball
    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    const curSX = ((currP1 - p1Min) / (p1Max - p1Min)) * width;
    const curSY = (1 - (currP2 - p2Min) / (p2Max - p2Min)) * height;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#00F5D4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00F5D4';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curSX, curSY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [viewMode, landscape, raceData, raceStepIndex, currP1, currP2, resolution]);

  // Optimizer Race Animation Controller
  const startOptimizerRace = () => {
    // Drop balls from current coordinate or a standard starting point
    const startP1 = currP1;
    const startP2 = currP2;
    const results = LossLandscape.raceOptimizers(dataset, weights, startP1, startP2, sliceKey, 45, 0.12);
    setRaceData(results);
    setRaceStepIndex(1);
    setRaceActive(true);

    if (raceAnimRef.current) clearInterval(raceAnimRef.current);
    let step = 1;
    const interval = setInterval(() => {
      step++;
      setRaceStepIndex(step);
      if (step >= 45) {
        clearInterval(interval);
        setRaceActive(false);
      }
    }, 60);
    raceAnimRef.current = interval as unknown as number;
  };

  const resetRace = () => {
    if (raceAnimRef.current) clearInterval(raceAnimRef.current);
    setRaceActive(false);
    setRaceStepIndex(0);
    setRaceData(null);
  };

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-cyber-cyan" />
          <h2 className="text-sm font-bold text-white">3D Loss Landscape & Multivariable Calculus</h2>
        </div>

        {/* 3D vs 2D Toggle */}
        <div className="flex items-center gap-1 bg-[#131B2E] p-1 rounded-lg border border-[#2A374F] text-[10px] font-mono">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              viewMode === '3d'
                ? 'bg-cyber-cyan text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" /> 3D Surface
          </button>
          <button
            onClick={() => setViewMode('contour')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              viewMode === 'contour'
                ? 'bg-cyber-cyan text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3 h-3" /> 2D Contour
          </button>
        </div>
      </div>

      {/* Parameter Slice Selector & Controls Bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase">2D Slice:</span>
          <select
            value={sliceKey}
            onChange={e => setSliceKey(e.target.value as any)}
            className="bg-[#131B2E] text-slate-200 text-xs px-2 py-1 rounded border border-[#2A374F] focus:border-cyber-cyan focus:outline-none"
          >
            <option value="W1_diag">W₁ Diagonals (w₁₁, w₂₂)</option>
            <option value="W1_row1">W₁ Row 1 (w₁₁, w₁₂)</option>
            <option value="W2_both">Output Weights (w₂,₁, w₂,₂)</option>
          </select>
        </div>

        {/* Optimizer Race Trigger Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={startOptimizerRace}
            disabled={raceActive}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              raceActive
                ? 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta animate-pulse'
                : 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan/25'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {raceActive ? `Racing Step ${raceStepIndex}/45...` : 'Race Optimizers'}
          </button>

          {raceData && (
            <button
              onClick={resetRace}
              className="p-1 rounded bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] text-slate-400"
              title="Reset Race"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="relative flex-1 min-h-[300px] flex items-center justify-center bg-[#090D16] rounded-lg overflow-hidden border border-[#1E2D4A]/50">
        {viewMode === '3d' ? (
          <div ref={threeMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : (
          <canvas
            ref={contourCanvasRef}
            width={480}
            height={480}
            className="w-full h-full object-contain"
          />
        )}

        {/* Legend Overlay */}
        <div className="absolute top-2 left-2 bg-[#0E1524]/85 backdrop-blur-md px-2.5 py-1.5 rounded text-[10px] font-mono border border-[#1E2D4A] text-slate-300 pointer-events-none space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-cyber-cyan shadow-sm" />
            Current State: ({currP1.toFixed(2)}, {currP2.toFixed(2)})
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyber-cyan inline-block" />
            Steepest Descent <MathView math="-\nabla \mathcal{L}" className="text-[9px]" />
          </div>
          {raceData && (
            <div className="pt-1 border-t border-[#1E2D4A] space-y-0.5 text-[9px]">
              <span className="text-cyber-cyan block">● SGD (Vanilla)</span>
              <span className="text-cyber-amber block">● Momentum (Heavy Ball)</span>
              <span className="text-cyber-magenta block">● Adam (Adaptive)</span>
            </div>
          )}
        </div>

        {/* 3D Drag Tip */}
        {viewMode === '3d' && (
          <div className="absolute bottom-2 right-2 bg-[#0E1524]/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono border border-[#1E2D4A] text-slate-400 pointer-events-none">
            Drag to Orbit 3D Surface
          </div>
        )}
      </div>

      {/* Hessian Curvature & Saddle Point Inspector */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] font-mono text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-300 font-semibold uppercase flex items-center gap-1.5">
            <Compass className="w-3 h-3 text-cyber-cyan" />
            Hessian Curvature Matrix <MathView math="H = \nabla^2 \mathcal{L}" className="text-cyber-cyan text-[10px]" />
          </span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
              hessian.curvatureType === 'bowl'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : hessian.curvatureType === 'saddle'
                ? 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta/50'
                : 'bg-cyber-amber/20 text-cyber-amber border border-cyber-amber/50'
            }`}
          >
            {hessian.curvatureType === 'bowl'
              ? 'Local Minimum (Bowl)'
              : hessian.curvatureType === 'saddle'
              ? 'Saddle Point (Plateau)'
              : 'Flat Ravine'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A]">
            <span className="text-slate-400">Curvature Eigenvalue μ₁: </span>
            <span className="text-cyber-cyan font-bold">{hessian.eigenvalues[0].toFixed(3)}</span>
          </div>
          <div className="bg-[#0B101D] p-1.5 rounded border border-[#1E2D4A]">
            <span className="text-slate-400">Curvature Eigenvalue μ₂: </span>
            <span className="text-cyber-cyan font-bold">{hessian.eigenvalues[1].toFixed(3)}</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-300 leading-tight pt-0.5">{hessian.description}</p>
      </div>
    </div>
  );
};
