import React, { useState, useEffect, useRef } from 'react';
import {
  Point2D,
  NetworkWeights,
  OptimizerConfig,
  ActivationType,
  Matrix2x2,
  Vector2D,
} from './math/types';
import { Datasets, DatasetPreset } from './math/datasets';
import { Navbar } from './components/layout/Navbar';
import { StoryModeBar, STORY_STEPS, StoryStep } from './components/story/StoryModeBar';
import { PersonaExplanation } from './components/story/PersonaExplanation';
import { DatasetPanel } from './components/controls/DatasetPanel';
import { TrainingPanel } from './components/controls/TrainingPanel';
import { FailureModesPanel } from './components/controls/FailureModesPanel';
import { MatrixEditor } from './components/common/MatrixEditor';
import { ManifoldWarper2D } from './components/warper/ManifoldWarper2D';
import { SpectralHUD } from './components/warper/SpectralHUD';
import { SVDInspector } from './components/warper/SVDInspector';
import { LossLandscapeView } from './components/loss/LossLandscapeView';
import { BackpropGraph } from './components/graph/BackpropGraph';
import { MathGuideModal } from './components/common/MathGuideModal';
import { SingularProofModal } from './components/common/SingularProofModal';
import { LinearAlgebra } from './math/linearAlgebra';

export function App() {
  // Navigation tab: 'warper' | 'loss' | 'graph'
  const [activeTab, setActiveTab] = useState<'warper' | 'loss' | 'graph'>('warper');

  // Math Guide modal & Singular Proof modal
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSingularProofOpen, setIsSingularProofOpen] = useState<boolean>(false);
  const collapseAnimRef = useRef<number | null>(null);

  // Dual persona: 'beginner' | 'judge'
  const [personaMode, setPersonaMode] = useState<'beginner' | 'judge'>('beginner');

  // Story mode pitch tour step ID: 1 to 5
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

  // 2D Manifold Warper & SVD state
  const [tau, setTau] = useState<number>(0.0);
  const [tauSVD, setTauSVD] = useState<number>(0.0);
  const [warperMode, setWarperMode] = useState<'homotopy' | 'svd'>('homotopy');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Handle Preset selection
  const handleSelectPreset = (preset: DatasetPreset) => {
    setCurrentPreset(preset);
    setDataset(Datasets.getPreset(preset));
  };

  // Add custom point
  const handleAddPoint = (pt: Point2D) => {
    setDataset(prev => [...prev, pt]);
  };

  // Undo point
  const handleUndoPoint = () => {
    setDataset(prev => prev.slice(0, -1));
  };

  // Clear dataset
  const handleClearDataset = () => {
    setDataset([]);
  };

  // Reset dataset
  const handleResetDataset = () => {
    setDataset(Datasets.getPreset(currentPreset));
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
    setActiveTab('warper');
    setWarperMode('homotopy');
    setCurrentStoryStepId(1);
  };

  // Handle Story Tour step selection
  const handleSelectStoryStep = (step: StoryStep) => {
    setCurrentStoryStepId(step.id);
    setCurrentPreset(step.presetDataset);
    setDataset(Datasets.getPreset(step.presetDataset));
    setWeights(step.presetWeights);
    setTau(step.tau);
    setActiveTab(step.viewTab);
    setActiveClass(step.activeClass);
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (collapseAnimRef.current !== null) {
        cancelAnimationFrame(collapseAnimRef.current);
      }
    };
  }, []);

  // Preset 1: 'Trigger Singular Matrix (det(W1) = 0)'
  // Sets W1 rows to be linearly dependent (e.g. [[1.5, -1.5], [-1.0, 1.0]]),
  // animates 2D grid collapsing flat onto a 1D line, and displays proof popup
  const handleTriggerSingularMatrix = () => {
    // 1. Set linearly dependent rows (Row 2 = -2/3 * Row 1)
    setWeights(w => ({
      ...w,
      W1: [
        [1.5, -1.5],
        [-1.0, 1.0],
      ],
      b1: [0.0, 0.0],
    }));

    // 2. Switch to 2D Manifold Warper in homotopy mode
    setActiveTab('warper');
    setWarperMode('homotopy');
    setTau(0.0);

    // 3. Cancel any running animation
    if (collapseAnimRef.current !== null) {
      cancelAnimationFrame(collapseAnimRef.current);
    }

    // 4. Smoothly animate tau from 0 to 1.0 (over 1600ms)
    const startTimestamp = performance.now();
    const duration = 1600;

    const animateCollapse = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth easeInOutCubic curve
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setTau(ease * 1.0);

      if (progress < 1.0) {
        collapseAnimRef.current = requestAnimationFrame(animateCollapse);
      } else {
        // Space collapsed to 1D line! Automatically display mathematical proof popup
        setTimeout(() => {
          setIsSingularProofOpen(true);
        }, 300);
      }
    };

    collapseAnimRef.current = requestAnimationFrame(animateCollapse);
  };

  // Preset 2: 'Trigger Vanishing Gradient / Dead ReLU'
  // Sets biases to negative values with ReLU so all data points fall in negative quadrant where ReLU'(z) = 0
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

    // Switch view to Chain Rule panel to show zeroed partial derivatives
    setActiveTab('graph');
  };

  const det = LinearAlgebra.det(weights.W1);
  const isSingularActive = Math.abs(det) < 1e-4;
  const isDeadReLUActive =
    weights.activation === 'relu' && weights.b1[0] < -2 && weights.b1[1] < -2;

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyber-cyan selection:text-black">
      {/* 1. Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        onResetAll={handleResetAll}
      />

      {/* 2. Top Banner: 5-Step Hackathon Pitch Tour & Dual-Persona Explanation */}
      <div className="px-4 pt-3 pb-1 space-y-2 max-w-[1720px] mx-auto w-full">
        <StoryModeBar
          currentStepId={currentStoryStepId}
          onSelectStep={handleSelectStoryStep}
        />

        <PersonaExplanation
          mode={personaMode}
          onToggleMode={setPersonaMode}
          tau={tau}
          det={det}
          activation={weights.activation}
          datasetName={currentPreset}
        />
      </div>

      {/* 3. Main Cockpit Layout: 12-Column Responsive Scientific Dashboard */}
      <main className="flex-1 px-4 py-2 max-w-[1720px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: Controls, Dataset, & Matrix Editor (Cols 1-3) */}
        <aside className="lg:col-span-3 space-y-3">
          {/* Mathematical Failure Modes Panel (For Judges & Proof Defense) */}
          <FailureModesPanel
            onTriggerSingularMatrix={handleTriggerSingularMatrix}
            onTriggerDeadReLU={handleTriggerDeadReLU}
            onOpenSingularProof={() => setIsSingularProofOpen(true)}
            isSingularActive={isSingularActive}
            isDeadReLUActive={isDeadReLUActive}
          />

          {/* Dataset Playground Panel */}
          <DatasetPanel
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            dataset={dataset}
            activeClass={activeClass}
            onSetActiveClass={setActiveClass}
            onUndoPoint={handleUndoPoint}
            onClearDataset={handleClearDataset}
            onResetDataset={handleResetDataset}
          />

          {/* Real Neural Training Lab Panel */}
          <TrainingPanel
            weights={weights}
            onUpdateWeights={setWeights}
            dataset={dataset}
            optConfig={optConfig}
            onChangeOptConfig={setOptConfig}
            onResetNetwork={handleResetNetwork}
          />

          {/* Matrix & Bias Editor Cockpit */}
          <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 shadow-glass">
            <MatrixEditor
              W1={weights.W1}
              b1={weights.b1}
              onChangeW1={newW1 => setWeights(w => ({ ...w, W1: newW1 }))}
              onChangeB1={newB1 => setWeights(w => ({ ...w, b1: newB1 }))}
            />
          </div>
        </aside>

        {/* CENTER COLUMN: Observatory Visual Playground (Cols 4-8) */}
        <section className="lg:col-span-5 h-[760px] flex flex-col">
          {activeTab === 'warper' && (
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
            />
          )}

          {activeTab === 'loss' && (
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
            />
          )}

          {activeTab === 'graph' && (
            <BackpropGraph weights={weights} dataset={dataset} />
          )}
        </section>

        {/* RIGHT COLUMN: Mathematical HUDs & Inspectors (Cols 9-12) */}
        <aside className="lg:col-span-4 space-y-3">
          {/* Live Spectral HUD (Determinant, Eigenvalues, Condition Number) */}
          <SpectralHUD W1={weights.W1} />

          {/* SVD Step-by-Step Geometric Decomposer */}
          <SVDInspector
            W1={weights.W1}
            tauSVD={tauSVD}
            onChangeTauSVD={setTauSVD}
            warperMode={warperMode}
            onChangeWarperMode={setWarperMode}
          />

          {/* Quick Context View: Backprop Graph preview if on Warper, or Warper preview if on Loss */}
          {activeTab !== 'graph' && (
            <div className="hidden xl:block">
              <BackpropGraph weights={weights} dataset={dataset} />
            </div>
          )}
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E2D4A] py-3 px-4 bg-[#090D16] text-center text-xs font-mono text-slate-400 mt-auto">
        <div className="flex flex-wrap items-center justify-between max-w-[1720px] mx-auto gap-2">
          <span>GlassBox NN • MathX: A New Dimension of Mathematics • Infinity Society GTBIT</span>
          <span className="text-cyber-cyan font-bold">"Open the Black Box. See the Mathematics."</span>
          <span className="text-slate-400">100% Client-Side Pure TypeScript & WebGL</span>
        </div>
      </footer>

      {/* Educational Math Guide Modal */}
      <MathGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Singular Matrix Rank Collapse Proof Modal */}
      <SingularProofModal
        isOpen={isSingularProofOpen}
        onClose={() => setIsSingularProofOpen(false)}
      />
    </div>
  );
}
