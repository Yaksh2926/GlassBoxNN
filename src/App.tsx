import React, { useState, useEffect, useRef } from 'react';
import {
  Point2D,
  NetworkWeights,
  OptimizerConfig,
  Matrix2x2,
  Vector2D,
} from './math/types';
import { Datasets, DatasetPreset } from './math/datasets';
import { TopCommandBar, ViewMode, LabMode } from './components/docks/TopCommandBar';
import { GuidedStudio } from './components/guided/GuidedStudio';
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
import { WhatJustHappenedPanel, OperationContextType } from './components/common/WhatJustHappenedPanel';
import { DemoModeModal, DEMO_STEPS, DemoStep } from './components/story/DemoModeModal';
import { JudgeDemoModal } from './components/story/JudgeDemoModal';
import { LandingPage } from './components/landing/LandingPage';
import { LinearAlgebra } from './math/linearAlgebra';
import { NeuralEngine, OptimizerState, createInitialOptimizerState } from './math/neuralEngine';
import confetti from 'canvas-confetti';
import { Maximize2, X, Sparkles, GraduationCap } from 'lucide-react';

export function App() {
  // Navigation Screen: 'landing' | 'lab'
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'lab'>('landing');

  // Progressive Disclosure Lab Mode: 'guided' (Simple 3-Step) | 'advanced' (Full Mathematical Observatory)
  const [labMode, setLabMode] = useState<LabMode>('guided');

  // View mode: 'geometry' | 'loss' | 'graph'
  const [viewMode, setViewMode] = useState<ViewMode>('geometry');

  // Dual persona: 'beginner' (Explore Mode) | 'judge' (Judge Mode)
  const [personaMode, setPersonaMode] = useState<'beginner' | 'judge'>('beginner');

  // Contextual "What Just Happened?" state
  const [contextType, setContextType] = useState<OperationContextType>('idle');
  const [lastChangedParam, setLastChangedParam] = useState<string>('');

  // Modals & Panels
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSingularProofOpen, setIsSingularProofOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [theoremToast, setTheoremToast] = useState<TheoremToast | null>(null);

  // Panel Collapsible states (Inspector collapsed by default in guided mode)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // Live Training Engine State (Shared between Guided Studio, Advanced Lab, and Judge Demo)
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);
  const optStateRef = useRef<OptimizerState>(createInitialOptimizerState());
  const trainingAnimRef = useRef<number | null>(null);
  const hasTriggeredConfetti = useRef<boolean>(false);

  // Point Selection state
  const [selectedPoint, setSelectedPoint] = useState<Point2D | null>(null);

  // Dataset state (Defaults to 'linear' for immediate success and clarity)
  const [currentPreset, setCurrentPreset] = useState<DatasetPreset>('linear');
  const [dataset, setDataset] = useState<Point2D[]>(() => Datasets.getPreset('linear'));
  const [activeClass, setActiveClass] = useState<0 | 1>(0);

  // Neural network parameters
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

  // Continuous Homotopy and SVD Timeline Parameters
  const [tau, setTau] = useState<number>(0.0);
  const [tauSVD, setTauSVD] = useState<number>(0.0);
  const [warperMode, setWarperMode] = useState<'homotopy' | 'svd'>('homotopy');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Animation frame reference for failure mode collapse
  const collapseAnimRef = useRef<number | null>(null);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (collapseAnimRef.current !== null) {
        cancelAnimationFrame(collapseAnimRef.current);
      }
    };
  }, []);

  // Preset Selection
  const handleSelectPreset = (preset: DatasetPreset) => {
    setCurrentPreset(preset);
    const newPts = Datasets.getPreset(preset);
    setDataset(newPts);
    setSelectedPoint(null);
    setContextType('matrix_change');
    setLastChangedParam(`Loaded ${preset.toUpperCase()} Dataset`);
  };

  // Dataset Points
  const handleAddPoint = (pt: Point2D) => {
    setDataset(prev => [...prev, pt]);
    setSelectedPoint(pt);
    setContextType('point_selected');
  };

  const handleUndoPoint = () => {
    setDataset(prev => prev.slice(0, -1));
    setSelectedPoint(null);
  };

  const handleClearDataset = () => {
    setDataset([]);
    setSelectedPoint(null);
  };

  // Matrix weight updates
  const handleUpdateW1 = (newW1: Matrix2x2) => {
    setWeights(w => ({ ...w, W1: newW1 }));
    setContextType('weight_change');
    setLastChangedParam('Matrix W₁');
  };

  const handleUpdateB1 = (newB1: Vector2D) => {
    setWeights(w => ({ ...w, b1: newB1 }));
    setContextType('weight_change');
    setLastChangedParam('Bias b₁');
  };

  // Live Metrics
  const currentLoss = dataset.length > 0 ? NeuralEngine.computeLoss(dataset, weights) : 0;
  const currentAcc = dataset.length > 0 ? NeuralEngine.computeAccuracy(dataset, weights) : 0;

  // Single Training Optimization Step
  const executeTrainingStep = () => {
    if (dataset.length === 0) return;
    const currentGrads = NeuralEngine.computeGradients(dataset, weights);
    const { updatedWeights, updatedState } = NeuralEngine.applyOptimizerStep(
      weights,
      currentGrads,
      optStateRef.current,
      optConfig
    );
    optStateRef.current = updatedState;
    setWeights(updatedWeights);
    setEpoch(prev => prev + 1);
    setContextType('training_step');
  };

  // Continuous Training Loop
  useEffect(() => {
    if (!isTraining) {
      if (trainingAnimRef.current !== null) {
        cancelAnimationFrame(trainingAnimRef.current);
        trainingAnimRef.current = null;
      }
      return;
    }

    const loop = () => {
      // 2 sub-steps per animation frame for crisp, responsive 60fps convergence
      for (let i = 0; i < 2; i++) {
        executeTrainingStep();
      }
      trainingAnimRef.current = requestAnimationFrame(loop);
    };

    trainingAnimRef.current = requestAnimationFrame(loop);
    return () => {
      if (trainingAnimRef.current !== null) {
        cancelAnimationFrame(trainingAnimRef.current);
        trainingAnimRef.current = null;
      }
    };
  }, [isTraining, weights, dataset, optConfig]);

  // Confetti Celebration on 100% Convergence
  useEffect(() => {
    if (currentAcc === 1.0 && dataset.length >= 8 && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#53D4F4', '#F078C5', '#F7C76B', '#10B981'],
      });
    } else if (currentAcc < 0.95) {
      hasTriggeredConfetti.current = false;
    }
  }, [currentAcc, dataset.length]);

  const handleToggleTraining = () => {
    setIsTraining(prev => !prev);
  };

  const handleStepOnce = () => {
    executeTrainingStep();
  };

  // Reset entire network
  const handleResetNetwork = () => {
    setIsTraining(false);
    setEpoch(0);
    optStateRef.current = createInitialOptimizerState();
    setWeights({
      W1: [[1.0, 0.0], [0.0, 1.0]],
      b1: [0.0, 0.0],
      W2: [1.0, -1.0],
      b2: 0.0,
      activation: 'relu',
    });
    setTau(0.0);
    setTauSVD(0.0);
    setSelectedPoint(null);
    setContextType('idle');
  };

  // Set initial unlearned weights for presentation (accuracy starts low at ~8%)
  const handleSetInitialUnlearnedWeights = () => {
    setIsTraining(false);
    setEpoch(0);
    optStateRef.current = createInitialOptimizerState();
    setWeights({
      W1: [[0.5, -0.2], [0.3, 0.4]],
      b1: [0.0, 0.0],
      W2: [0.5, -0.5],
      b2: 0.0,
      activation: 'relu',
    });
    setTau(0.0);
    setTauSVD(0.0);
    setSelectedPoint(null);
    setContextType('idle');
  };

  // Transition from Guided Studio or Judge Demo to Advanced Lab
  const handleTransitionToAdvancedLab = () => {
    setLabMode('advanced');
    setIsRightPanelOpen(true);
    setViewMode('geometry');
  };

  // Reset Everything to Defaults
  const handleResetAll = () => {
    handleSelectPreset('linear');
    handleResetNetwork();
    setViewMode('geometry');
    setWarperMode('homotopy');
    setTheoremToast(null);
    setSelectedPoint(null);
    setContextType('idle');
  };

  // Failure Mode 1: Singular Matrix (det(W1) = 0)
  const handleTriggerSingularMatrix = () => {
    setWeights(w => ({
      ...w,
      W1: [
        [1.5, -1.5],
        [-1.0, 1.0],
      ],
      b1: [0.0, 0.0],
    }));

    setViewMode('geometry');
    setWarperMode('homotopy');
    setTau(0.0);
    setContextType('singular_collapse');

    setTheoremToast({
      type: 'singular',
      title: 'SINGULAR MATRIX RANK COLLAPSE [det(W₁) = 0]',
      theoremText:
        'By the Rank-Nullity Theorem, dim(ker(W₁)) = 1 collapses 2D space onto a 1D line; downstream layers can never separate points whose difference lies in the kernel.',
    });

    if (collapseAnimRef.current !== null) {
      cancelAnimationFrame(collapseAnimRef.current);
    }

    const startTimestamp = performance.now();
    const duration = 1500;

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
    setContextType('dead_relu');
    setTheoremToast({
      type: 'dead_relu',
      title: 'DEAD RELU EXTINCTION [∇_W L = 0]',
      theoremText:
        'All preactivations fall into the negative half-space where ReLU\'(z) = 0; the chain rule contains a zero factor, completely stalling gradient descent.',
    });
  };

  // Apply Demo Step
  const handleApplyDemoStep = (step: DemoStep) => {
    setCurrentPreset(step.preset);
    setDataset(Datasets.getPreset(step.preset));
    setWeights(step.weights);
    setTau(step.tau);
    setViewMode(step.viewMode);
    setSelectedPoint(null);
    setContextType(
      step.viewMode === 'loss'
        ? 'view_loss'
        : step.viewMode === 'graph'
        ? 'view_graph'
        : step.id === 3
        ? 'singular_collapse'
        : step.id === 4
        ? 'activation_change'
        : 'homotopy_scrub'
    );
  };

  const det = LinearAlgebra.det(weights.W1);
  const isSingularActive = Math.abs(det) < 0.02;
  const isDeadReLUActive =
    weights.activation === 'relu' && weights.b1[0] < -2 && weights.b1[1] < -2;

  // IF ON LANDING PAGE: Render refined Landing Page
  if (currentScreen === 'landing') {
    return (
      <>
        <LandingPage
          onEnterLab={() => setCurrentScreen('lab')}
          onExploreMath={() => setIsGuideOpen(true)}
        />
        <MathGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </>
    );
  }

  // IF IN LAB WORKSPACE: Render Mathematical Observatory
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0B1020] text-[#F4F7FB] font-sans selection:bg-[#53D4F4] selection:text-black">
      {/* 1. Spatial Radial Vignette Overlay */}
      <div className="fixed inset-0 spatial-vignette pointer-events-none z-10" />

      {/* 2. Top Command Bar */}
      <TopCommandBar
        labMode={labMode}
        onSelectLabMode={mode => {
          setLabMode(mode);
          if (mode === 'advanced') {
            setIsRightPanelOpen(true);
          } else {
            setIsRightPanelOpen(false);
          }
        }}
        viewMode={viewMode}
        onSelectViewMode={mode => {
          setViewMode(mode);
          setContextType(mode === 'loss' ? 'view_loss' : mode === 'graph' ? 'view_graph' : 'homotopy_scrub');
        }}
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        personaMode={personaMode}
        onTogglePersonaMode={() =>
          setPersonaMode(p => (p === 'beginner' ? 'judge' : 'beginner'))
        }
        onOpenDemo={() => setIsJudgeDemoOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetAll={handleResetAll}
        onGoHome={() => setCurrentScreen('landing')}
        isLeftPanelOpen={isLeftPanelOpen}
        onToggleLeftPanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
      />

      {/* 3. Sliding Theorem Toast HUD */}
      <TheoremToastHUD
        toast={theoremToast}
        onClose={() => setTheoremToast(null)}
        onOpenProofModal={() => setIsSingularProofOpen(true)}
      />

      {/* 4. Central Mathematical Canvas Viewport */}
      {viewMode === 'geometry' && (
        <div className="fixed inset-0 w-screen h-screen">
          <ManifoldWarper2D
            weights={weights}
            dataset={dataset}
            tau={tau}
            onChangeTau={updater => {
              setTau(updater);
              setContextType('homotopy_scrub');
            }}
            tauSVD={tauSVD}
            onChangeTauSVD={setTauSVD}
            warperMode={warperMode}
            onChangeWarperMode={setWarperMode}
            onAddPoint={handleAddPoint}
            activeClass={activeClass}
            showHeatmap={showHeatmap}
            selectedPoint={selectedPoint}
            onSelectPoint={pt => {
              setSelectedPoint(pt);
              setContextType(pt ? 'point_selected' : 'idle');
            }}
            className="w-full h-full"
          />
        </div>
      )}

      {/* View Mode: 3D Loss Landscape & Contour Arena (in Advanced Lab) */}
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
              setContextType('weight_change');
            }}
            className="w-full max-w-6xl h-full max-h-[84vh]"
          />
        </div>
      )}

      {/* View Mode: Backprop Graph (Silicon Autodiff Flow in Advanced Lab) */}
      {viewMode === 'graph' && (
        <div className="fixed inset-0 w-screen h-screen pt-16 pb-20 px-6 z-20 flex items-center justify-center">
          <BackpropGraph
            weights={weights}
            dataset={dataset}
            className="w-full max-w-5xl h-full max-h-[84vh]"
          />
        </div>
      )}

      {/* Interactive Picture-in-Picture Mini Loss Landscape Radar (Visible in Geometry Mode in Advanced Lab) */}
      {labMode === 'advanced' && viewMode === 'geometry' && (
        <MiniLossRadar
          dataset={dataset}
          weights={weights}
          onUpdateWeights={newW => {
            setWeights(newW);
            setContextType('weight_change');
          }}
          onExpand={() => setViewMode('loss')}
          className="fixed bottom-24 right-4 lg:right-[300px] z-30"
        />
      )}

      {/* 5. Left Floating Dock: Mode-Aware Controls (Guided Studio or Tactile Advanced Lab) */}
      {labMode === 'guided' ? (
        isLeftPanelOpen && (
          <GuidedStudio
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            dataset={dataset}
            weights={weights}
            onUpdateWeights={newW => {
              setWeights(newW);
              setContextType('training_step');
            }}
            isTraining={isTraining}
            onToggleTraining={handleToggleTraining}
            onStepOnce={handleStepOnce}
            onResetModel={handleResetNetwork}
            epoch={epoch}
            loss={currentLoss}
            accuracy={currentAcc}
            onOpenAdvancedLab={handleTransitionToAdvancedLab}
            onLaunchJudgeDemo={() => setIsJudgeDemoOpen(true)}
          />
        )
      ) : (
        <LeftTactileStudio
          W1={weights.W1}
          b1={weights.b1}
          onChangeW1={handleUpdateW1}
          onChangeB1={handleUpdateB1}
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
          dataset={dataset}
          activeClass={activeClass}
          onSetActiveClass={setActiveClass}
          onUndoPoint={handleUndoPoint}
          onClearDataset={handleClearDataset}
          weights={weights}
          onUpdateWeights={newW => {
            setWeights(newW);
            setContextType('training_step');
          }}
          optConfig={optConfig}
          onChangeOptConfig={setOptConfig}
          onTriggerSingularMatrix={handleTriggerSingularMatrix}
          onTriggerDeadReLU={handleTriggerDeadReLU}
          onOpenSingularProof={() => setIsSingularProofOpen(true)}
          isSingularActive={isSingularActive}
          isDeadReLUActive={isDeadReLUActive}
          isCollapsed={!isLeftPanelOpen}
          onToggleCollapse={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          isTraining={isTraining}
          onToggleTraining={handleToggleTraining}
          epoch={epoch}
          onStepOnce={handleStepOnce}
          onResetModel={handleResetNetwork}
        />
      )}

      {/* 6. Right Floating Dock: Visual Spectral & SVD Inspector */}
      <RightSpectralInspector
        W1={weights.W1}
        weights={weights}
        selectedPoint={selectedPoint}
        onClearSelectedPoint={() => setSelectedPoint(null)}
        tauSVD={tauSVD}
        onChangeTauSVD={setTauSVD}
        warperMode={warperMode}
        onChangeWarperMode={setWarperMode}
        isCollapsed={!isRightPanelOpen}
        onToggleCollapse={() => setIsRightPanelOpen(!isRightPanelOpen)}
      />

      {/* 7. Bottom Center: DaVinci-Style Homotopy Scrubber (Visible in Advanced Lab Geometry mode) */}
      {labMode === 'advanced' && viewMode === 'geometry' && (
        <BottomTimelineDock
          tau={tau}
          onChangeTau={updater => {
            setTau(updater);
            setContextType('homotopy_scrub');
          }}
          tauSVD={tauSVD}
          onChangeTauSVD={setTauSVD}
          warperMode={warperMode}
          onChangeWarperMode={setWarperMode}
        />
      )}

      {/* 8. Signature UX Feature: "What Just Happened?" Contextual Floating Capsule */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[90vw]">
        <WhatJustHappenedPanel
          contextType={contextType}
          personaMode={personaMode}
          weights={weights}
          tau={tau}
          selectedPoint={selectedPoint}
          lastChangedParam={lastChangedParam}
          lossValue={currentLoss}
          accuracy={currentAcc}
        />
      </div>

      {/* 9. Presentation-Ready Ideathon Judge Demo Modal */}
      <JudgeDemoModal
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
        dataset={dataset}
        weights={weights}
        loss={currentLoss}
        accuracy={currentAcc}
        epoch={epoch}
        isTraining={isTraining}
        onToggleTraining={handleToggleTraining}
        onResetTraining={handleResetNetwork}
        onSelectPreset={handleSelectPreset}
        onSetInitialUnlearnedWeights={handleSetInitialUnlearnedWeights}
        onTransitionToAdvancedLab={handleTransitionToAdvancedLab}
      />

      {/* 10. Secondary Deep Storytelling Demo Mode Modal */}
      <DemoModeModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        currentStepIndex={demoStepIndex}
        onChangeStep={setDemoStepIndex}
        onApplyStep={handleApplyDemoStep}
        personaMode={personaMode}
      />

      {/* 11. Educational Handbooks & Proof Modals */}
      <MathGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <SingularProofModal
        isOpen={isSingularProofOpen}
        onClose={() => setIsSingularProofOpen(false)}
      />
    </div>
  );
}
