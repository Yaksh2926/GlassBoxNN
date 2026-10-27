/**
 * MathX Theme 5 Metaphor Dictionary
 * Maps abstract deep learning linear algebra and calculus to everyday physical metaphors.
 */

export interface TermDefinition {
  intuitionTitle: string;
  mathTitle: string;
  intuitionSub: string;
  mathSub: string;
  description: string;
}

export const METAPHOR_DICTIONARY: Record<string, TermDefinition> = {
  dataPoints: {
    intuitionTitle: 'Two Teams on a Field',
    mathTitle: 'Data Points (ℝ² Manifold)',
    intuitionSub: 'Cyan Circles vs. Pink Diamonds',
    mathSub: 'Binary Target Labels y ∈ {0, 1}',
    description: 'Two separate groups that the AI is trying to isolate from each other on a 2D playing surface.',
  },
  decisionBoundary: {
    intuitionTitle: 'The Dividing Fence',
    mathTitle: 'Decision Boundary Hyperplane',
    intuitionSub: 'Glowing separating line on the field',
    mathSub: 'Level curve {x ∈ ℝ² : σ(w₂ᵀ a₁ + b₂) = 0.5}',
    description: 'The physical boundary drawn by the AI. Everything on one side is predicted Cyan, the other Pink.',
  },
  weightsAndBiases: {
    intuitionTitle: 'Grid Stretch & Shift Knobs',
    mathTitle: 'Affine Parameters W₁x + b₁',
    intuitionSub: 'Knobs that twist and slide coordinate space',
    mathSub: 'Linear Transformation Matrix W₁ ∈ ℝ²ˣ² & Bias b₁ ∈ ℝ²',
    description: 'Adjusting weights stretches and rotates the coordinate sheet; adjusting bias slides it in space.',
  },
  reluActivation: {
    intuitionTitle: 'Origami Paper Fold',
    mathTitle: 'Non-Linear Activation (ReLU)',
    intuitionSub: 'Creases coordinates along fold lines',
    mathSub: 'Piecewise Linear Map a₁ = max(0, z₁)',
    description: 'A straight cut cannot separate criss-crossed XOR dots. But folding the paper like origami allows one cut to separate them.',
  },
  bceLoss: {
    intuitionTitle: 'Mistake Score (Lower = Better)',
    mathTitle: 'Binary Cross-Entropy Loss ℒ',
    intuitionSub: 'Penalty for misclassified points',
    mathSub: 'ℒ = -1/N ∑ [y ln(ŷ) + (1-y) ln(1-ŷ)]',
    description: 'Measures how far off the AI predictions are. When the fence is perfect, mistake score drops to near zero.',
  },
  gradientsBackprop: {
    intuitionTitle: 'Downhill Compass Nudges',
    mathTitle: 'Gradients & Backpropagation',
    intuitionSub: 'Nudges telling each knob which way is downhill',
    mathSub: 'Exact Chain Rule ∂ℒ/∂W = (ŷ - y) · w₂ · σ\'(z₁) · xᵀ',
    description: 'Calculus derivatives that tell each parameter how to turn so the mistake score rolls down into the valley.',
  },
};

/**
 * Returns formatted title and subtitle based on whether Beginner Intuition Mode is active.
 */
export function getTermText(key: keyof typeof METAPHOR_DICTIONARY, intuitionMode: boolean): { title: string; subtitle: string } {
  const item = METAPHOR_DICTIONARY[key];
  if (!item) return { title: key, subtitle: '' };

  if (intuitionMode) {
    return {
      title: item.intuitionTitle,
      subtitle: item.intuitionSub,
    };
  }

  return {
    title: item.mathTitle,
    subtitle: item.mathSub,
  };
}
