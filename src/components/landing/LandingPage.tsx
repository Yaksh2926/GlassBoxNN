import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  BookOpen,
  Layers,
  Activity,
  TrendingDown,
  Sparkles,
  GitBranch,
  Sliders,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { Datasets } from '../../math/datasets';
import { LinearAlgebra } from '../../math/linearAlgebra';
import { Activations } from '../../math/activations';

interface LandingPageProps {
  onEnterLab: () => void;
  onExploreMath: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterLab,
  onExploreMath,
}) => {
  // Mini interactive preview state on landing page
  const [previewW11, setPreviewW11] = useState<number>(1.2);
  const [previewW22, setPreviewW22] = useState<number>(1.0);
  const [previewTau, setPreviewTau] = useState<number>(0.5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render compact real preview of mathematical transformation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 360;
    const height = 280;
    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.resetTransform();
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = '#0B1020';
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = 36; // pixels per unit

    // Map point with affine & fold
    const map = (x: number, y: number): [number, number] => {
      // Linear deformation
      const zx = previewW11 * x + 0.3 * y;
      const zy = -0.2 * x + previewW22 * y;
      // Homotopy interpolation
      const ix = (1 - previewTau) * x + previewTau * zx;
      const iy = (1 - previewTau) * y + previewTau * zy;
      return [cx + ix * scale, cy - iy * scale];
    };

    // Grid lines
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = '#182438';
    for (let g = -4; g <= 4; g += 0.5) {
      // Horizontal
      ctx.beginPath();
      for (let s = -4; s <= 4; s += 0.25) {
        const [sx, sy] = map(s, g);
        if (s === -4) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Vertical
      ctx.beginPath();
      for (let s = -4; s <= 4; s += 0.25) {
        const [sx, sy] = map(g, s);
        if (s === -4) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#29374B';
    ctx.beginPath();
    const [ax1, ay1] = map(-4, 0);
    const [ax2, ay2] = map(4, 0);
    ctx.moveTo(ax1, ay1);
    ctx.lineTo(ax2, ay2);
    const [ay_1, ay_2] = map(0, -4);
    const [ay_3, ay_4] = map(0, 4);
    ctx.moveTo(ay_1, ay_2);
    ctx.lineTo(ay_3, ay_4);
    ctx.stroke();

    // Basis vectors î and ĵ
    const [oX, oY] = map(0, 0);
    const [iX, iY] = map(1, 0);
    const [jX, jY] = map(0, 1);

    // Vector î (Cyan)
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#53D4F4';
    ctx.beginPath();
    ctx.moveTo(oX, oY);
    ctx.lineTo(iX, iY);
    ctx.stroke();

    // Vector ĵ (Amber)
    ctx.strokeStyle = '#F7C76B';
    ctx.beginPath();
    ctx.moveTo(oX, oY);
    ctx.lineTo(jX, jY);
    ctx.stroke();

    // Real XOR Data Points
    const xorPoints = Datasets.getPreset('xor');
    for (const pt of xorPoints) {
      const [px, py] = map(pt.x, pt.y);
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 0 ? '#53D4F4' : '#F078C5';
      ctx.fill();
      ctx.strokeStyle = '#F4F7FB';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [previewW11, previewW22, previewTau]);

  const det = previewW11 * previewW22 - (0.3 * -0.2);

  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-[#F4F7FB] selection:bg-[#53D4F4] selection:text-black overflow-y-auto">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#29374B] bg-[#0B1020]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111A2A] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#F4F7FB]">
                GlassBox NN
              </span>
              <span className="ml-2 text-[10px] font-mono text-[#9DAFC3] px-2 py-0.5 rounded bg-[#182438] border border-[#29374B]">
                MathX GTBIT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onExploreMath}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#9DAFC3] hover:text-[#F4F7FB] transition-colors py-1.5 px-3 rounded-md hover:bg-[#182438]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore the Math</span>
            </button>
            <button
              onClick={onEnterLab}
              className="flex items-center gap-2 text-xs font-semibold bg-[#53D4F4] text-[#0B1020] px-4 py-2 rounded-lg hover:bg-[#68ddfc] transition-all shadow-sm active:scale-95"
            >
              <span>Enter the Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#111A2A] border border-[#29374B] text-[#9DAFC3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#53D4F4] animate-pulse" />
              <span>Mathematical Observatory for Neural Networks</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F7FB] leading-[1.1]">
              See the Math <br />
              <span className="text-[#53D4F4]">Behind AI.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#9DAFC3] leading-relaxed max-w-xl">
              An interactive mathematical observatory demystifying neural networks
              through real-time differential geometry, linear algebra, and multivariable calculus.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterLab}
                className="flex items-center gap-2.5 text-sm font-semibold bg-[#53D4F4] text-[#0B1020] px-6 py-3 rounded-xl hover:bg-[#68ddfc] transition-all shadow-md active:scale-95"
              >
                <span>Enter the Lab Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreMath}
                className="flex items-center gap-2 text-sm font-medium text-[#F4F7FB] bg-[#111A2A] border border-[#29374B] hover:border-[#53D4F4]/50 px-5 py-3 rounded-xl hover:bg-[#182438] transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#53D4F4]" />
                <span>Mathematical Handbook</span>
              </button>
            </div>

            {/* Quick Proof Points */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#29374B]/70 max-w-lg">
              <div>
                <span className="block text-xl font-bold font-mono text-[#F4F7FB]">60 FPS</span>
                <span className="text-xs text-[#9DAFC3]">Continuous Homotopy</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-[#53D4F4]">100% Exact</span>
                <span className="text-xs text-[#9DAFC3]">Zero Blackbox Autodiff</span>
              </div>
              <div>
                <span className="block text-xl font-bold font-mono text-[#F078C5]">Cover's Thm</span>
                <span className="text-xs text-[#9DAFC3]">Topological Space Fold</span>
              </div>
            </div>
          </div>

          {/* Right Column: Compact Live Mathematical Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#29374B] bg-[#111A2A] p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#29374B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F7C76B]/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
                  <span className="text-xs font-mono text-[#9DAFC3] ml-2">
                    Live R² Manifold Preview
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#53D4F4] bg-[#182438] px-2 py-0.5 rounded border border-[#29374B]">
                  det(W₁) = {det.toFixed(2)}
                </span>
              </div>

              {/* The Live Canvas Preview */}
              <div className="rounded-xl overflow-hidden border border-[#29374B] bg-[#0B1020] flex items-center justify-center relative">
                <canvas ref={canvasRef} className="block" />
                <div className="absolute top-2 left-2 pointer-events-none text-[10px] font-mono text-[#9DAFC3] bg-[#111A2A]/90 px-2 py-1 rounded border border-[#29374B]">
                  <span className="text-[#53D4F4]">● Class 0</span>
                  <span className="mx-1.5">|</span>
                  <span className="text-[#F078C5]">● Class 1</span>
                </div>
              </div>

              {/* Interactive Controls for Landing Preview */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DAFC3]">Matrix Diagonal w₁₁</span>
                  <span className="font-mono text-[#F4F7FB]">{previewW11.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.05"
                  value={previewW11}
                  onChange={e => setPreviewW11(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#182438] rounded-lg appearance-none cursor-pointer accent-[#53D4F4]"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9DAFC3]">Homotopy Progress (τ)</span>
                  <span className="font-mono text-[#F4F7FB]">{previewTau.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={previewTau}
                  onChange={e => setPreviewTau(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#182438] rounded-lg appearance-none cursor-pointer accent-[#F7C76B]"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-[#29374B] flex items-center justify-between">
                <span className="text-xs text-[#9DAFC3]">Try the full interactive lab:</span>
                <button
                  onClick={onEnterLab}
                  className="text-xs font-semibold text-[#53D4F4] hover:underline flex items-center gap-1"
                >
                  <span>Launch Workspace</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <section className="mt-28">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7FB]">
              Three Pillars of Geometric Deep Learning
            </h2>
            <p className="text-sm text-[#9DAFC3]">
              Every layer, parameter, and derivative is rendered as transparent mathematical morphology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Transformations */}
            <div className="rounded-xl border border-[#29374B] bg-[#111A2A] p-6 space-y-4 hover:border-[#53D4F4]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F7FB]">1. Transformations</h3>
              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Observe linear maps $z_1 = W_1 x + b_1$ continuously shearing, rotating, and scaling the Cartesian grid.
                Inspect the 4-stage Singular Value Decomposition ($W_1 = U \Sigma V^T$) and watch non-linear activations
                crease the space to solve non-linearly separable problems like XOR.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#53D4F4]">
                <span>SVD • Determinants • Cover's Theorem</span>
              </div>
            </div>

            {/* Feature 2: Learning */}
            <div className="rounded-xl border border-[#29374B] bg-[#111A2A] p-6 space-y-4 hover:border-[#F078C5]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#F078C5]">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F7FB]">2. Learning</h3>
              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Deconstruct automatic differentiation through exact multivariable calculus.
                Hover over weight connections on the hardware silicon graph to view the symbolic chain rule product
                with live numerical factors, and observe how Dead ReLUs extinguish gradient flow.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#F078C5]">
                <span>Analytical Chain Rule • Gradient Check</span>
              </div>
            </div>

            {/* Feature 3: Optimization */}
            <div className="rounded-xl border border-[#29374B] bg-[#111A2A] p-6 space-y-4 hover:border-[#F7C76B]/50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#F7C76B]">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F7FB]">3. Optimization</h3>
              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Explore the true Binary Cross-Entropy loss surface in 3D WebGL and 2D contour maps.
                Calculate 2×2 Hessian curvature matrices ∇²L and race Vanilla SGD,
                Polyak's Heavy Ball Momentum, and Adam across ill-conditioned parameter ravines.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#F7C76B]">
                <span>Hessian Curvature • 3-Optimizer Race</span>
              </div>
            </div>
          </div>
        </section>

        {/* Why Visual Mathematics Matters Section */}
        <section className="mt-24 rounded-2xl border border-[#29374B] bg-[#111A2A] p-8 lg:p-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#53D4F4]">
              Educational Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7FB]">
              Why Visual Mathematical Exploration Matters
            </h2>
            <p className="text-sm text-[#9DAFC3] leading-relaxed">
              In conventional deep learning education, neural networks are taught either as abstract syntax
              or as mysterious "black boxes" of millions of opaque numbers. Students miss the foundational insight:
              <strong> a neural network is simply a sequence of coordinate transformations that un-tangles complex geometry.</strong>
            </p>
            <p className="text-sm text-[#9DAFC3] leading-relaxed">
              By constraining our domain to two-dimensional Cartesian space, GlassBox NN reveals the physical reality
              of matrix eigenvalues, rank collapse via the Rank-Nullity Theorem, and gradient extinction without
              abstract approximations.
            </p>
            <div className="pt-4">
              <button
                onClick={onEnterLab}
                className="inline-flex items-center gap-2 text-sm font-semibold bg-[#53D4F4] text-[#0B1020] px-5 py-2.5 rounded-lg hover:bg-[#68ddfc] transition-all"
              >
                <span>Launch the Observatory</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle MathX Footer */}
      <footer className="border-t border-[#29374B] bg-[#0B1020] py-8 text-center text-xs text-[#9DAFC3]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F4F7FB]">GlassBox NN</span>
            <span>—</span>
            <span>MathX: A New Dimension of Mathematics</span>
          </div>
          <div>
            <span>Organized by </span>
            <strong className="text-[#F4F7FB]">Infinity Society</strong>
            <span>, Guru Tegh Bahadur Institute of Technology (GTBIT)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
