import React from 'react';
import {
  BookOpen,
  EyeOff,
  Brain,
  Layers,
  ArrowRight,
  Sparkles,
  Mountain,
  Compass,
  Play,
  Monitor,
  MousePointer,
  GraduationCap,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

interface BlackBoxStoryViewProps {
  onEnterPlayground: () => void;
  onEnter3DLoss: () => void;
  onLaunchJudgeDemo: () => void;
}

export const BlackBoxStoryView: React.FC<BlackBoxStoryViewProps> = ({
  onEnterPlayground,
  onEnter3DLoss,
  onLaunchJudgeDemo,
}) => {
  return (
    <div className="w-full min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-300">
      {/* ================= SLIDE 1: THE BLACK BOX PROBLEM ================= */}
      <section className="space-y-6">
        {/* Slide Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#262636] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-[#FF5E7E] rounded-full inline-block" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#FF5E7E]">
                MathX Ideathon • Theme 5
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              The Black Box <span className="text-[#FF5E7E]">Problem</span>
            </h1>
            <p className="text-sm md:text-base text-[#9E9EAF] mt-2">
              Most students use neural networks before they <strong className="text-white">truly understand them</strong>.
            </p>
          </div>

          <div className="font-mono text-xs text-[#9E9EAF] bg-[#161622] p-3 rounded-xl border border-[#262636] space-y-1">
            <div className="text-[#FF5E7E]">z^(l) = W^(l) a^(l-1) + b^(l)</div>
            <div className="text-white">a^(l) = ReLU(z^(l))</div>
          </div>
        </div>

        {/* The Black Box vs The Glass Box 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: THE BLACK BOX */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#14141E] border border-[#262636] space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E]" />
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  The <span className="text-[#FF5E7E]">Black Box</span>
                </h2>
              </div>
              <p className="text-sm text-[#9E9EAF]">
                Inputs go in. Predictions come out. The math <strong className="text-[#FF5E7E]">stays hidden</strong>.
              </p>
            </div>

            {/* Black Box Diagram */}
            <div className="py-6 flex items-center justify-center">
              <div className="flex items-center gap-4 md:gap-6 font-mono text-xs">
                {/* Inputs */}
                <div className="space-y-2 text-[#9E9EAF] text-right">
                  <div>Input x₁ ➔</div>
                  <div>Input x₂ ➔</div>
                  <div>Input x₃ ➔</div>
                  <div className="text-center font-bold">⋮</div>
                </div>

                {/* The Opaque Black Cube */}
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-br from-[#1A1A26] to-[#0A0A0F] border-2 border-[#333346] shadow-2xl flex items-center justify-center group hover:border-[#FF5E7E]/50 transition-all">
                  <div className="absolute top-2 right-3 text-[10px] text-[#9E9EAF] font-mono italic">
                    ŷ = f(x; θ)
                  </div>
                  <span className="text-5xl md:text-6xl font-black text-[#666680] group-hover:text-white transition-colors">
                    ?
                  </span>
                </div>

                {/* Outputs */}
                <div className="space-y-2 text-[#9E9EAF]">
                  <div>➔ Prediction ŷ₁</div>
                  <div>➔ Prediction ŷ₂</div>
                  <div>➔ Prediction ŷ₃</div>
                  <div className="text-center font-bold">⋮</div>
                </div>
              </div>
            </div>

            {/* Why It's a Problem */}
            <div className="space-y-3 pt-4 border-t border-[#262636]">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Why It's a <span className="text-[#FF5E7E]">Problem</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#262636] space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-xs text-white block">Abstract formulas</strong>
                  <p className="text-[10px] text-[#9E9EAF] leading-tight">
                    The math feels disconnected from what actually happens.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#262636] space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
                    <EyeOff className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-xs text-white block">Invisible computation</strong>
                  <p className="text-[10px] text-[#9E9EAF] leading-tight">
                    What happens inside the model is treated as a mystery.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0E0E16] border border-[#262636] space-y-1">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-xs text-white block">Weak intuition</strong>
                  <p className="text-[10px] text-[#9E9EAF] leading-tight">
                    Hard to build a real physical sense of how learning works.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: THE GLASS BOX */}
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#161626] to-[#12121E] border border-[#FF5E7E]/40 shadow-[0_0_35px_rgba(255,94,126,0.12)] space-y-6 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#53D4F4]" />
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  The <span className="text-[#FF5E7E]">Glass Box</span>
                </h2>
              </div>
              <p className="text-sm text-[#9E9EAF]">
                See the layers. See the transformations. <strong className="text-white">Understand how learning works</strong>.
              </p>
            </div>

            {/* Glass Box Diagram with Glowing Layers */}
            <div className="py-6 flex items-center justify-center">
              <div className="flex items-center gap-4 md:gap-6 font-mono text-xs">
                {/* Inputs */}
                <div className="space-y-3 text-[#9E9EAF] text-right">
                  <div>x₁ ➔</div>
                  <div>x₂ ➔</div>
                  <div>x₃ ➔</div>
                  <div className="text-center font-bold">⋮</div>
                </div>

                {/* The Transparent Glowing Glass Cube */}
                <div className="relative w-44 h-44 md:w-56 md:h-48 rounded-2xl bg-[#0C0C16]/80 backdrop-blur-xl border-2 border-[#FF5E7E]/60 shadow-[0_0_30px_rgba(255,94,126,0.25)] p-3 flex items-center justify-between">
                  {/* Layer 1: Input Layer (3 white dots) */}
                  <div className="flex flex-col items-center justify-around h-full">
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    <span className="text-[8px] text-[#9E9EAF] mt-1 uppercase">Input (3)</span>
                  </div>

                  {/* Synapse Lines SVG */}
                  <svg className="w-16 h-28 stroke-[#FF5E7E]/50 stroke-1 fill-none">
                    <line x1="0" y1="15" x2="64" y2="10" />
                    <line x1="0" y1="15" x2="64" y2="40" />
                    <line x1="0" y1="55" x2="64" y2="40" />
                    <line x1="0" y1="55" x2="64" y2="70" />
                    <line x1="0" y1="95" x2="64" y2="70" />
                    <line x1="0" y1="95" x2="64" y2="100" />
                  </svg>

                  {/* Layer 2: Hidden Layer (4 glowing coral nodes) */}
                  <div className="flex flex-col items-center justify-between h-full py-1">
                    <div className="w-4 h-4 rounded-full bg-[#FF5E7E] shadow-[0_0_10px_#FF5E7E]" />
                    <div className="w-4 h-4 rounded-full bg-[#FF5E7E] shadow-[0_0_10px_#FF5E7E]" />
                    <div className="w-4 h-4 rounded-full bg-[#FF5E7E] shadow-[0_0_10px_#FF5E7E]" />
                    <div className="w-4 h-4 rounded-full bg-[#FF5E7E] shadow-[0_0_10px_#FF5E7E]" />
                    <span className="text-[8px] text-[#FF5E7E] uppercase font-bold">Hidden (4)</span>
                  </div>

                  {/* Synapse Lines SVG */}
                  <svg className="w-14 h-24 stroke-[#FF5E7E]/50 stroke-1 fill-none">
                    <line x1="0" y1="10" x2="56" y2="30" />
                    <line x1="0" y1="40" x2="56" y2="30" />
                    <line x1="0" y1="70" x2="56" y2="65" />
                    <line x1="0" y1="100" x2="56" y2="65" />
                  </svg>

                  {/* Layer 3: Output Layer (2 glowing pink nodes) */}
                  <div className="flex flex-col items-center justify-around h-full py-3">
                    <div className="w-4 h-4 rounded-full bg-[#FF4767] shadow-[0_0_12px_#FF4767]" />
                    <div className="w-4 h-4 rounded-full bg-[#FF4767] shadow-[0_0_12px_#FF4767]" />
                    <span className="text-[8px] text-[#FF4767] uppercase font-bold">Output (2)</span>
                  </div>
                </div>

                {/* Outputs */}
                <div className="space-y-3 text-[#9E9EAF]">
                  <div>➔ ŷ₁</div>
                  <div>➔ ŷ₂</div>
                  <div className="text-center font-bold">⋮</div>
                </div>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="pt-4 border-t border-[#FF5E7E]/30 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-1 bg-[#FF5E7E] rounded-full inline-block" />
                <strong className="text-sm md:text-base text-white">
                  GlassBox NN turns hidden computation into <span className="text-[#FF5E7E]">visible understanding</span>.
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SLIDE 3: WHY GLASSBOX NN MATTERS ================= */}
      <section className="space-y-8 pt-8 border-t border-[#262636]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-[#FF5E7E] rounded-full inline-block" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#FF5E7E]">
              Core Educational Philosophy
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Why GlassBox NN <span className="text-[#FF5E7E]">Matters</span>
          </h2>
          <p className="text-sm md:text-base text-[#9E9EAF] mt-2">
            From first intuition to advanced exploration, the math inside AI becomes{' '}
            <strong className="text-white">visible</strong>.
          </p>
        </div>

        {/* 2-Column Split: 3 Left Circular Badges + 4 Right Visual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 3 Circular Feature Badges (Matching Slide 3 Left Column) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#14141E] border border-[#262636] flex items-start gap-3.5 hover:border-[#FF5E7E]/40 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF5E7E]/15 border border-[#FF5E7E]/30 text-[#FF5E7E] flex-shrink-0 flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm text-white block">
                  Zero-installation <span className="text-[#FF5E7E]">and browser-based</span>
                </strong>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Start exploring instantly, no setup, no barriers.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141E] border border-[#262636] flex items-start gap-3.5 hover:border-[#FF5E7E]/40 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF5E7E]/15 border border-[#FF5E7E]/30 text-[#FF5E7E] flex-shrink-0 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm text-white block">
                  Beginner-friendly <span className="text-[#FF5E7E]">Guided Studio</span>
                </strong>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Build intuition step by step with interactive, hands-on learning.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#14141E] border border-[#262636] flex items-start gap-3.5 hover:border-[#FF5E7E]/40 transition-all">
              <div className="w-10 h-10 rounded-full bg-[#FF5E7E]/15 border border-[#FF5E7E]/30 text-[#FF5E7E] flex-shrink-0 flex items-center justify-center">
                <Mountain className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <strong className="text-sm text-white block">
                  Advanced Lab <span className="text-[#FF5E7E]">for deeper exploration</span>
                </strong>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Dive into the math, play with models, and uncover what's happening inside.
                </p>
              </div>
            </div>
          </div>

          {/* Right 4 Visual Pillar Cards (Matching Slide 3) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Guided Studio */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#262636] hover:border-[#FF5E7E]/50 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF5E7E]/15 text-[#FF5E7E] flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-sm text-white">Guided Studio</strong>
                </div>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Interactive lessons that turn complex concepts into <strong className="text-[#FF5E7E]">clear intuition</strong>.
                </p>
              </div>

              {/* Graphic Mockup */}
              <div className="h-28 rounded-xl bg-[#0C0C14] border border-[#262636] p-2 flex items-center justify-center relative overflow-hidden">
                <div className="w-full flex items-center justify-around">
                  <div className="space-y-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5E7E]" />
                  </div>
                  <div className="w-0.5 h-16 border-l-2 border-dashed border-[#FF5E7E]" />
                  <div className="space-y-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Geometry */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#262636] hover:border-[#53D4F4]/50 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#53D4F4]/15 text-[#53D4F4] flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-sm text-white">Geometry</strong>
                </div>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Visualize vectors, transformations, and the <strong className="text-[#53D4F4]">geometry of learning</strong>.
                </p>
              </div>

              {/* Graphic Mockup: 3D Coordinate Plane */}
              <div className="h-28 rounded-xl bg-[#0C0C14] border border-[#262636] p-2 flex items-center justify-center relative overflow-hidden">
                <svg className="w-32 h-24 stroke-[#53D4F4] stroke-1 fill-none">
                  <line x1="10" y1="80" x2="110" y2="80" stroke="#444455" />
                  <line x1="10" y1="80" x2="10" y2="10" stroke="#444455" />
                  <line x1="10" y1="80" x2="60" y2="30" stroke="#FF5E7E" strokeWidth="2" />
                  <polygon points="10,80 60,30 110,50 60,100" fill="rgba(255,94,126,0.15)" stroke="#FF5E7E" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Card 3: Loss 3D */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#262636] hover:border-[#F7C76B]/50 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F7C76B]/15 text-[#F7C76B] flex items-center justify-center">
                    <Mountain className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-sm text-white">Loss 3D</strong>
                </div>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Explore the loss landscape and watch optimization <strong className="text-[#F7C76B]">come to life</strong>.
                </p>
              </div>

              {/* Graphic Mockup: 3D Mistake Valley */}
              <div className="h-28 rounded-xl bg-[#0C0C14] border border-[#262636] p-2 flex items-center justify-center relative overflow-hidden">
                <svg className="w-32 h-20 stroke-[#FF5E7E]/80 stroke-1 fill-none">
                  <path d="M 10 30 Q 60 75 110 20" stroke="#FF5E7E" strokeWidth="2" />
                  <path d="M 20 40 Q 60 80 100 35" stroke="rgba(255,94,126,0.4)" />
                  <circle cx="60" cy="74" r="5" fill="#FF5E7E" className="animate-pulse" />
                </svg>
              </div>
            </div>

            {/* Card 4: Flow */}
            <div className="p-5 rounded-2xl bg-[#14141E] border border-[#262636] hover:border-[#8B5CF6]/50 transition-all space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <strong className="text-sm text-white">Flow</strong>
                </div>
                <p className="text-xs text-[#9E9EAF] leading-relaxed">
                  Trace activations and gradients through the <strong className="text-[#8B5CF6]">computational graph</strong>.
                </p>
              </div>

              {/* Graphic Mockup: Computational Graph */}
              <div className="h-28 rounded-xl bg-[#0C0C14] border border-[#262636] p-2 flex items-center justify-center relative overflow-hidden font-mono text-[10px]">
                <div className="flex items-center gap-2 text-white">
                  <span className="p-1 rounded bg-[#222232] border border-[#333346]">x₁, x₂</span>
                  <span className="text-[#FF5E7E]">➔</span>
                  <span className="p-1 rounded bg-[#FF5E7E]/20 border border-[#FF5E7E] text-[#FF5E7E]">a₁,₁</span>
                  <span className="text-[#FF5E7E]">➔</span>
                  <span className="p-1 rounded bg-[#53D4F4]/20 border border-[#53D4F4] text-[#53D4F4]">ŷ</span>
                  <span className="text-[#FF5E7E]">➔</span>
                  <span className="p-1 rounded bg-amber-500/20 border border-amber-400 text-amber-300">ℒ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Learning Outcomes Banner (Matching Slide 3) */}
        <div className="p-5 rounded-2xl bg-[#14141E] border border-[#262636] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-[#FF5E7E] rounded-full inline-block" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
              Key Learning Outcomes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto text-xs">
            <div className="flex items-center gap-2 text-[#9E9EAF]">
              <span className="text-base">👁️</span>
              <span>
                See <strong className="text-[#FF5E7E]">decision boundaries</strong> learn.
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#9E9EAF]">
              <span className="text-base">⚙️</span>
              <span>
                Understand <strong className="text-[#FF5E7E]">gradients</strong> and backprop.
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#9E9EAF]">
              <span className="text-base">🔗</span>
              <span>
                Connect <strong className="text-[#FF5E7E]">linear algebra</strong>, calculus, optimization.
              </span>
            </div>
          </div>
        </div>

        {/* Big Punchline Launch Banner (Matching Slide 3) */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#1A1A2A] via-[#241424] to-[#161622] border-2 border-[#FF5E7E]/50 shadow-[0_0_40px_rgba(255,94,126,0.18)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Don't just use AI. <span className="text-[#FF5E7E]">Understand it.</span>
            </h3>
            <p className="text-sm text-[#9E9EAF] max-w-xl">
              GlassBox NN turns black-box neural networks into a visible, interactive learning system.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onEnterPlayground}
              className="flex-1 md:flex-initial px-6 py-3.5 rounded-xl btn-coral text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,94,126,0.4)]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Interactive Playground</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchJudgeDemo}
              className="px-4 py-3.5 rounded-xl border border-[#262636] bg-[#161622] hover:border-[#FF5E7E]/50 text-white font-bold text-xs transition-all active:scale-95"
            >
              Judge Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

