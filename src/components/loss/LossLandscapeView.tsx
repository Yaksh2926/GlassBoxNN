import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
import { OptimizerLossChart } from './OptimizerLossChart';
import {
  Mountain,
  Trophy,
  Compass,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Box,
  Map,
  Target,
  Sparkles,
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
  const [raceLR, setRaceLR] = useState<number>(0.12);

  // 3D Canvas ref
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const contourCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js scene object refs for real-time 3D trail updates
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const surfaceMeshRef = useRef<THREE.Mesh | null>(null);

  // 3D spheres for SGD, Momentum, Adam
  const sgdSphereRef = useRef<THREE.Mesh | null>(null);
  const momSphereRef = useRef<THREE.Mesh | null>(null);
  const adamSphereRef = useRef<THREE.Mesh | null>(null);

  // 3D trajectory line meshes
  const sgdLineRef = useRef<THREE.Line | null>(null);
  const momLineRef = useRef<THREE.Line | null>(null);
  const adamLineRef = useRef<THREE.Line | null>(null);

  // Race Mode state
  const totalSteps = 45;
  const [raceActive, setRaceActive] = useState<boolean>(false);
  const [raceStepIndex, setRaceStepIndex] = useState<number>(0);
  const [raceData, setRaceData] = useState<Record<OptimizerType, RaceResult> | null>(null);
  const [startPoint, setStartPoint] = useState<{ p1: number; p2: number } | null>(null);
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

  // Start or restart a race from a specific starting coordinate
  const spawnAndRaceAt = useCallback(
    (startP1: number, startP2: number) => {
      if (raceAnimRef.current) clearInterval(raceAnimRef.current);

      setStartPoint({ p1: startP1, p2: startP2 });
      const results = LossLandscape.raceOptimizers(
        dataset,
        weights,
        startP1,
        startP2,
        sliceKey,
        totalSteps,
        raceLR
      );
      setRaceData(results);
      setRaceStepIndex(1);
      setRaceActive(true);

      let step = 1;
      const interval = setInterval(() => {
        step++;
        setRaceStepIndex(step);
        if (step >= totalSteps) {
          clearInterval(interval);
          setRaceActive(false);
        }
      }, 55);
      raceAnimRef.current = interval as unknown as number;
    },
    [dataset, weights, sliceKey, totalSteps, raceLR]
  );

  const togglePlayPause = () => {
    if (raceActive) {
      if (raceAnimRef.current) clearInterval(raceAnimRef.current);
      setRaceActive(false);
    } else {
      if (!raceData) {
        spawnAndRaceAt(currP1, currP2);
        return;
      }
      setRaceActive(true);
      let step = raceStepIndex;
      if (step >= totalSteps) step = 1;

      const interval = setInterval(() => {
        step++;
        setRaceStepIndex(step);
        if (step >= totalSteps) {
          clearInterval(interval);
          setRaceActive(false);
        }
      }, 55);
      raceAnimRef.current = interval as unknown as number;
    }
  };

  const stepForward = () => {
    if (!raceData) {
      spawnAndRaceAt(currP1, currP2);
      return;
    }
    if (raceAnimRef.current) clearInterval(raceAnimRef.current);
    setRaceActive(false);
    setRaceStepIndex(prev => Math.min(totalSteps, prev + 1));
  };

  const resetRace = () => {
    if (raceAnimRef.current) clearInterval(raceAnimRef.current);
    setRaceActive(false);
    setRaceStepIndex(0);
    setRaceData(null);
    setStartPoint(null);
  };

  // Convert (p1, p2) to 3D world (X, Y, Z) on the surface
  const get3DCoords = useCallback(
    (p1: number, p2: number, lossVal?: number): [number, number, number] => {
      const p1Min = landscape.param1Range[0];
      const p1Max = landscape.param1Range[1];
      const p2Min = landscape.param2Range[0];
      const p2Max = landscape.param2Range[1];

      const normX = ((p1 - p1Min) / (p1Max - p1Min) - 0.5) * 6;
      const normY = ((p2 - p2Min) / (p2Max - p2Min) - 0.5) * 6;

      const minL = landscape.minLoss;
      const maxL = Math.max(minL + 0.001, landscape.maxLoss);

      let zVal = 0.5;
      if (lossVal !== undefined) {
        zVal = Math.min(3.5, ((lossVal - minL) / (maxL - minL)) * 2.8);
      }
      return [normX, normY, zVal];
    },
    [landscape]
  );

  // 1. Initialize & Update Three.js 3D Surface
  useEffect(() => {
    if (viewMode !== '3d' || !threeMountRef.current) return;

    const mount = threeMountRef.current;
    const width = mount.clientWidth || 480;
    const height = mount.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    threeSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -9.5, 8.5);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 1.2);
    threeCameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5d4, 1.2);
    dirLight1.position.set(5, -5, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff2a85, 1.0);
    dirLight2.position.set(-5, 5, 8);
    scene.add(dirLight2);

    // 3D Surface Mesh
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
        const normalizedZ = (lossVal - minL) / (maxL - minL);
        pos.setZ(idx, Math.min(3.5, normalizedZ * 2.8));

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
      roughness: 0.35,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    const surfaceMesh = new THREE.Mesh(geometry, mat);
    surfaceMeshRef.current = surfaceMesh;
    scene.add(surfaceMesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x1e2d4a,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    scene.add(new THREE.Mesh(geometry, wireMat));

    // Current State Base Marker Sphere
    const [curX, curY, curZ] = get3DCoords(currP1, currP2, landscape.grid[Math.floor(res / 2)][Math.floor(res / 2)]);
    const sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f5d4,
      emissiveIntensity: 0.8,
    });
    const curSphere = new THREE.Mesh(sphereGeo, sphereMat);
    curSphere.position.set(curX, curY, curZ + 0.12);
    scene.add(curSphere);

    // Steepest Downhill Vector Arrow
    const dir = new THREE.Vector3(-hessian.eigenvalues[0], -hessian.eigenvalues[1], -0.2).normalize();
    const arrow = new THREE.ArrowHelper(dir, curSphere.position, 1.2, 0x00f5d4, 0.3, 0.18);
    scene.add(arrow);

    // Setup 3 Glowing Spheres for the 3 Optimizers (SGD, Momentum, Adam)
    const createRacerSphere = (colorHex: number) => {
      const g = new THREE.SphereGeometry(0.18, 16, 16);
      const m = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 1.0,
        roughness: 0.1,
      });
      const s = new THREE.Mesh(g, m);
      s.visible = false;
      scene.add(s);
      return s;
    };

    sgdSphereRef.current = createRacerSphere(0x00f5d4);  // Cyan
    momSphereRef.current = createRacerSphere(0xf59e0b);  // Amber
    adamSphereRef.current = createRacerSphere(0xff2a85); // Magenta

    // Setup 3 Trajectory Lines
    const createRacerLine = (colorHex: number) => {
      const g = new THREE.BufferGeometry();
      const m = new THREE.LineBasicMaterial({ color: colorHex, linewidth: 3 });
      const l = new THREE.Line(g, m);
      l.visible = false;
      scene.add(l);
      return l;
    };

    sgdLineRef.current = createRacerLine(0x00f5d4);
    momLineRef.current = createRacerLine(0xf59e0b);
    adamLineRef.current = createRacerLine(0xff2a85);

    // Orbit Drag Interaction & Click-to-Drop Detection
    let isDragging = false;
    let mouseDownPos = { x: 0, y: 0 };
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationAngle = 0;
    let elevationAngle = 0.55;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      mouseDownPos = { x: e.clientX, y: e.clientY };
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

      const radius = 11.5;
      camera.position.x = radius * Math.cos(rotationAngle) * Math.cos(elevationAngle);
      camera.position.y = radius * Math.sin(rotationAngle) * Math.cos(elevationAngle);
      camera.position.z = radius * Math.sin(elevationAngle);
      camera.lookAt(0, 0, 1.2);
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);

      // If click was a tap without dragging (< 4px), perform Raycasting to drop balls!
      if (moveDist < 4 && surfaceMeshRef.current) {
        const rect = mount.getBoundingClientRect();
        const mouseNorm = new THREE.Vector2(
          ((e.clientX - rect.left) / width) * 2 - 1,
          -((e.clientY - rect.top) / height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseNorm, camera);
        const hits = raycaster.intersectObject(surfaceMeshRef.current);

        if (hits.length > 0) {
          const pt = hits[0].point; // 3D world coordinate
          // Convert from 3D [-3, 3] to parameter slice (p1, p2)
          const p1Min = landscape.param1Range[0];
          const p1Max = landscape.param1Range[1];
          const p2Min = landscape.param2Range[0];
          const p2Max = landscape.param2Range[1];

          const p1 = p1Min + ((pt.x + 3) / 6) * (p1Max - p1Min);
          const p2 = p2Min + ((pt.y + 3) / 6) * (p2Max - p2Min);

          spawnAndRaceAt(parseFloat(p1.toFixed(3)), parseFloat(p2.toFixed(3)));
        }
      }
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

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
  }, [viewMode, landscape, hessian, currP1, currP2, resolution, get3DCoords, spawnAndRaceAt]);

  // Update 3D Balls and Trajectory Lines in Three.js Scene whenever raceStepIndex changes
  useEffect(() => {
    if (viewMode !== '3d' || !raceData) {
      if (sgdSphereRef.current) sgdSphereRef.current.visible = false;
      if (momSphereRef.current) momSphereRef.current.visible = false;
      if (adamSphereRef.current) adamSphereRef.current.visible = false;
      if (sgdLineRef.current) sgdLineRef.current.visible = false;
      if (momLineRef.current) momLineRef.current.visible = false;
      if (adamLineRef.current) adamLineRef.current.visible = false;
      return;
    }

    const stepsToDraw = Math.min(raceStepIndex, totalSteps);

    const updateRacer3D = (
      steps: typeof raceData.sgd.steps,
      sphereMesh: THREE.Mesh | null,
      lineMesh: THREE.Line | null
    ) => {
      if (!sphereMesh || !lineMesh) return;
      if (stepsToDraw === 0 || steps.length === 0) {
        sphereMesh.visible = false;
        lineMesh.visible = false;
        return;
      }

      // Update line points
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < stepsToDraw; i++) {
        const s = steps[i];
        const [x, y, z] = get3DCoords(s.p1, s.p2, s.loss);
        points.push(new THREE.Vector3(x, y, z + 0.08));
      }
      lineMesh.geometry.setFromPoints(points);
      lineMesh.visible = true;

      // Update head sphere position
      const headStep = steps[stepsToDraw - 1];
      const [hx, hy, hz] = get3DCoords(headStep.p1, headStep.p2, headStep.loss);
      sphereMesh.position.set(hx, hy, hz + 0.12);
      sphereMesh.visible = true;
    };

    updateRacer3D(raceData.sgd.steps, sgdSphereRef.current, sgdLineRef.current);
    updateRacer3D(raceData.momentum.steps, momSphereRef.current, momLineRef.current);
    updateRacer3D(raceData.adam.steps, adamSphereRef.current, adamLineRef.current);
  }, [viewMode, raceData, raceStepIndex, totalSteps, get3DCoords]);

  // 2. High-Res 2D Contour Heatmap Canvas Rendering & Click Listener
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

        const rCol = Math.round(t < 0.5 ? 0 : (t - 0.5) * 2 * 255);
        const gCol = Math.round(t < 0.5 ? t * 2 * 245 : (1 - t) * 245);
        const bCol = Math.round(t < 0.7 ? 212 : (1 - t) * 200);

        ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
        ctx.fillRect(c * cellW, (res - 1 - r) * cellH, cellW + 1, cellH + 1);
      }
    }

    // Draw Contour Iso-Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    const numLevels = 8;
    for (let lvl = 1; lvl < numLevels; lvl++) {
      const targetLoss = minL + (lvl / numLevels) * (maxL - minL);
      for (let r = 0; r < res - 1; r++) {
        for (let c = 0; c < res - 1; c++) {
          const v00 = landscape.grid[r][c];
          const v10 = landscape.grid[r][c + 1];
          if ((v00 - targetLoss) * (v10 - targetLoss) < 0) {
            const x = (c + 0.5) * cellW;
            const y = (res - 1 - r) * cellH;
            ctx.strokeRect(x, y, 1, 1);
          }
        }
      }
    }

    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    // Draw Spawn/Drop Point Marker if set
    if (startPoint) {
      const spX = ((startPoint.p1 - p1Min) / (p1Max - p1Min)) * width;
      const spY = (1 - (startPoint.p2 - p2Min) / (p2Max - p2Min)) * height;

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(spX, spY, 8, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(spX - 11, spY);
      ctx.lineTo(spX + 11, spY);
      ctx.moveTo(spX, spY - 11);
      ctx.lineTo(spX, spY + 11);
      ctx.stroke();
    }

    // Draw Race Trajectories if active
    if (raceData) {
      Object.values(raceData).forEach(race => {
        ctx.strokeStyle = race.color;
        ctx.fillStyle = race.color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        const stepsToDraw = Math.min(raceStepIndex, race.steps.length);
        for (let s = 0; s < stepsToDraw; s++) {
          const step = race.steps[s];
          const sx = ((step.p1 - p1Min) / (p1Max - p1Min)) * width;
          const sy = (1 - (step.p2 - p2Min) / (p2Max - p2Min)) * height;
          if (s === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Glowing Ball at current position
        if (stepsToDraw > 0) {
          const curStep = race.steps[stepsToDraw - 1];
          const sx = ((curStep.p1 - p1Min) / (p1Max - p1Min)) * width;
          const sy = (1 - (curStep.p2 - p2Min) / (p2Max - p2Min)) * height;

          ctx.shadowColor = race.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(sx, sy, 6.5, 0, 2 * Math.PI);
          ctx.fill();

          // White inner core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
    }

    // Draw Current Model Parameter Ball
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
  }, [viewMode, landscape, raceData, raceStepIndex, currP1, currP2, startPoint, resolution]);

  // Click on 2D Contour Canvas to Drop Balls & Race!
  const handleContourCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = contourCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const sy = (e.clientY - rect.top) * (canvas.height / rect.height);

    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    const p1 = p1Min + (sx / canvas.width) * (p1Max - p1Min);
    const p2 = p2Min + (1 - sy / canvas.height) * (p2Max - p2Min);

    spawnAndRaceAt(parseFloat(p1.toFixed(3)), parseFloat(p2.toFixed(3)));
  };

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-2.5 shadow-glass flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1E2D4A]/60 pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cyber-amber" />
          <h2 className="text-sm font-bold text-white font-mono">
            Optimizer Race Arena & Loss Landscape
          </h2>
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

      {/* Arena Sub-Header: Click-to-Drop Banner & Interactive Arena Controls */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] space-y-2 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-cyber-cyan font-semibold text-[11px]">
            <Target className="w-3.5 h-3.5 text-cyber-amber animate-pulse" />
            <span>Click anywhere on the landscape to drop 3 balls & race!</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlayPause}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                raceActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500'
                  : 'bg-cyber-amber text-black font-bold shadow-amber-glow hover:bg-cyber-amber/90'
              }`}
            >
              {raceActive ? (
                <>
                  <Pause className="w-3 h-3" /> Pause Race
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  {raceData ? 'Resume Race' : 'Start Race'}
                </>
              )}
            </button>

            <button
              onClick={stepForward}
              disabled={raceActive}
              className="p-1.5 rounded-lg bg-[#0B101D] hover:bg-[#1C2844] border border-[#1E2D4A] text-slate-200 disabled:opacity-40"
              title="Step Forward 1 Epoch"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetRace}
              className="p-1.5 rounded-lg bg-[#0B101D] hover:bg-[#1C2844] border border-[#1E2D4A] text-slate-400 hover:text-white"
              title="Reset Race"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Scrubber & Parameter Slice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center pt-1 border-t border-[#1E2D4A]/60 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase">Step:</span>
            <input
              type="range"
              min="0"
              max={totalSteps}
              value={raceStepIndex}
              onChange={e => {
                if (raceAnimRef.current) clearInterval(raceAnimRef.current);
                setRaceActive(false);
                setRaceStepIndex(parseInt(e.target.value));
              }}
              className="flex-1 slider-amber"
            />
            <span className="text-cyber-amber font-bold">
              {raceStepIndex}/{totalSteps}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Slice:</span>
              <select
                value={sliceKey}
                onChange={e => setSliceKey(e.target.value as any)}
                className="bg-[#0B101D] text-slate-200 text-[10px] px-1.5 py-0.5 rounded border border-[#1E2D4A] focus:border-cyber-cyan focus:outline-none"
              >
                <option value="W1_diag">W₁ Diagonals (w₁₁, w₂₂)</option>
                <option value="W1_row1">W₁ Row 1 (w₁₁, w₁₂)</option>
                <option value="W2_both">Output Weights (w₂,₁, w₂,₂)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">LR η:</span>
              <input
                type="number"
                step="0.02"
                min="0.01"
                max="0.8"
                value={raceLR}
                onChange={e => setRaceLR(parseFloat(e.target.value) || 0.1)}
                className="w-12 bg-[#0B101D] text-slate-100 text-center text-[10px] px-1 py-0.5 rounded border border-[#1E2D4A]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizer Container (3D Surface / 2D Contour Canvas) */}
      <div className="relative flex-1 min-h-[290px] flex items-center justify-center bg-[#090D16] rounded-lg overflow-hidden border border-[#1E2D4A]/50">
        {viewMode === '3d' ? (
          <div ref={threeMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : (
          <canvas
            ref={contourCanvasRef}
            width={480}
            height={480}
            onClick={handleContourCanvasClick}
            className="w-full h-full object-contain cursor-crosshair"
          />
        )}

        {/* Interactive Legend Overlay */}
        <div className="absolute top-2 left-2 bg-[#0E1524]/90 backdrop-blur-md px-2.5 py-1.5 rounded text-[10px] font-mono border border-[#1E2D4A] text-slate-300 pointer-events-none space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan shadow-sm" />
            <span>SGD (Vanilla)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-amber shadow-sm" />
            <span>Momentum (Heavy Ball)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-magenta shadow-sm" />
            <span>Adam (Adaptive Moments)</span>
          </div>
          {startPoint && (
            <div className="pt-1 border-t border-[#1E2D4A] text-[9px] text-slate-400">
              Drop: ({startPoint.p1.toFixed(2)}, {startPoint.p2.toFixed(2)})
            </div>
          )}
        </div>

        {/* Helpful Tip */}
        <div className="absolute bottom-2 right-2 bg-[#0E1524]/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono border border-[#1E2D4A] text-slate-400 pointer-events-none">
          {viewMode === '3d' ? 'Click to drop balls • Drag to orbit' : 'Click anywhere on contour to race'}
        </div>
      </div>

      {/* Real-Time Mini Line Chart: Loss vs. Epoch Curves */}
      <OptimizerLossChart
        raceData={raceData}
        currentStep={raceStepIndex}
        totalSteps={totalSteps}
      />

      {/* Hessian Curvature & Saddle Point Summary */}
      <div className="bg-[#131B2E] p-2 rounded-lg border border-[#2A374F] font-mono text-[10px] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
          <span className="text-slate-300 font-semibold uppercase">Hessian Curvature:</span>
          <span className="text-cyber-cyan font-bold">
            μ₁ = {hessian.eigenvalues[0].toFixed(2)}, μ₂ = {hessian.eigenvalues[1].toFixed(2)}
          </span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
            hessian.curvatureType === 'bowl'
              ? 'bg-emerald-500/20 text-emerald-300'
              : hessian.curvatureType === 'saddle'
              ? 'bg-cyber-magenta/20 text-cyber-magenta'
              : 'bg-cyber-amber/20 text-cyber-amber'
          }`}
        >
          {hessian.curvatureType === 'bowl'
            ? 'Bowl (Convex)'
            : hessian.curvatureType === 'saddle'
            ? 'Saddle Point'
            : 'Flat Ravine'}
        </span>
      </div>
    </div>
  );
};
