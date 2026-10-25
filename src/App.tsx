import React, { useState, useEffect, useRef } from 'react';
import {
  Point2D,
  NetworkWeights,
  OptimizerConfig,
  Matrix2x2,
  Vector2D,
} from './math/types';
import { Datasets, DatasetPreset } from './math/datasets';
import { TopCommandBar, ViewMode } from './components/docks/TopCommandBar';
import { LeftTactileStudio } from './components/docks/LeftTactileStudio';
import { RightSpectralInspector } from './components/docks/RightSpectralInspector';
import { BottomTimelineDock } from './components/docks/BottomTimelineDock';
import { ManifoldWarper2D } from './components/warper/ManifoldWarper2D';
import { LossLandscapeView } from './components/loss/LossLandscapeView';
import { MiniLossRadar } from './components/loss/MiniLossRadar';
import { BackpropGraph } from './components/graph/BackpropGraph';
import { MathGuideModal } from './components/common/MathGuideModal';
import { SingularProofModal } from './components/common/SingularProofModal';
import { TheoremToastHUD, TheoremToast } from './components/common/TheoremToastHUD';
import { STORY_STEPS, StoryStep } from './components/story/StoryModeBar';
import { LinearAlgebra } from './math/linearAlgebra';
import { Maximize2, X, Sparkles, GraduationCap } from 'lucide-react';

export function App() {
  // View mode: 'split' | 'manifold' | 'loss' | 'graph'
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Dual persona: 'beginner' | 'judge'
  const [personaMode, setPersonaMode] = useState<'beginner' | 'judge'>('beginner');
  const [showPersonaRibbon, setShowPersonaRibbon] = useState(false);

  // Modals & Toasts
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSingularProofOpen, setIsSingularProofOpen] = useState(false);
  const [theoremToast, setTheoremToast] = useState<TheoremToast | null>(null);

  // Story mode pitch tour step ID
  const [currentStoryStepId, setCurrentStoryStepId] = useState<number>(1);

  // Dataset state
  const [currentPreset, setCurrentPreset] = useState<DatasetPreset>('xor');
  const [dataset, setDataset] = useState<Point2D[]>(() => Datasets.getPreset('xor'));
  const [activeClass, setActiveClass] = useState<0 | 1>(0);

  // Neural network state
  const [weights, setWeights] = useState<NetworkWeights>({
    W1: [[1.2, 0.4], [-0.5, 1.1]],
    b1: [0.0, 0.0],
    W2: [1.2, -1.0],
    b2: 0.0,
    activation: 'relu',
  });

  // Optimizer configuration
  const [optConfig, setOptConfig] = useState<OptimizerConfig>({
    type: 'adam',
    learningRate: 0.1,
    momentumGamma: 0.85,
    beta1: 0.9,
    beta2: 0.999,
  });

  // 2D Manifold Warper & SVD continuous homotopy state
  const [tau, setTau] = useState<number>(0.0);
  const [tauSVD, setTauSVD] = useState<number>(0.0);
  const [warperMode, setWarperMode] = useState<'homotopy' | 'svd'>('homotopy');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Animation frame reference for grid collapse
  const collapseAnimRef = useRef<number | null>(null);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (collapseAnimRef.current !== null) {
        cancelAnimationFrame(collapseAnimRef.current);
      }
    };
  }, []);

  // Handle Preset selection
  const handleSelectPreset = (preset: DatasetPreset) => {
    setCurrentPreset(preset);
    setDataset(Datasets.getPreset(preset));
  };

  // Dataset point management
  const handleAddPoint = (pt: Point2D) => {
    setDataset(prev => [...prev, pt]);
  };
  const handleUndoPoint = () => {
    setDataset(prev => prev.slice(0, -1));
  };
  const handleClearDataset = () => {
    setDataset([]);
  };

  // Reset entire network
  const handleResetNetwork = () => {
    setWeights({
      W1: [[1.0, 0.0], [0.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    });
    setTau(0.0);
    setTauSVD(0.0);
  };

  // Reset everything to factory defaults
  const handleResetAll = () => {
    handleSelectPreset('xor');
    handleResetNetwork();
    setViewMode('split');
    setWarperMode('homotopy');
    setCurrentStoryStepId(1);
    setTheoremToast(null);
  };

  // Handle Story Tour step selection
  const handleSelectStoryStep = (step: StoryStep) => {
    setCurrentStoryStepId(step.id);
    setCurrentPreset(step.presetDataset);
    setDataset(Datasets.getPreset(step.presetDataset));
    setWeights(step.presetWeights);
    setTau(step.tau);

    // Map step view tab to workstation view mode
    if (step.viewTab === 'warper') {
      setViewMode('manifold');
    } else if (step.viewTab === 'loss') {
      setViewMode('loss');
    } else if (step.viewTab === 'graph') {
      setViewMode('graph');
    }

    setActiveClass(step.activeClass);
  };

  // Failure Mode 1: Singular Matrix (det(W1) = 0)
  const handleTriggerSingularMatrix = () => {
    // Set linearly dependent rows (Row 2 = -2/3 * Row 1)
    setWeights(w => ({
      ...w,
      W1: [
        [1.5, -1.5],
        [-1.0, 1.0],
      ],
      b1: [0.0, 0.0],
    }));

    setViewMode('manifold');
    setWarperMode('homotopy');
    setTau(0.0);

    // Show sleek toast HUD
    setTheoremToast({
      type: 'singular',
      title: 'SINGULAR MATRIX RANK COLLAPSE [det(W₁) = 0]',
      theoremText:
        'By the Rank-Nullity Theorem, dim(ker(W₁)) = 1 collapses 2D space onto a 1D line; downstream layers can never separate points whose difference lies in the kernel.',
    });

    if (collapseAnimRef.current !== null) {
      cancelAnimationFrame(collapseAnimRef.current);
    }

    // Smoothly animate tau from 0 to 1.0 over 1600ms
    const startTimestamp = performance.now();
    const duration = 1600;

    const animateCollapse = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(1.0, elapsed / duration);
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setTau(ease * 1.0);

      if (progress < 1.0) {
        collapseAnimRef.current = requestAnimationFrame(animateCollapse);
      }
    };

    collapseAnimRef.current = requestAnimationFrame(animateCollapse);
  };

  // Failure Mode 2: Dead ReLU Trap
  const handleTriggerDeadReLU = () => {
    setWeights(w => ({
      ...w,
      activation: 'relu',
      W1: [
        [0.8, -0.6],
        [0.5, 0.9],
      ],
      b1: [-3.5, -3.5],
      W2: [1.2, -1.0],
      b2: 0.0,
    }));

    setViewMode('graph');
    setTheoremToast({
      type: 'dead_relu',
      title: 'DEAD RELU EXTINCTION [∇_W L = 0]',
      theoremText:
        'All preactivations fall into the negative half-space where ReLU\'(z) = 0; the chain rule contains a zero factor, completely stalling gradient descent.',
    });
  };

  const det = LinearAlgebra.det(weights.W1);
  const isSingularActive = Math.abs(det) < 0.02;
  const isDeadReLUActive =
    weights.activation === 'relu' && weights.b1[0] < -2 && weights.b1[1] < -2;

  // Persona text helper
  const getPersonaText = () => {
    if (isSingularActive) {
      return personaMode === 'beginner'
        ? 'Paper squashed to wire: All blue and pink dots are crushed onto one single line!'
        : 'Rank deficiency: dim(ker(W₁)) ≥ 1 annihilates invertible topological information.';
    }
    if (tau <= 1.0) {
      return personaMode === 'beginner'
        ? 'Stretching and turning a rubber sheet. Straight lines stay completely straight.'
        : 'Affine homotopy: H(x, τ) = (1 - τ)I x + τ(W₁x + b₁), preserving parallelism.';
    } else if (tau <= 2.0) {
      return personaMode === 'beginner'
        ? `Folding space with ${weights.activation.toUpperCase()}: creasing flat so classes can be separated!`
        : `Cover's Theorem: Non-linearly embedding into feature space separates complex manifolds.`;
    } else {
      return personaMode === 'beginner'
        ? 'Drawing one straight scissor cut across the folded canvas!'
        : 'Linear hyperplane separation w₂ᵀ a₁ + b₂ = 0 in transformed feature space.';
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#05070B] text-slate-100 font-sans selection:bg-cyber-cyan selection:text-black">
      {/* 1. Spatial Radial Vignette Overlay */}
      <div className="fixed inset-0 spatial-vignette pointer-events-none z-10" />

      {/* 2. Top Floating Command Bar */}
      <TopCommandBar
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        currentStoryStepId={currentStoryStepId}
        onSelectStoryStep={handleSelectStoryStep}
        personaMode={personaMode}
        onTogglePersonaMode={() => {
          setPersonaMode(p => (p === 'beginner' ? 'judge' : 'beginner'));
          setShowPersonaRibbon(true);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetAll={handleResetAll}
      />

      {/* 3. Intuition / Rigor Floating Capsule (Below Command Bar) */}
      {showPersonaRibbon && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92vw] glass-pill px-4 py-2 rounded-2xl flex items-center justify-between gap-3 text-xs border border-white/[0.08] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            {personaMode === 'judge' ? (
              <GraduationCap className="w-4 h-4 text-cyber-violet shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyber-cyan shrink-0" />
            )}
            <span className="text-[11px] font-mono text-slate-200">
              <strong className={personaMode === 'judge' ? 'text-cyber-violet' : 'text-cyber-cyan'}>
                {personaMode === 'judge' ? 'MATH RIGOR: ' : 'INTUITION: '}
              </strong>
              {getPersonaText()}
            </span>
          </div>
          <button
            onClick={() => setShowPersonaRibbon(false)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Sliding Theorem Toast HUD */}
      <TheoremToastHUD
        toast={theoremToast}
        onClose={() => setTheoremToast(null)}
        onOpenProofModal={() => setIsSingularProofOpen(true)}
      />

      {/* 5. Central Spatial Viewport */}
      {/* View Mode: 2D Manifold OR Split Studio Primary Canvas */}
      {(viewMode === 'manifold' || viewMode === 'split') && (
        <div className="fixed inset-0 w-screen h-screen">
          <ManifoldWarper2D
            weights={weights}
            dataset={dataset}
            tau={tau}
            onChangeTau={setTau}
            tauSVD={tauSVD}
            onChangeTauSVD={setTauSVD}
            warperMode={warperMode}
            onChangeWarperMode={setWarperMode}
            onAddPoint={handleAddPoint}
            activeClass={activeClass}
            showHeatmap={showHeatmap}
            className="w-full h-full"
          />
        </div>
      )}

      {/* View Mode: 3D Loss Arena (Full Screen) */}
      {viewMode === 'loss' && (
        <div className="fixed inset-0 w-screen h-screen pt-16 pb-20 px-6 z-20 flex items-center justify-center">
          <LossLandscapeView
            dataset={dataset}
            weights={weights}
            onSelectParam={(p1, p2) => {
              setWeights(w => ({
                ...w,
                W1: [
                  [p1, w.W1[0][1]],
                  [w.W1[1][0], p2],
                ],
              }));
            }}
            className="w-full max-w-6xl h-full max-h-[84vh]"
          />
        </div>
      )}

      {/* View Mode: Backprop Graph (Full Screen) */}
      {viewMode === 'graph' && (
        <div className="fixed inset-0 w-screen h-screen pt-16 pb-20 px-6 z-20 flex items-center justify-center">
          <BackpropGraph
            weights={weights}
            dataset={dataset}
            className="w-full max-w-5xl h-full max-h-[84vh]"
          />
        </div>
      )}

      {/* Split Studio Picture-in-Picture Floating Windows */}
      {viewMode === 'split' && (
        <>
          {/* Floating PiP: 3D Loss Arena & Optimizer Race */}
          <div className="hidden lg:flex fixed top-20 right-96 z-20 w-[410px] h-[330px] glass-hud rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between bg-black/40 text-[10px] font-mono">
              <span className="text-cyber-magenta font-bold">PIP // 3D LOSS ARENA</span>
              <button
                onClick={() => setViewMode('loss')}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Maximize2 className="w-3 h-3" /> Expand
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LossLandscapeView
                dataset={dataset}
                weights={weights}
                onSelectParam={(p1, p2) => {
                  setWeights(w => ({
                    ...w,
                    W1: [
                      [p1, w.W1[0][1]],
                      [w.W1[1][0], p2],
                    ],
                  }));
                }}
                className="w-full h-full border-0 rounded-none bg-transparent"
              />
            </div>
          </div>
        </>
      )}

      {/* Interactive Picture-in-Picture Mini Loss Landscape Radar */}
      {(viewMode === 'manifold' || viewMode === 'split') && (
        <MiniLossRadar
          dataset={dataset}
          weights={weights}
          onUpdateWeights={setWeights}
          onExpand={() => setViewMode('loss')}
          className="fixed bottom-24 right-4 lg:right-[366px] z-30"
        />
      )}

      {/* 6. Left Floating Dock: Tactile Matrix & Dataset Studio */}
      <LeftTactileStudio
        W1={weights.W1}
        b1={weights.b1}
        onChangeW1={newW1 => setWeights(w => ({ ...w, W1: newW1 }))}
        onChangeB1={newB1 => setWeights(w => ({ ...w, b1: newB1 }))}
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        dataset={dataset}
        activeClass={activeClass}
        onSetActiveClass={setActiveClass}
        onUndoPoint={handleUndoPoint}
        onClearDataset={handleClearDataset}
        weights={weights}
        onUpdateWeights={setWeights}
        optConfig={optConfig}
        onChangeOptConfig={setOptConfig}
        onTriggerSingularMatrix={handleTriggerSingularMatrix}
        onTriggerDeadReLU={handleTriggerDeadReLU}
        onOpenSingularProof={() => setIsSingularProofOpen(true)}
        isSingularActive={isSingularActive}
        isDeadReLUActive={isDeadReLUActive}
      />

      {/* 7. Right Floating Dock: Visual Spectral & SVD Inspector */}
      <RightSpectralInspector
        W1={weights.W1}
        tauSVD={tauSVD}
        onChangeTauSVD={setTauSVD}
        warperMode={warperMode}
        onChangeWarperMode={setWarperMode}
      />

      {/* 8. Bottom Center Floating Timeline Dock: DaVinci-Style Homotopy Scrubber */}
      <BottomTimelineDock
        tau={tau}
        onChangeTau={setTau}
        tauSVD={tauSVD}
        onChangeTauSVD={setTauSVD}
        warperMode={warperMode}
        onChangeWarperMode={setWarperMode}
      />

      {/* 9. Educational Handbooks & Proof Modals */}
      <MathGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <SingularProofModal
        isOpen={isSingularProofOpen}
        onClose={() => setIsSingularProofOpen(false)}
      />
    </div>
  );
}
