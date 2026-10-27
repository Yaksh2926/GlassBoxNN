import React, { useState, useEffect, useRef } from 'react';
import {
  Point2D,
  NetworkWeights,
  OptimizerConfig,
  Matrix2x2,
  Vector2D,
} from './math/types';
import { Datasets, DatasetPreset } from './math/datasets';
import { TopCommandBar, NavTab } from './components/docks/TopCommandBar';
import { CoverPage } from './components/landing/CoverPage';
import { ConsoleStudio } from './components/studio/ConsoleStudio';
import { LossConsoleStudio } from './components/loss/LossConsoleStudio';
import { BlackBoxStoryView } from './components/story/BlackBoxStoryView';
import { SimpleStudio } from './components/studio/SimpleStudio';
import { ManifoldWarper2D } from './components/warper/ManifoldWarper2D';
import { LossLandscapeView } from './components/loss/LossLandscapeView';
import { MathGuideModal } from './components/common/MathGuideModal';
import { SingularProofModal } from './components/common/SingularProofModal';
import { TheoremToastHUD, TheoremToast } from './components/common/TheoremToastHUD';
import { JudgeDemoModal } from './components/story/JudgeDemoModal';
import { LinearAlgebra } from './math/linearAlgebra';
import { NeuralEngine, OptimizerState, createInitialOptimizerState } from './math/neuralEngine';
import confetti from 'canvas-confetti';

export function App() {
  // Navigation Tab: 'cover' (Front View / Cover Page) | 'playground' (Slide 2 Studio) | 'loss' (3D Loss Landscape) | 'story' (Slide 1 & 3 Presentation)
  const [navTab, setNavTab] = useState<NavTab>('cover');

  // Dual persona: 'beginner' (Default Intuition Mode) | 'judge' (Full Math View)
  const [personaMode, setPersonaMode] = useState<'beginner' | 'judge'>('beginner');

  // Modals & Panels
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSingularProofOpen, setIsSingularProofOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);
  const [theoremToast, setTheoremToast] = useState<TheoremToast | null>(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  // Live Training Engine State
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epoch, setEpoch] = useState<number>(0);
  const optStateRef = useRef<OptimizerState>(createInitialOptimizerState());
  const trainingAnimRef = useRef<number | null>(null);
  const hasTriggeredConfetti = useRef<boolean>(false);

  // Point Selection state
  const [selectedPoint, setSelectedPoint] = useState<Point2D | null>(null);

  // Dataset state (Defaults to 'linear' for immediate clarity)
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

  // Optimizer configuration (Adam at 60fps)
  const [optConfig] = useState<OptimizerConfig>({
    type: 'adam',
    learningRate: 0.1,
    momentumGamma: 0.85,
    beta1: 0.9,
    beta2: 0.999,
  });

  // Continuous Homotopy Parameter tau in [0, 2]
  const [tau, setTau] = useState<number>(0.0);
  const [showHeatmap] = useState<boolean>(true);
  const [lastChangedParam, setLastChangedParam] = useState<string>('');

  // Animation frame reference for failure mode collapse
  const collapseAnimRef = useRef<number | null>(null);

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
    setLastChangedParam(`Loaded ${preset.toUpperCase()} Dataset`);
  };

  // Dataset Point Manipulation
  const handleAddPoint = (pt: Point2D) => {
    setDataset(prev => [...prev, pt]);
    setSelectedPoint(pt);
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
    setLastChangedParam('Matrix W₁');
  };

  const handleUpdateB1 = (newB1: Vector2D) => {
    setWeights(w => ({ ...w, b1: newB1 }));
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
  };

  // Continuous Training Loop (2 sub-steps per animation frame)
  useEffect(() => {
    if (!isTraining) {
      if (trainingAnimRef.current !== null) {
        cancelAnimationFrame(trainingAnimRef.current);
        trainingAnimRef.current = null;
      }
      return;
    }

    const loop = () => {
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
    if (currentAcc >= 0.98 && dataset.length >= 8 && !hasTriggeredConfetti.current) {
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
    setSelectedPoint(null);
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
    setSelectedPoint(null);
  };

  // Reset Everything to Defaults
  const handleResetAll = () => {
    handleSelectPreset('linear');
    handleResetNetwork();
    setTheoremToast(null);
    setSelectedPoint(null);
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

    setTau(0.0);

    setTheoremToast({
      type: 'singular',
      title: 'SINGULAR MATRIX RANK COLLAPSE [det(W₁) = 0]',
      theoremText:
        'By the Rank-Nullity Theorem, dim(ker(W₁)) = 1 collapses 2D space onto a 1D line; downstream layers can never separate points whose difference lies in the kernel.',
      beginnerTitle: '💥 Space Squashed Flat! (2D ➔ 1D Line)',
      beginnerText:
        'You set the weights so both grid directions collapsed onto the exact same diagonal line. Once a 2D sheet of paper is squashed into a 1D string, the AI loses a whole dimension and can never separate the dots!',
      proofBadge: 'det(W₁) = 0 ⟹ Rank(W₁) < 2 (Rank-Nullity Theorem)',
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

    setTheoremToast({
      type: 'dead_relu',
      title: 'DEAD RELU EXTINCTION [∇_W ℒ = 0]',
      theoremText:
        'All preactivations fall into the negative half-space where ReLU\'(z) = 0; the chain rule contains a zero factor, completely stalling gradient descent.',
      beginnerTitle: '🥶 Brain Freeze! (Zero Gradient Zone)',
      beginnerText:
        'All points got pushed into the negative zone where the ReLU fold is completely flat. On flat ground, a ball won\'t roll—so the slope (derivative) becomes 0, all compass nudges stop, and the AI freezes forever!',
      proofBadge: 'z ≤ 0 ⟹ ReLU\'(z) = 0 ⟹ ∇_W ℒ = 0 (Gradient Freeze)',
    });
  };

  // Determine failure mode active states
  const isSingularActive = Math.abs(LinearAlgebra.det(weights.W1)) < 0.01;
  const isDeadReLUActive = weights.b1[0] <= -3.0 && weights.b1[1] <= -3.0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0C0C12] text-[#F4F7FB] select-none font-sans flex flex-col">
      {/* 1. Sleek Top Navigation Bar with Presentation Tabs */}
      <TopCommandBar
        navTab={navTab}
        onSelectNavTab={setNavTab}
        personaMode={personaMode}
        onTogglePersonaMode={() =>
          setPersonaMode(p => (p === 'beginner' ? 'judge' : 'beginner'))
        }
        onOpenDemo={() => setIsJudgeDemoOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetAll={handleResetAll}
      />

      {/* 2. Sliding Theorem Toast HUD for Failure Modes */}
      <TheoremToastHUD
        toast={theoremToast}
        onClose={() => setTheoremToast(null)}
        onOpenProofModal={() => setIsSingularProofOpen(true)}
        intuitionMode={personaMode === 'beginner'}
      />

      {/* 3. Main Viewport Container */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {navTab === 'cover' && (
          <CoverPage
            onEnterLab={() => setNavTab('playground')}
            onExplore3DLoss={() => setNavTab('loss')}
            onReadStory={() => setNavTab('story')}
            onLaunchJudgeDemo={() => setIsJudgeDemoOpen(true)}
          />
        )}

        {navTab === 'playground' && (
          <ConsoleStudio
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            dataset={dataset}
            setDataset={setDataset}
            activeClass={activeClass}
            onSetActiveClass={setActiveClass}
            onAddPoint={handleAddPoint}
            onUndoPoint={handleUndoPoint}
            onClearDataset={handleClearDataset}
            weights={weights}
            onChangeW1={handleUpdateW1}
            onChangeB1={handleUpdateB1}
            isTraining={isTraining}
            onToggleTraining={handleToggleTraining}
            onStepOnce={handleStepOnce}
            onResetModel={handleResetNetwork}
            epoch={epoch}
            loss={currentLoss}
            accuracy={currentAcc}
            tau={tau}
            onChangeTau={setTau}
            onTriggerSingularMatrix={handleTriggerSingularMatrix}
            onTriggerDeadReLU={handleTriggerDeadReLU}
            isSingularActive={isSingularActive}
            isDeadReLUActive={isDeadReLUActive}
            intuitionMode={personaMode === 'beginner'}
            onToggleIntuitionMode={() =>
              setPersonaMode(p => (p === 'beginner' ? 'judge' : 'beginner'))
            }
            onLaunchJudgeDemo={() => setIsJudgeDemoOpen(true)}
            onSwitchToStory={() => setNavTab('story')}
            onSwitchTo3DLoss={() => setNavTab('loss')}
            lastChangedParam={lastChangedParam}
          />
        )}

        {navTab === 'loss' && (
          <LossConsoleStudio
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
              setLastChangedParam('3D Loss Surface Parameter');
            }}
            intuitionMode={personaMode === 'beginner'}
            onToggleIntuitionMode={() =>
              setPersonaMode(p => (p === 'beginner' ? 'judge' : 'beginner'))
            }
            onLaunchJudgeDemo={() => setIsJudgeDemoOpen(true)}
            onSwitchToPlayground={() => setNavTab('playground')}
            onSwitchToStory={() => setNavTab('story')}
            onResetModel={handleResetNetwork}
          />
        )}

        {navTab === 'story' && (
          <BlackBoxStoryView
            onEnterPlayground={() => setNavTab('playground')}
            onEnter3DLoss={() => setNavTab('loss')}
            onLaunchJudgeDemo={() => setIsJudgeDemoOpen(true)}
          />
        )}
      </main>

      {/* 4. 6-Step Presentation-Ready Judge Demo Modal */}
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
        onTransitionToAdvancedLab={() => {
          setNavTab('loss');
        }}
      />

      {/* 5. Handbooks & Mathematical Proof Modals */}
      <MathGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <SingularProofModal
        isOpen={isSingularProofOpen}
        onClose={() => setIsSingularProofOpen(false)}
      />
    </div>
  );
}
