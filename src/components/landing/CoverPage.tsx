import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  ArrowRight,
  Brain,
  Sparkles,
  Layers,
  Mountain,
  Compass,
  GraduationCap,
  Monitor,
  MousePointer,
  BarChart3,
  Target,
  BookOpen,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Datasets } from '../../math/datasets';
import { Point2D } from '../../math/types';

interface CoverPageProps {
  onEnterLab: () => void;
  onExplore3DLoss: () => void;
  onReadStory: () => void;
  onLaunchJudgeDemo: () => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  onEnterLab,
  onExplore3DLoss,
  onReadStory,
  onLaunchJudgeDemo,
}) => {
  // Mini interactive transformation preview on the cover
  const [tau, setTau] = useState<number>(0.5);
  const [w11, setW11] = useState<number>(1.2);
  const [w22, setW22] = useState<number>(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render mini coordinate fold preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = width / 7.5;

    ctx.fillStyle = '#0F0F17';
    ctx.fillRect(0, 0, width, height);

    // Map point with affine & fold
    const map = (x: number, y: number): [number, number] => {
      const zx = w11 * x + 0.3 * y;
      const zy = -0.2 * x + w22 * y;
      const ix = (1 - tau) * x + tau * zx;
      const iy = (1 - tau) * y + tau * zy;
      return [cx + ix * scale, cy - iy * scale];
    };

    // Draw subtle grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1E1E2C';
    for (let g = -3; g <= 3; g += 1) {
      ctx.beginPath();
      for (let s = -3; s <= 3; s += 0.2) {
        const [sx, sy] = map(s, g);
        if (s === -3) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let s = -3; s <= 3; s += 0.2) {
        const [sx, sy] = map(g, s);
        if (s === -3) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#323246';
    ctx.beginPath();
    const [ax1, ay1] = map(-3.2, 0);
    const [ax2, ay2] = map(3.2, 0);
    ctx.moveTo(ax1, ay1);
    ctx.lineTo(ax2, ay2);
    const [ay_1, ay_2] = map(0, -3.2);
    const [ay_3, ay_4] = map(0, 3.2);
    ctx.moveTo(ay_1, ay_2);
    ctx.lineTo(ay_3, ay_4);
    ctx.stroke();

    // Decision Boundary dashed line
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    const [b1X, b1Y] = map(-3, 1.8);
    const [b2X, b2Y] = map(3, -1.8);
    ctx.moveTo(b1X, b1Y);
    ctx.lineTo(b2X, b2Y);
    ctx.stroke();
    ctx.restore();

    // Plot Points (Class 0: Silver, Class 1: Coral Diamond)
    const samplePts = Datasets.generateLinear(40, 13, 0.2);
    samplePts.forEach(pt => {
      const [sx, sy] = map(pt.x, pt.y);
      if (pt.label === 0) {
        ctx.fillStyle = '#8E8E9E';
        ctx.strokeStyle = '#BDBDD0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FF5E7E';
        ctx.strokeStyle = '#FFA0B3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const r = 5;
        ctx.moveTo(sx, sy - r);
        ctx.lineTo(sx + r, sy);
        ctx.lineTo(sx, sy + r);
        ctx.lineTo(sx - r, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }, [tau, w11, w22]);

  return (
    <div className="w-full min-h-screen bg-[#0C0C12] text-[#F4F7FB] pt-6 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-300">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 md:pt-12 text-center md:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* MathX Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181826] border border-[#262636] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#FF5E7E] animate-pulse" />
            <span className="text-white font-bold">MathX Ideathon</span>
            <span className="text-[#9E9EAF]">•</span>
            <span className="text-[#FF5E7E]">Theme 5: Explainable AI Through Math</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            The Black Box Problem, <br />
            Solved in <span className="text-[#FF5E7E]">Real-Time Math</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#9E9EAF] max-w-2xl leading-relaxed">
            An interactive, zero-installation observatory to explore, visualize, and truly
            understand neural networks—from <strong className="text-white">2D affine origami folds</strong> to{' '}
            <strong className="text-[#FF5E7E]">3D multivariable loss valleys</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2 justify-center md:justify-start">
            <button
              onClick={onEnterLab}
              className="px-8 py-4 rounded-2xl btn-coral text-sm md:text-base font-black flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,94,126,0.45)] group"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Enter the Lab</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExplore3DLoss}
              className="px-6 py-4 rounded-2xl border border-[#262636] bg-[#141422] hover:border-[#FF5E7E]/50 text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <Mountain className="w-4 h-4 text-[#FF5E7E]" />
              <span>3D Loss Valley</span>
            </button>

            <button
              onClick={onReadStory}
              className="px-5 py-4 rounded-2xl border border-[#262636] bg-[#141422] hover:border-[#53D4F4]/50 text-[#9E9EAF] hover:text-white text-sm font-semibold transition-all"
            >
              The Story
            </button>

            <button
              onClick={onLaunchJudgeDemo}
              className="px-5 py-4 rounded-2xl border border-[#262636] bg-[#141422] hover:border-[#FF5E7E]/50 text-white text-sm font-semibold transition-all"
            >
              Demo
            </button>
          </div>

          {/* Key Value Badges */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-[#9E9EAF]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF5E7E]" />
              <span>Zero Installation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF5E7E]" />
              <span>60fps WebGL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF5E7E]" />
              <span>Real Gradients</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#FF5E7E]" />
              <span>SVD & Homotopy</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Observatory Card on Cover */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl border border-[#262636] bg-[#141422] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-4">
            {/* Card Header Bar */}
            <div className="flex items-center justify-between border-b border-[#262636] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#FF5E7E] flex items-center justify-center text-white text-[10px] font-bold">
                  ∑
                </div>
                <span className="text-xs font-bold font-mono text-white">Live Neural Warper Preview</span>
              </div>
              <span className="text-[10px] font-mono text-[#FF5E7E] bg-[#FF5E7E]/10 px-2 py-0.5 rounded-full border border-[#FF5E7E]/30">
                Interactive
              </span>
            </div>

            {/* Canvas Viewport */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#262636] bg-[#0F0F17]">
              <canvas ref={canvasRef} width={380} height={380} className="w-full h-full block" />
              <div className="absolute bottom-2 left-2 right-2 px-3 py-1 rounded-xl bg-[#0C0C14]/90 backdrop-blur-md border border-[#262636] text-[10px] font-mono text-center text-[#9E9EAF]">
                Drag sliders below to fold space live!
              </div>
            </div>

            {/* Live Sliders */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#9E9EAF]">Origami Space Fold (τ):</span>
                <span className="text-[#FF5E7E] font-bold">{tau.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={tau}
                onChange={e => setTau(parseFloat(e.target.value))}
                className="w-full accent-[#FF5E7E] cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-[10px] text-[#9E9EAF]">
                    <span>W₁₁ Stretch:</span>
                    <span className="text-white">{w11.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={w11}
                    onChange={e => setW11(parseFloat(e.target.value))}
                    className="w-full accent-[#FF5E7E] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-[#9E9EAF]">
                    <span>W₂₂ Stretch:</span>
                    <span className="text-white">{w22.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={w22}
                    onChange={e => setW22(parseFloat(e.target.value))}
                    className="w-full accent-[#FF5E7E] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Launch CTA inside Card */}
            <button
              onClick={onEnterLab}
              className="w-full py-3 rounded-xl btn-coral text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Launch Full Interactive Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ================= 4 PILLARS SECTION (MATCHING SLIDE 3) ================= */}
      <section className="space-y-6 pt-10 border-t border-[#262636]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF5E7E] font-bold">
              Complete Educational System
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mt-1">
              Four Dimensions of <span className="text-[#FF5E7E]">Explainable AI</span>
            </h2>
          </div>
          <button
            onClick={onReadStory}
            className="text-xs font-bold text-[#FF5E7E] hover:underline flex items-center gap-1 self-start md:self-auto"
          >
            <span>Read Complete Slide Presentation</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Guided Studio */}
          <div
            onClick={onEnterLab}
            className="p-5 rounded-2xl bg-[#141422] border border-[#262636] hover:border-[#FF5E7E]/50 transition-all space-y-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <strong className="text-base text-white block">Guided Studio</strong>
            <p className="text-xs text-[#9E9EAF] leading-relaxed">
              Tactile, step-by-step lessons that turn abstract linear transformations into intuitive geometry.
            </p>
            <div className="text-[11px] font-bold text-[#FF5E7E] flex items-center gap-1 pt-1">
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2: 2D Geometry & Origami */}
          <div
            onClick={onEnterLab}
            className="p-5 rounded-2xl bg-[#141422] border border-[#262636] hover:border-[#53D4F4]/50 transition-all space-y-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#53D4F4]/15 text-[#53D4F4] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <strong className="text-base text-white block">Geometry & Folds</strong>
            <p className="text-xs text-[#9E9EAF] leading-relaxed">
              Watch neural layers stretch 2D coordinates and fold along ReLU origami crease lines to untangle XOR points.
            </p>
            <div className="text-[11px] font-bold text-[#53D4F4] flex items-center gap-1 pt-1">
              <span>Explore Folds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3: 3D Loss Valley */}
          <div
            onClick={onExplore3DLoss}
            className="p-5 rounded-2xl bg-[#141422] border border-[#262636] hover:border-[#F7C76B]/50 transition-all space-y-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F7C76B]/15 text-[#F7C76B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mountain className="w-5 h-5" />
            </div>
            <strong className="text-base text-white block">3D Loss Valley</strong>
            <p className="text-xs text-[#9E9EAF] leading-relaxed">
              Three.js 60fps loss landscape where Adam, Momentum, and SGD race downhill to find the global minimum.
            </p>
            <div className="text-[11px] font-bold text-[#F7C76B] flex items-center gap-1 pt-1">
              <span>Race Optimizers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 4: Backpropagation Flow */}
          <div
            onClick={onLaunchJudgeDemo}
            className="p-5 rounded-2xl bg-[#141422] border border-[#262636] hover:border-[#8B5CF6]/50 transition-all space-y-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <strong className="text-base text-white block">Calculus Flow</strong>
            <p className="text-xs text-[#9E9EAF] leading-relaxed">
              Trace activations forward and backpropagate analytical partial derivatives backward step by step.
            </p>
            <div className="text-[11px] font-bold text-[#8B5CF6] flex items-center gap-1 pt-1">
              <span>Judge Walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= BIG PUNCHLINE BANNER ================= */}
      <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#181826] via-[#241424] to-[#141422] border-2 border-[#FF5E7E]/50 shadow-[0_0_50px_rgba(255,94,126,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Don't just use AI. <span className="text-[#FF5E7E]">Understand it.</span>
          </h3>
          <p className="text-sm md:text-base text-[#9E9EAF]">
            GlassBox NN turns black-box neural networks into an intuitive, interactive observatory.
            Experience the math behind the intelligence.
          </p>
        </div>

        <button
          onClick={onEnterLab}
          className="px-8 py-4 rounded-2xl btn-coral text-base font-black flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,94,126,0.5)] flex-shrink-0"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Enter the Lab Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
};
