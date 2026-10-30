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
  Orbit,
  RefreshCw,
  Zap,
  Info,
  ChevronRight,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';

interface LossLandscapeViewProps {
  dataset: Point2D[];
  weights: NetworkWeights;
  onSelectParam: (p1: number, p2: number) => void;
  className?: string;
  intuitionMode?: boolean;
}

export const LossLandscapeView: React.FC<LossLandscapeViewProps> = ({
  dataset,
  weights,
  onSelectParam,
  className = '',
  intuitionMode = true,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | 'contour'>('3d');
  const [sliceKey, setSliceKey] = useState<'W1_diag' | 'W1_row1' | 'W2_both'>('W1_diag');
  const [resolution, setResolution] = useState<number>(36);
  const [raceLR, setRaceLR] = useState<number>(0.12);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);

  // 3D Canvas mount & 2D canvas refs
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const contourCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js scene object refs
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const threeCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const surfaceMeshRef = useRef<THREE.Mesh | null>(null);
  const beaconMeshRef = useRef<THREE.Mesh | null>(null);
  const shockwaveMeshRef = useRef<THREE.Mesh | null>(null);
  const shockwaveDataRef = useRef<{ active: boolean; scale: number; opacity: number }>({
    active: false,
    scale: 0.1,
    opacity: 1,
  });

  // Camera angles stored in ref for uninterrupted auto-orbit and drag
  const cameraAngleRef = useRef<{
    rotation: number;
    elevation: number;
    radius: number;
    isDragging: boolean;
    prevX: number;
    prevY: number;
    autoOrbit: boolean;
  }>({
    rotation: 0.45,
    elevation: 0.65,
    radius: 11.2,
    isDragging: false,
    prevX: 0,
    prevY: 0,
    autoOrbit: true,
  });

  // Keep cameraAngleRef.autoOrbit in sync with state
  useEffect(() => {
    cameraAngleRef.current.autoOrbit = isAutoOrbit;
  }, [isAutoOrbit]);

  // 3D spheres for SGD, Momentum, Adam racers
  const sgdSphereRef = useRef<THREE.Mesh | null>(null);
  const momSphereRef = useRef<THREE.Mesh | null>(null);
  const adamSphereRef = useRef<THREE.Mesh | null>(null);

  // 3D trajectory line meshes
  const sgdLineRef = useRef<THREE.Line | null>(null);
  const momLineRef = useRef<THREE.Line | null>(null);
  const adamLineRef = useRef<THREE.Line | null>(null);

  // Current weight sphere marker
  const curSphereRef = useRef<THREE.Mesh | null>(null);
  const arrowHelperRef = useRef<THREE.ArrowHelper | null>(null);

  // Race Mode state
  const totalSteps = 45;
  const [raceActive, setRaceActive] = useState<boolean>(false);
  const [raceStepIndex, setRaceStepIndex] = useState<number>(0);
  const [raceData, setRaceData] = useState<Record<OptimizerType, RaceResult> | null>(null);
  const [startPoint, setStartPoint] = useState<{ p1: number; p2: number } | null>(null);
  const raceAnimRef = useRef<number | null>(null);

  // Compute Loss Landscape Grid & Hessian with strict math preservation
  const landscape = useMemo(() => {
    return LossLandscape.generateGrid(dataset, weights, sliceKey, resolution, 2.8);
  }, [dataset, weights, sliceKey, resolution]);

  const hessian = useMemo(() => {
    return LossLandscape.computeHessian(dataset, weights, sliceKey);
  }, [dataset, weights, sliceKey]);

  // Current parameter coordinates from network weights
  const accessor = ParamAccessors[sliceKey] || ParamAccessors.W1_diag;
  const [currP1, currP2] = accessor.get(weights);

  // Locate the global minimum in the current grid slice
  const gridMin = useMemo(() => {
    let minVal = Infinity;
    let minR = 0;
    let minC = 0;
    const res = landscape.grid.length;
    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        if (landscape.grid[r][c] < minVal) {
          minVal = landscape.grid[r][c];
          minR = r;
          minC = c;
        }
      }
    }
    const p1Min = landscape.param1Range[0];
    const p1Max = landscape.param1Range[1];
    const p2Min = landscape.param2Range[0];
    const p2Max = landscape.param2Range[1];

    const p1 = p1Min + (minC / (res - 1)) * (p1Max - p1Min);
    const p2 = p2Min + (minR / (res - 1)) * (p2Max - p2Min);
    return { p1, p2, loss: minVal };
  }, [landscape]);

  // Helper: Convert (p1, p2) to 3D world (X, Y, Z) on the surface
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
        zVal = Math.min(3.6, ((lossVal - minL) / (maxL - minL)) * 3.0);
      }
      return [normX, normY, zVal];
    },
    [landscape]
  );

  // Trigger ripple shockwave animation at drop location
  const triggerRippleAt = useCallback(
    (x: number, y: number, z: number) => {
      if (shockwaveMeshRef.current) {
        shockwaveMeshRef.current.position.set(x, y, z + 0.08);
        shockwaveMeshRef.current.scale.set(0.1, 0.1, 0.1);
        shockwaveMeshRef.current.visible = true;
        shockwaveDataRef.current = {
          active: true,
          scale: 0.1,
          opacity: 1.0,
        };
      }
    },
    []
  );

  // Start or restart an optimizer race from given starting parameter coordinates
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

      // Trigger ripple shockwave at drop point
      const [wx, wy, wz] = get3DCoords(startP1, startP2, results.sgd.steps[0]?.loss);
      triggerRippleAt(wx, wy, wz);

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
    [dataset, weights, sliceKey, totalSteps, raceLR, get3DCoords, triggerRippleAt]
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

  const resetCamera = () => {
    cameraAngleRef.current.rotation = 0.45;
    cameraAngleRef.current.elevation = 0.65;
    if (threeCameraRef.current) {
      const radius = cameraAngleRef.current.radius;
      threeCameraRef.current.position.x =
        radius * Math.cos(cameraAngleRef.current.rotation) * Math.cos(cameraAngleRef.current.elevation);
      threeCameraRef.current.position.y =
        radius * Math.sin(cameraAngleRef.current.rotation) * Math.cos(cameraAngleRef.current.elevation);
      threeCameraRef.current.position.z = radius * Math.sin(cameraAngleRef.current.elevation);
      threeCameraRef.current.lookAt(0, 0, 1.2);
    }
  };

  // 1. Initialize & Animate Three.js 3D Surface
  useEffect(() => {
    if (viewMode !== '3d' || !threeMountRef.current) return;

    const mount = threeMountRef.current;
    const width = mount.clientWidth || 540;
    const height = mount.clientHeight || 380;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.025);
    threeSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const ang = cameraAngleRef.current;
    camera.position.x = ang.radius * Math.cos(ang.rotation) * Math.cos(ang.elevation);
    camera.position.y = ang.radius * Math.sin(ang.rotation) * Math.cos(ang.elevation);
    camera.position.z = ang.radius * Math.sin(ang.elevation);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 1.2);
    threeCameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // ================= LIGHTING (WARM CORAL + VIBRANT SPECULAR HIGHLIGHTS) =================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Key light: vibrant coral highlight on mountain ridges
    const dirLight1 = new THREE.DirectionalLight(0xff5e7e, 1.4);
    dirLight1.position.set(6, -8, 12);
    scene.add(dirLight1);

    // Fill light: soft electric cyan on opposite slope
    const dirLight2 = new THREE.DirectionalLight(0x53d4f4, 0.85);
    dirLight2.position.set(-6, 8, 10);
    scene.add(dirLight2);

    // Top subtle white rim light
    const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight3.position.set(0, 0, 14);
    scene.add(dirLight3);

    // ================= 3D SURFACE MESH (OBSIDIAN -> MAGENTA -> CORAL GRADIENT) =================
    const res = resolution;
    const geometry = new THREE.PlaneGeometry(6, 6, res - 1, res - 1);
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const minL = landscape.minLoss;
    const maxL = Math.max(minL + 0.001, landscape.maxLoss);

    // Multi-stop MathX color ramp:
    // Minimum = deep obsidian violet `#141028`
    // Low-mid = electric purple `#581C87`
    // High-mid = vibrant crimson-rose `#BE185D`
    // Peak = glowing neon coral pink `#FF5E7E`
    const cMin = new THREE.Color('#141028');
    const cMid1 = new THREE.Color('#581C87');
    const cMid2 = new THREE.Color('#BE185D');
    const cPeak = new THREE.Color('#FF5E7E');

    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const idx = r * res + c;
        const lossVal = landscape.grid[r][c];
        const normalizedZ = Math.max(0, Math.min(1, (lossVal - minL) / (maxL - minL)));
        pos.setZ(idx, Math.min(3.6, normalizedZ * 3.0));

        const col = new THREE.Color();
        if (normalizedZ < 0.33) {
          col.lerpColors(cMin, cMid1, normalizedZ / 0.33);
        } else if (normalizedZ < 0.66) {
          col.lerpColors(cMid1, cMid2, (normalizedZ - 0.33) / 0.33);
        } else {
          col.lerpColors(cMid2, cPeak, (normalizedZ - 0.66) / 0.34);
        }

        colors[idx * 3] = col.r;
        colors[idx * 3 + 1] = col.g;
        colors[idx * 3 + 2] = col.b;
      }
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const surfaceMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.28,
      metalness: 0.25,
      side: THREE.DoubleSide,
    });

    const surfaceMesh = new THREE.Mesh(geometry, surfaceMat);
    surfaceMeshRef.current = surfaceMesh;
    scene.add(surfaceMesh);

    // Glowing Coral Wireframe Overlay (Slide 3 Aesthetic)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xff5e7e,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    scene.add(new THREE.Mesh(geometry, wireMat));

    // ================= GLOBAL MINIMUM BEACON (VALLEY FLOOR TARGET) =================
    const [minX, minY, minZ] = get3DCoords(gridMin.p1, gridMin.p2, gridMin.loss);
    const beaconGeo = new THREE.RingGeometry(0.18, 0.26, 32);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xff5e7e,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(minX, minY, minZ + 0.05);
    beaconMeshRef.current = beaconMesh;
    scene.add(beaconMesh);

    // ================= RIPPLE SHOCKWAVE MESH (EXPANDS ON DROP) =================
    const shockGeo = new THREE.RingGeometry(0.1, 0.18, 32);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xff5e7e,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockMesh.visible = false;
    shockwaveMeshRef.current = shockMesh;
    scene.add(shockMesh);

    // ================= CURRENT MODEL WEIGHT MARKER =================
    const [curX, curY, curZ] = get3DCoords(
      currP1,
      currP2,
      landscape.grid[Math.floor(res / 2)][Math.floor(res / 2)]
    );
    const curGeo = new THREE.SphereGeometry(0.15, 20, 20);
    const curMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xff5e7e,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    const curSphere = new THREE.Mesh(curGeo, curMat);
    curSphere.position.set(curX, curY, curZ + 0.12);
    curSphereRef.current = curSphere;
    scene.add(curSphere);

    // Steepest Downhill Gradient Vector Arrow
    const dir = new THREE.Vector3(-hessian.eigenvalues[0], -hessian.eigenvalues[1], -0.2).normalize();
    const arrow = new THREE.ArrowHelper(dir, curSphere.position, 1.2, 0xff5e7e, 0.32, 0.18);
    arrowHelperRef.current = arrow;
    scene.add(arrow);

    // ================= 3 RACER SPHERES (SGD, MOMENTUM, ADAM) =================
    const createRacerSphere = (colorHex: number, emissiveIntensity = 1.2) => {
      const g = new THREE.SphereGeometry(0.18, 20, 20);
      const m = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity,
        roughness: 0.1,
        metalness: 0.4,
      });
      const s = new THREE.Mesh(g, m);
      s.visible = false;
      scene.add(s);
      return s;
    };

    sgdSphereRef.current = createRacerSphere(0x53d4f4, 1.2);   // Cyan / Silver
    momSphereRef.current = createRacerSphere(0xf7c76b, 1.2);   // Gold / Amber
    adamSphereRef.current = createRacerSphere(0xff5e7e, 1.5);  // Radiant Coral Pink

    // ================= 3 TRAJECTORY LINES =================
    const createRacerLine = (colorHex: number) => {
      const g = new THREE.BufferGeometry();
      const m = new THREE.LineBasicMaterial({
        color: colorHex,
        linewidth: 3,
        transparent: true,
        opacity: 0.95,
      });
      const l = new THREE.Line(g, m);
      l.visible = false;
      scene.add(l);
      return l;
    };

    sgdLineRef.current = createRacerLine(0x53d4f4);
    momLineRef.current = createRacerLine(0xf7c76b);
    adamLineRef.current = createRacerLine(0xff5e7e);

    // ================= ORBIT DRAG & RAYCASTING CLICK DETECTION =================
    let mouseDownPos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      cameraAngleRef.current.isDragging = true;
      cameraAngleRef.current.prevX = e.clientX;
      cameraAngleRef.current.prevY = e.clientY;
      mouseDownPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!cameraAngleRef.current.isDragging) return;
      const dx = e.clientX - cameraAngleRef.current.prevX;
      const dy = e.clientY - cameraAngleRef.current.prevY;
      cameraAngleRef.current.prevX = e.clientX;
      cameraAngleRef.current.prevY = e.clientY;

      cameraAngleRef.current.rotation += dx * 0.007;
      cameraAngleRef.current.elevation = Math.max(
        0.18,
        Math.min(1.4, cameraAngleRef.current.elevation + dy * 0.007)
      );

      const r = cameraAngleRef.current.radius;
      const rot = cameraAngleRef.current.rotation;
      const ele = cameraAngleRef.current.elevation;
      camera.position.x = r * Math.cos(rot) * Math.cos(ele);
      camera.position.y = r * Math.sin(rot) * Math.cos(ele);
      camera.position.z = r * Math.sin(ele);
      camera.lookAt(0, 0, 1.2);
    };

    const onMouseUp = (e: MouseEvent) => {
      cameraAngleRef.current.isDragging = false;
      const moveDist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);

      // If click was a clean tap without dragging (< 5px), Raycast to drop balls!
      if (moveDist < 5 && surfaceMeshRef.current) {
        const rect = mount.getBoundingClientRect();
        const mouseNorm = new THREE.Vector2(
          ((e.clientX - rect.left) / width) * 2 - 1,
          -((e.clientY - rect.top) / height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouseNorm, camera);
        const hits = raycaster.intersectObject(surfaceMeshRef.current);

        if (hits.length > 0) {
          const pt = hits[0].point;
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

    // ================= 60FPS ANIMATION LOOP (AUTO-ORBIT + PULSING BEACON + RIPPLE) =================
    let reqId: number;
    let clockTime = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      clockTime += 0.02;

      // 1. Smooth Auto-Orbiting Camera
      if (cameraAngleRef.current.autoOrbit && !cameraAngleRef.current.isDragging) {
        cameraAngleRef.current.rotation += 0.0035;
        const r = cameraAngleRef.current.radius;
        const rot = cameraAngleRef.current.rotation;
        const ele = cameraAngleRef.current.elevation;
        camera.position.x = r * Math.cos(rot) * Math.cos(ele);
        camera.position.y = r * Math.sin(rot) * Math.cos(ele);
        camera.position.z = r * Math.sin(ele);
        camera.lookAt(0, 0, 1.2);
      }

      // 2. Pulse Valley Minimum Beacon
      if (beaconMeshRef.current) {
        const beaconScale = 1.0 + 0.22 * Math.sin(clockTime * 3.5);
        beaconMeshRef.current.scale.set(beaconScale, beaconScale, 1);
        (beaconMeshRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.6 + 0.35 * Math.sin(clockTime * 3.5);
      }

      // 3. Expand & Fade Ripple Shockwave
      if (shockwaveMeshRef.current && shockwaveDataRef.current.active) {
        shockwaveDataRef.current.scale += 0.06;
        shockwaveDataRef.current.opacity -= 0.025;

        const s = shockwaveDataRef.current.scale;
        shockwaveMeshRef.current.scale.set(s, s, 1);
        (shockwaveMeshRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          shockwaveDataRef.current.opacity
        );

        if (shockwaveDataRef.current.opacity <= 0.01) {
          shockwaveDataRef.current.active = false;
          shockwaveMeshRef.current.visible = false;
        }
      }

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
      surfaceMat.dispose();
      wireMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      shockGeo.dispose();
      shockMat.dispose();
      curGeo.dispose();
      curMat.dispose();
    };
  }, [
    viewMode,
    landscape,
    hessian,
    currP1,
    currP2,
    resolution,
    get3DCoords,
    spawnAndRaceAt,
    gridMin,
  ]);

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

  // 2. High-Res 2D Contour Heatmap Canvas Rendering (Obsidian & Coral Palette)
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

    // Draw Heatmap Cells using the MathX gradient
    const cellW = width / res;
    const cellH = height / res;

    for (let r = 0; r < res; r++) {
      for (let c = 0; c < res; c++) {
        const val = landscape.grid[r][c];
        const t = Math.max(0, Math.min(1, (val - minL) / (maxL - minL)));

        // Interpolate: 0 = #141028 (20, 16, 40) -> 0.4 = #581C87 (88, 28, 135) -> 0.7 = #BE185D (190, 24, 93) -> 1.0 = #FF5E7E (255, 94, 126)
        let red: number, green: number, blue: number;
        if (t < 0.35) {
          const u = t / 0.35;
          red = Math.round(20 + u * (88 - 20));
          green = Math.round(16 + u * (28 - 16));
          blue = Math.round(40 + u * (135 - 40));
        } else if (t < 0.7) {
          const u = (t - 0.35) / 0.35;
          red = Math.round(88 + u * (190 - 88));
          green = Math.round(28 + u * (24 - 28));
          blue = Math.round(135 + u * (93 - 135));
        } else {
          const u = (t - 0.7) / 0.3;
          red = Math.round(190 + u * (255 - 190));
          green = Math.round(24 + u * (94 - 24));
          blue = Math.round(93 + u * (126 - 93));
        }

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fillRect(c * cellW, (res - 1 - r) * cellH, cellW + 1, cellH + 1);
      }
    }

    // Draw Contour Iso-Lines
    ctx.strokeStyle = 'rgba(255, 94, 126, 0.35)';
    ctx.lineWidth = 1;
    const numLevels = 10;
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

    // Global Minimum Marker
    const minSX = ((gridMin.p1 - p1Min) / (p1Max - p1Min)) * width;
    const minSY = (1 - (gridMin.p2 - p2Min) / (p2Max - p2Min)) * height;
    ctx.strokeStyle = '#FF5E7E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(minSX, minSY, 7, 0, 2 * Math.PI);
    ctx.stroke();

    // Spawn/Drop Point Marker
    if (startPoint) {
      const spX = ((startPoint.p1 - p1Min) / (p1Max - p1Min)) * width;
      const spY = (1 - (startPoint.p2 - p2Min) / (p2Max - p2Min)) * height;

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
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
      const racerColors: Record<OptimizerType, string> = {
        sgd: '#53D4F4',
        momentum: '#F7C76B',
        adam: '#FF5E7E',
      };

      Object.entries(raceData).forEach(([optKey, race]) => {
        const color = racerColors[optKey as OptimizerType] || race.color;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
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

        // Glowing Ball at current step
        if (stepsToDraw > 0) {
          const curStep = race.steps[stepsToDraw - 1];
          const sx = ((curStep.p1 - p1Min) / (p1Max - p1Min)) * width;
          const sy = (1 - (curStep.p2 - p2Min) / (p2Max - p2Min)) * height;

          ctx.shadowColor = color;
          ctx.shadowBlur = 14;
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
    ctx.strokeStyle = '#FF5E7E';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#FF5E7E';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curSX, curSY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [
    viewMode,
    landscape,
    raceData,
    raceStepIndex,
    currP1,
    currP2,
    startPoint,
    resolution,
    gridMin,
  ]);

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
    <div className={`p-4 md:p-6 rounded-3xl bg-[#141422] border border-[#262636] space-y-5 shadow-2xl flex flex-col ${className}`}>
      {/* ================= 1. ARENA TOP BAR & VIEWPORT CONTROLS ================= */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#262636] pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FF5E7E]/15 border border-[#FF5E7E]/30 flex items-center justify-center text-[#FF5E7E] shadow-[0_0_12px_rgba(255,94,126,0.3)]">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Optimizer Race Arena & Loss Landscape
            </h2>
            <p className="text-xs text-[#9E9EAF]">
              Continuous multivariable loss topology ℒ(w₁, w₂) in real-time 3D
            </p>
          </div>
        </div>

        {/* 3D vs 2D Toggle + Auto-Orbit + Reset Camera */}
        <div className="flex items-center gap-2">
          {viewMode === '3d' && (
            <>
              {/* Auto-Orbit Toggle Button */}
              <button
                onClick={() => setIsAutoOrbit(prev => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isAutoOrbit
                    ? 'border-[#FF5E7E]/60 bg-[#FF5E7E]/15 text-[#FF5E7E] shadow-[0_0_12px_rgba(255,94,126,0.25)]'
                    : 'border-[#262636] bg-[#0A0A10] text-[#9E9EAF] hover:text-white'
                }`}
                title="Toggle continuous 60fps cinematic camera orbit"
              >
                <Orbit className={`w-3.5 h-3.5 ${isAutoOrbit ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                <span>Orbit: {isAutoOrbit ? 'ON' : 'PAUSED'}</span>
              </button>

              {/* Reset Camera Button */}
              <button
                onClick={resetCamera}
                className="p-1.5 rounded-xl border border-[#262636] bg-[#0A0A10] text-[#9E9EAF] hover:text-white hover:border-[#FF5E7E]/50 transition-all"
                title="Reset Camera View to Default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* 3D vs 2D Toggle Pills */}
          <div className="flex items-center p-1 rounded-xl bg-[#0A0A10] border border-[#262636] text-xs font-semibold">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold'
                  : 'text-[#9E9EAF] hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 3D Surface
            </button>
            <button
              onClick={() => setViewMode('contour')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'contour'
                  ? 'bg-[#FF5E7E] text-white shadow-[0_0_12px_rgba(255,94,126,0.4)] font-bold'
                  : 'text-[#9E9EAF] hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" /> 2D Contour
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. INTERACTIVE RACE PLAYBAR & SLICE PICKER ================= */}
      <div className="p-3.5 rounded-2xl bg-[#0E0E18] border border-[#262636] space-y-3 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Click to drop banner with pulse */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E] animate-ping" />
            <span className="text-[#FF5E7E] font-bold">Interactive:</span>
            <span className="text-[#9E9EAF]">
              Click anywhere on the {viewMode === '3d' ? '3D surface' : 'contour'} to drop 3 balls & start racing!
            </span>
          </div>

          {/* Action Buttons: Start Race / Pause, Step, Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                raceActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'btn-coral'
              }`}
            >
              {raceActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Race
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {raceData ? 'Resume Race' : 'Start Race ▶'}
                </>
              )}
            </button>

            <button
              onClick={stepForward}
              disabled={raceActive}
              className="px-3 py-2 rounded-xl bg-[#141422] hover:bg-[#1C1C2C] border border-[#262636] text-slate-200 disabled:opacity-40 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Step Forward 1 Epoch"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step</span>
            </button>

            <button
              onClick={resetRace}
              className="p-2 rounded-xl bg-[#141422] hover:bg-[#1C1C2C] border border-[#262636] text-slate-400 hover:text-white transition-all"
              title="Reset Race"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Scrubber Timeline, Slice Selector, and Learning Rate */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2 border-t border-[#262636] text-xs">
          {/* Epoch Slider (Cols 1-6) */}
          <div className="md:col-span-6 flex items-center gap-3">
            <span className="text-[#9E9EAF] font-semibold uppercase text-[11px] whitespace-nowrap">
              Epoch Step:
            </span>
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
              className="flex-1 accent-[#FF5E7E] cursor-pointer"
            />
            <span className="font-mono text-[#FF5E7E] font-bold bg-[#141422] px-2 py-0.5 rounded border border-[#262636] text-[11px]">
              {raceStepIndex}/{totalSteps}
            </span>
          </div>

          {/* Slice Selector (Cols 7-9) */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-[#9E9EAF] text-[11px] font-semibold whitespace-nowrap">Slice:</span>
            <select
              value={sliceKey}
              onChange={e => setSliceKey(e.target.value as any)}
              className="w-full bg-[#141422] text-white text-xs px-2.5 py-1 rounded-xl border border-[#262636] focus:border-[#FF5E7E] focus:outline-none transition-colors"
            >
              <option value="W1_diag">W₁ Diagonals (w₁₁, w₂₂)</option>
              <option value="W1_row1">W₁ Row 1 (w₁₁, w₁₂)</option>
              <option value="W2_both">Output Weights (w₂,₁, w₂,₂)</option>
            </select>
          </div>

          {/* Learning Rate (Cols 10-12) */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <span className="text-[#9E9EAF] text-[11px] font-semibold whitespace-nowrap">LR η:</span>
            <input
              type="number"
              step="0.02"
              min="0.01"
              max="0.8"
              value={raceLR}
              onChange={e => setRaceLR(parseFloat(e.target.value) || 0.1)}
              className="w-16 bg-[#141422] text-white text-center font-mono text-xs px-2 py-1 rounded-xl border border-[#262636] focus:border-[#FF5E7E] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ================= 3. MAIN 3D / 2D VIEWPORT STAGE ================= */}
      <div className="relative w-full h-[380px] md:h-[440px] flex items-center justify-center bg-[#0C0C14] rounded-2xl overflow-hidden border border-[#262636] shadow-inner group">
        {viewMode === '3d' ? (
          <div ref={threeMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        ) : (
          <canvas
            ref={contourCanvasRef}
            width={520}
            height={440}
            onClick={handleContourCanvasClick}
            className="w-full h-full object-contain cursor-crosshair"
          />
        )}

        {/* Floating Glass Legend Overlay (Top-Left) */}
        <div className="absolute top-3 left-3 bg-[#141422]/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl text-xs font-mono border border-[#262636] text-white pointer-events-none space-y-1.5 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#53D4F4] shadow-[0_0_8px_#53D4F4]" />
            <span className="font-semibold text-[#53D4F4]">SGD (Vanilla)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F7C76B] shadow-[0_0_8px_#F7C76B]" />
            <span className="font-semibold text-[#F7C76B]">Momentum (Heavy Ball)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E] shadow-[0_0_8px_#FF5E7E]" />
            <span className="font-semibold text-[#FF5E7E]">Adam (Adaptive Moments)</span>
          </div>
          {startPoint && (
            <div className="pt-1.5 border-t border-[#262636] text-[10px] text-[#9E9EAF] flex items-center justify-between gap-2">
              <span>Drop Point:</span>
              <span className="text-white font-bold">
                ({startPoint.p1.toFixed(2)}, {startPoint.p2.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* Floating Global Minimum Pill (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 bg-[#141422]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-sans border border-[#262636] text-[#9E9EAF] pointer-events-none flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-[#FF5E7E]" />
          <span>Global Minimum:</span>
          <strong className="text-white font-mono">ℒ = {gridMin.loss.toFixed(4)}</strong>
        </div>

        {/* Interaction Hint (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 bg-[#141422]/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-sans border border-[#262636] text-[#9E9EAF] pointer-events-none flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5E7E]" />
          <span>
            {viewMode === '3d'
              ? 'Click to drop balls • Drag to orbit'
              : 'Click anywhere on contour to race'}
          </span>
        </div>
      </div>

      {/* ================= 4. REAL-TIME LOSS CURVES & LEADERBOARD ================= */}
      <OptimizerLossChart
        raceData={raceData}
        currentStep={raceStepIndex}
        totalSteps={totalSteps}
      />

      {/* ================= 5. HESSIAN CURVATURE & MULTIVARIABLE CALCULUS BANNER ================= */}
      <div className="p-3.5 rounded-2xl bg-[#0E0E18] border border-[#262636] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#53D4F4]/15 border border-[#53D4F4]/30 flex items-center justify-center text-[#53D4F4]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-tight">Hessian Curvature Matrix:</span>
              <span className="font-mono text-[#53D4F4] font-bold">
                λ₁ = {hessian.eigenvalues[0].toFixed(2)}, λ₂ = {hessian.eigenvalues[1].toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-[#9E9EAF] mt-0.5">
              Condition Number κ = {(Math.abs(hessian.eigenvalues[0]) / Math.max(0.01, Math.abs(hessian.eigenvalues[1]))).toFixed(1)}.{' '}
              {hessian.curvatureType === 'bowl'
                ? 'Eigenvalues both positive (all directions lead downhill).'
                : hessian.curvatureType === 'saddle'
                ? 'Opposite signs: curves up in one direction, down in another.'
                : 'One near-zero eigenvalue creates an elongated ravines where gradient descent oscillates.'}
            </p>
          </div>
        </div>

        {/* Curvature Type Badge */}
        <span
          className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-xs border ${
            hessian.curvatureType === 'bowl'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : hessian.curvatureType === 'saddle'
              ? 'bg-[#FF5E7E]/15 text-[#FF5E7E] border-[#FF5E7E]/40'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
          }`}
        >
          {hessian.curvatureType === 'bowl'
            ? 'Bowl (Convex Min)'
            : hessian.curvatureType === 'saddle'
            ? 'Saddle Point'
            : 'Flat Ravine'}
        </span>
      </div>
    </div>
  );
};
