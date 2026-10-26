import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  Layers,
  GitBranch,
  TrendingDown,
} from 'lucide-react';
import { Datasets } from '../../math/datasets';

interface LandingPageProps {
  onEnterLab: () => void;
  onExploreMath?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterLab }) => {
  // Mini interactive preview state
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
      const zx = previewW11 * x + 0.3 * y;
      const zy = -0.2 * x + previewW22 * y;
      const ix = (1 - previewTau) * x + previewTau * zx;
      const iy = (1 - previewTau) * y + previewTau * zy;
      return [cx + ix * scale, cy - iy * scale];
    };

    // Grid lines
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = '#182438';
    for (let g = -4; g <= 4; g += 0.5) {
      ctx.beginPath();
      for (let s = -4; s <= 4; s += 0.25) {
        const [sx, sy] = map(s, g);
        if (s === -4) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

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

  const det = previewW11 * previewW22 - 0.3 * -0.2;

  return (
    <div className="w-full min-h-screen bg-[#0B1020] text-[#F4F7FB] selection:bg-[#53D4F4] selection:text-black">
      {/* Top Editorial Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#29374B] bg-[#0B1020]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111A2A] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-[#F4F7FB]">
                GlassBox NN
              </span>
              <span className="text-[10px] font-mono text-[#9DAFC3] px-2 py-0.5 rounded bg-[#182438] border border-[#29374B]">
                MathX GTBIT
              </span>
            </div>
          </div>

          <button
            onClick={onEnterLab}
            className="flex items-center gap-2 text-xs font-semibold bg-[#53D4F4] text-[#0B1020] px-4 py-2 rounded-lg hover:bg-[#68ddfc] transition-all shadow-sm active:scale-95"
          >
            <span>Enter the Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Single Prominent CTA */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F7FB] leading-[1.1]">
              See the Math <br />
              <span className="text-[#53D4F4]">Behind AI.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#9DAFC3] leading-relaxed max-w-xl">
              An interactive mathematical observatory demystifying neural networks
              through real-time differential geometry, linear algebra, and multivariable calculus.
            </p>

            <div className="pt-2">
              <button
                onClick={onEnterLab}
                className="inline-flex items-center gap-2.5 text-sm font-semibold bg-[#53D4F4] text-[#0B1020] px-6 py-3.5 rounded-xl hover:bg-[#68ddfc] transition-all shadow-md active:scale-95"
              >
                <span>Enter the Lab Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Live Mathematical Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#29374B] bg-[#111A2A] p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#29374B]">
                <span className="text-xs font-mono text-[#9DAFC3]">
                  Live ℝ² Manifold Preview
                </span>
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
            </div>
          </div>
        </div>

        {/* Three Core Mathematical Pillars */}
        <section className="mt-20 pt-16 border-t border-[#29374B]/60">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-[#F4F7FB]">
              Three Mathematical Pillars
            </h2>
            <p className="text-xs text-[#9DAFC3]">
              Every layer, parameter, and derivative rendered as transparent geometry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Transformations */}
            <div className="rounded-xl border border-[#29374B] bg-[#111A2A] p-6 space-y-3 hover:border-[#53D4F4]/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#53D4F4]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#F4F7FB]">1. Transformations</h3>
              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Linear maps continuously shear, rotate, and scale coordinates. Inspect 4-stage SVD
                and watch non-linear activations fold space to solve XOR.
              </p>
            </div>

            {/* Pillar 2: Learning */}
            <div className="rounded-xl border border-[#29374B] bg-[#111A2A] p-6 space-y-3 hover:border-[#F078C5]/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#F078C5]">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#F4F7FB]">2. Learning</h3>
              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Deconstruct automatic differentiation through exact multivariable calculus.
                Inspect the chain rule product with live numerical factors and Dead ReLU detection.
              </p>
            </div>

            {/* Pillar 3: Optimization */}
            <div className="rounded-xl border border-[#29374B] bg-[#111A2A] p-6 space-y-3 hover:border-[#F7C76B]/50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#182438] border border-[#29374B] flex items-center justify-center text-[#F7C76B]">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#F4F7FB]">3. Optimization</h3>
              <p className="text-xs text-[#9DAFC3] leading-relaxed">
                Explore the true BCE loss surface in 3D WebGL and 2D contour maps.
                Calculate 2×2 Hessian curvature matrices and race SGD, Momentum, and Adam.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Subtle MathX Footer */}
      <footer className="border-t border-[#29374B] bg-[#0B1020] py-6 text-center text-xs text-[#9DAFC3]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
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
