import React from 'react';
import { Sparkles, Brain, Bot, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

interface LiveNarratorBannerProps {
  epoch: number;
  loss: number;
  accuracy: number;
  isTraining: boolean;
  intuitionMode: boolean;
  lastChangedParam?: string;
  isSingularActive?: boolean;
  isDeadReLUActive?: boolean;
  className?: string;
}

export const LiveNarratorBanner: React.FC<LiveNarratorBannerProps> = ({
  epoch,
  loss,
  accuracy,
  isTraining,
  intuitionMode,
  lastChangedParam = '',
  isSingularActive = false,
  isDeadReLUActive = false,
  className = '',
}) => {
  // Generate dynamic plain-English or mathematical narration
  const getNarrative = (): { text: string; icon: React.ReactNode; badge: string; color: string } => {
    // 1. Failure Modes
    if (isSingularActive) {
      return {
        badge: intuitionMode ? 'Space Squashed Flat' : 'det(W₁) ≈ 0 (Singular)',
        text: intuitionMode
          ? 'Space is squashed into a 1D line! Both grid directions collapsed onto one axis, so the AI lost a dimension and can never separate the dots.'
          : 'Rank collapse: dim(ker(W₁)) = 1 collapses ℝ² onto a 1D subspace. Classification accuracy is bounded at 50%.',
        icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
        color: 'border-rose-500/50 bg-rose-950/70 text-rose-100',
      };
    }

    if (isDeadReLUActive) {
      return {
        badge: intuitionMode ? 'Brain Freeze' : 'Dead ReLU (∇ = 0)',
        text: intuitionMode
          ? 'Brain freeze! All points got pushed into the flat negative zone where the slope is 0. With no downhill compass nudge, learning has frozen.'
          : 'Gradient starvation: preactivations z ≤ 0 cause σ\'(z) = 0. Zero multipliers propagate through the chain rule, permanently stalling updates.',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        color: 'border-amber-500/50 bg-amber-950/70 text-amber-100',
      };
    }

    // 2. Convergence (100% or near 100% accuracy)
    if (accuracy >= 0.98) {
      return {
        badge: intuitionMode ? 'Fence Perfect!' : '100% Empirical Separation',
        text: intuitionMode
          ? `🎉 Solved in ${epoch} steps! The AI stretched and folded the grid so the fence cleanly separates every single point!`
          : `Optimal convergence reached at epoch ${epoch}: ℒ = ${loss.toFixed(4)}, Accuracy = ${(accuracy * 100).toFixed(1)}%. Convex separation achieved.`,
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        color: 'border-emerald-500/50 bg-emerald-950/60 text-emerald-100',
      };
    }

    // 3. Actively Training
    if (isTraining || epoch > 0) {
      return {
        badge: intuitionMode ? `Training Round ${epoch}` : `Optimization Epoch ${epoch}`,
        text: intuitionMode
          ? `Epoch ${epoch}: The AI measured a Mistake Score of ${loss.toFixed(4)}, so its Downhill Compass is twisting the grid and pushing the fence toward the gap! (${(accuracy * 100).toFixed(0)}% accurate)`
          : `Epoch ${epoch}: Computing analytical ∇_W ℒ factor products via backprop. BCE Loss = ${loss.toFixed(4)}, Accuracy = ${(accuracy * 100).toFixed(1)}%. Adam adjusting weights.`,
        icon: <Sparkles className="w-4 h-4 text-[#53D4F4] animate-pulse shrink-0" />,
        color: 'border-[#53D4F4]/50 bg-[#111A2A]/90 text-[#F4F7FB]',
      };
    }

    // 4. Manually Scrubbed Slider
    if (lastChangedParam && lastChangedParam.includes('Matrix') || lastChangedParam.includes('Bias')) {
      return {
        badge: intuitionMode ? 'Rubber Sheet Stretched' : 'Linear Affine Transformation',
        text: intuitionMode
          ? `You are manually stretching/rotating the coordinate sheet! Watch how changing ${lastChangedParam} physically warps the grid and moves the fence.`
          : `Active parameter manipulation: ${lastChangedParam}. Evaluating resulting decision manifold and preactivation coordinate projections.`,
        icon: <Brain className="w-4 h-4 text-[#F7C76B] shrink-0" />,
        color: 'border-[#F7C76B]/50 bg-[#111A2A]/90 text-[#F4F7FB]',
      };
    }

    // 5. Default Untrained State (Epoch 0)
    return {
      badge: intuitionMode ? 'Blind Guessing (Untrained)' : 'Initial Random State (Epoch 0)',
      text: intuitionMode
        ? `Right now, the AI is guessing blindly. Its dividing fence is in the wrong spot, getting only ${(accuracy * 100).toFixed(0)}% right. Click "Train AI" to watch it learn!`
        : `Untrained network parameters: Initial loss ℒ = ${loss.toFixed(4)}, accuracy = ${(accuracy * 100).toFixed(1)}%. Ready for gradient backpropagation.`,
      icon: <Bot className="w-4 h-4 text-[#9DAFC3] shrink-0" />,
      color: 'border-[#29374B] bg-[#111A2A]/90 text-[#9DAFC3]',
    };
  };

  const narrative = getNarrative();

  return (
    <div
      className={`pointer-events-auto rounded-xl border backdrop-blur-md px-4 py-2.5 shadow-xl transition-all duration-300 flex items-center justify-between gap-3 text-xs ${narrative.color} ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 rounded-lg bg-black/30 border border-white/10 shrink-0">
          {narrative.icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10">
              {narrative.badge}
            </span>
            <span className="text-[10px] font-mono text-[#53D4F4] opacity-80 hidden sm:inline">
              {intuitionMode ? '💡 AI Live Thought Bubble' : '∑ Telemetry Stream'}
            </span>
          </div>

          <p className="text-xs font-sans text-[#F4F7FB] leading-snug truncate sm:whitespace-normal">
            {narrative.text}
          </p>
        </div>
      </div>
    </div>
  );
};
