import {
  Point2D,
  Vector2D,
  NetworkWeights,
  LayerOutputs,
  Gradients,
  ChainRuleBreakdown,
  OptimizerConfig,
  OptimizerType,
} from './types';
import { Activations } from './activations';

export interface OptimizerState {
  // Momentum velocity
  vW1: [[number, number], [number, number]];
  vb1: [number, number];
  vW2: [number, number];
  vb2: number;
  // Adam first and second moments
  mW1: [[number, number], [number, number]];
  mb1: [number, number];
  mW2: [number, number];
  mb2: number;
  vAdamW1: [[number, number], [number, number]];
  vAdamb1: [number, number];
  vAdamW2: [number, number];
  vAdamb2: number;
  t: number;
}

export function createInitialOptimizerState(): OptimizerState {
  return {
    vW1: [[0, 0], [0, 0]],
    vb1: [0, 0],
    vW2: [0, 0],
    vb2: 0,
    mW1: [[0, 0], [0, 0]],
    mb1: [0, 0],
    mW2: [0, 0],
    mb2: 0,
    vAdamW1: [[0, 0], [0, 0]],
    vAdamb1: [0, 0],
    vAdamW2: [0, 0],
    vAdamb2: 0,
    t: 0,
  };
}

export const NeuralEngine = {
  // Forward pass for single 2D input
  forward(weights: NetworkWeights, x: Vector2D): LayerOutputs {
    const { W1, b1, W2, b2, activation } = weights;

    // Layer 1 Affine: z1 = W1 * x + b1
    const z1_0 = W1[0][0] * x[0] + W1[0][1] * x[1] + b1[0];
    const z1_1 = W1[1][0] * x[0] + W1[1][1] * x[1] + b1[1];
    const z1: Vector2D = [z1_0, z1_1];

    // Layer 1 Activation: a1 = sigma(z1)
    const a1_0 = Activations.fn(z1_0, activation);
    const a1_1 = Activations.fn(z1_1, activation);
    const a1: Vector2D = [a1_0, a1_1];

    // Layer 2 Affine: z2 = w2^T * a1 + b2
    const z2 = W2[0] * a1_0 + W2[1] * a1_1 + b2;

    // Layer 2 Output: yHat = Sigmoid(z2)
    const yHat = Activations.fn(z2, 'sigmoid');

    return { x, z1, a1, z2, yHat };
  },

  // Binary Cross-Entropy Loss for a single sample
  sampleLoss(yHat: number, y: number): number {
    const eps = 1e-15;
    const clampedYHat = Math.max(eps, Math.min(1 - eps, yHat));
    return -(y * Math.log(clampedYHat) + (1 - y) * Math.log(1 - clampedYHat));
  },

  // Compute total dataset loss
  computeLoss(dataset: Point2D[], weights: NetworkWeights): number {
    if (dataset.length === 0) return 0;
    let totalLoss = 0;
    for (const pt of dataset) {
      const out = this.forward(weights, [pt.x, pt.y]);
      totalLoss += this.sampleLoss(out.yHat, pt.label);
    }
    return totalLoss / dataset.length;
  },

  // Compute classification accuracy (threshold = 0.5)
  computeAccuracy(dataset: Point2D[], weights: NetworkWeights): number {
    if (dataset.length === 0) return 0;
    let correct = 0;
    for (const pt of dataset) {
      const out = this.forward(weights, [pt.x, pt.y]);
      const pred = out.yHat >= 0.5 ? 1 : 0;
      if (pred === pt.label) correct++;
    }
    return correct / dataset.length;
  },

  // Full analytical gradient computation via Backpropagation
  computeGradients(dataset: Point2D[], weights: NetworkWeights): Gradients {
    const N = dataset.length;
    if (N === 0) {
      return {
        dW1: [[0, 0], [0, 0]],
        db1: [0, 0],
        dW2: [0, 0],
        db2: 0,
      };
    }

    let dW1_00 = 0, dW1_01 = 0, dW1_10 = 0, dW1_11 = 0;
    let db1_0 = 0, db1_1 = 0;
    let dW2_0 = 0, dW2_1 = 0;
    let db2 = 0;

    for (const pt of dataset) {
      const out = this.forward(weights, [pt.x, pt.y]);
      // dL/dz2 = yHat - y (combined BCE + Sigmoid derivative)
      const dz2 = out.yHat - pt.label;

      // Output layer gradients
      dW2_0 += dz2 * out.a1[0];
      dW2_1 += dz2 * out.a1[1];
      db2 += dz2;

      // Hidden layer backprop
      // dL/da1 = dz2 * W2
      const da1_0 = dz2 * weights.W2[0];
      const da1_1 = dz2 * weights.W2[1];

      // dL/dz1 = dL/da1 * sigma'(z1)
      const dz1_0 = da1_0 * Activations.derivative(out.z1[0], weights.activation);
      const dz1_1 = da1_1 * Activations.derivative(out.z1[1], weights.activation);

      // Hidden layer parameter gradients
      dW1_00 += dz1_0 * pt.x;
      dW1_01 += dz1_0 * pt.y;
      db1_0 += dz1_0;

      dW1_10 += dz1_1 * pt.x;
      dW1_11 += dz1_1 * pt.y;
      db1_1 += dz1_1;
    }

    return {
      dW1: [
        [dW1_00 / N, dW1_01 / N],
        [dW1_10 / N, dW1_11 / N],
      ],
      db1: [db1_0 / N, db1_1 / N],
      dW2: [dW2_0 / N, dW2_1 / N],
      db2: db2 / N,
    };
  },

  // Derive detailed symbolic & numerical chain rule breakdown for a single sample
  deriveChainRule(
    sample: Point2D,
    weights: NetworkWeights,
    weightKey: ChainRuleBreakdown['weightKey']
  ): ChainRuleBreakdown {
    const out = this.forward(weights, [sample.x, sample.y]);
    const loss = this.sampleLoss(out.yHat, sample.label);

    const eps = 1e-15;
    const clampedYHat = Math.max(eps, Math.min(1 - eps, out.yHat));

    // Term 1: dL / dyHat
    // dL/dyHat = (yHat - y) / (yHat * (1 - yHat))
    const dL_dyHat = (clampedYHat - sample.label) / (clampedYHat * (1 - clampedYHat));

    // Term 2: dyHat / dz2 = yHat * (1 - yHat)
    const dyHat_dz2 = clampedYHat * (1 - clampedYHat);

    // Note: dL_dz2 = dL_dyHat * dyHat_dz2 = yHat - y
    const dL_dz2 = clampedYHat - sample.label;

    let symbolicEquation = '';
    let symbolicTerms: string[] = [];
    let numericalTerms: number[] = [];
    let finalGradient = 0;
    let isDead = false;
    let deadReason: string | undefined = undefined;

    switch (weightKey) {
      case 'W2_0': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial w_{2,1}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial w_{2,1}}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial w_{2,1}}',
        ];
        const dz2_dw20 = out.a1[0];
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_dw20];
        finalGradient = dL_dz2 * dz2_dw20;
        break;
      }
      case 'W2_1': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial w_{2,2}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial w_{2,2}}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial w_{2,2}}',
        ];
        const dz2_dw21 = out.a1[1];
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_dw21];
        finalGradient = dL_dz2 * dz2_dw21;
        break;
      }
      case 'b2': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial b_2} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial b_2}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial b_2}',
        ];
        numericalTerms = [dL_dyHat, dyHat_dz2, 1.0];
        finalGradient = dL_dz2;
        break;
      }
      case 'W1_00': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial w_{11}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial a_{1,1}} \\cdot \\frac{\\partial a_{1,1}}{\\partial z_{1,1}} \\cdot \\frac{\\partial z_{1,1}}{\\partial w_{11}}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial a_{1,1}}',
          '\\frac{\\partial a_{1,1}}{\\partial z_{1,1}}',
          '\\frac{\\partial z_{1,1}}{\\partial w_{11}}',
        ];
        const dz2_da10 = weights.W2[0];
        const da10_dz10 = Activations.derivative(out.z1[0], weights.activation);
        const dz10_dw11 = sample.x;
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_da10, da10_dz10, dz10_dw11];
        finalGradient = dL_dz2 * dz2_da10 * da10_dz10 * dz10_dw11;

        if (da10_dz10 === 0 && weights.activation === 'relu') {
          isDead = true;
          deadReason = 'Dead ReLU: z1,1 <= 0, so local derivative da1,1/dz1,1 = 0, extinguishing gradient!';
        }
        break;
      }
      case 'W1_01': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial w_{12}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial a_{1,1}} \\cdot \\frac{\\partial a_{1,1}}{\\partial z_{1,1}} \\cdot \\frac{\\partial z_{1,1}}{\\partial w_{12}}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial a_{1,1}}',
          '\\frac{\\partial a_{1,1}}{\\partial z_{1,1}}',
          '\\frac{\\partial z_{1,1}}{\\partial w_{12}}',
        ];
        const dz2_da10 = weights.W2[0];
        const da10_dz10 = Activations.derivative(out.z1[0], weights.activation);
        const dz10_dw12 = sample.y;
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_da10, da10_dz10, dz10_dw12];
        finalGradient = dL_dz2 * dz2_da10 * da10_dz10 * dz10_dw12;

        if (da10_dz10 === 0 && weights.activation === 'relu') {
          isDead = true;
          deadReason = 'Dead ReLU: z1,1 <= 0, derivative is 0.';
        }
        break;
      }
      case 'W1_10': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial w_{21}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial a_{1,2}} \\cdot \\frac{\\partial a_{1,2}}{\\partial z_{1,2}} \\cdot \\frac{\\partial z_{1,2}}{\\partial w_{21}}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial a_{1,2}}',
          '\\frac{\\partial a_{1,2}}{\\partial z_{1,2}}',
          '\\frac{\\partial z_{1,2}}{\\partial w_{21}}',
        ];
        const dz2_da11 = weights.W2[1];
        const da11_dz11 = Activations.derivative(out.z1[1], weights.activation);
        const dz11_dw21 = sample.x;
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_da11, da11_dz11, dz11_dw21];
        finalGradient = dL_dz2 * dz2_da11 * da11_dz11 * dz11_dw21;

        if (da11_dz11 === 0 && weights.activation === 'relu') {
          isDead = true;
          deadReason = 'Dead ReLU: z1,2 <= 0, derivative is 0.';
        }
        break;
      }
      case 'W1_11': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial w_{22}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial a_{1,2}} \\cdot \\frac{\\partial a_{1,2}}{\\partial z_{1,2}} \\cdot \\frac{\\partial z_{1,2}}{\\partial w_{22}}';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial a_{1,2}}',
          '\\frac{\\partial a_{1,2}}{\\partial z_{1,2}}',
          '\\frac{\\partial z_{1,2}}{\\partial w_{22}}',
        ];
        const dz2_da11 = weights.W2[1];
        const da11_dz11 = Activations.derivative(out.z1[1], weights.activation);
        const dz11_dw22 = sample.y;
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_da11, da11_dz11, dz11_dw22];
        finalGradient = dL_dz2 * dz2_da11 * da11_dz11 * dz11_dw22;

        if (da11_dz11 === 0 && weights.activation === 'relu') {
          isDead = true;
          deadReason = 'Dead ReLU: z1,2 <= 0, derivative is 0.';
        }
        break;
      }
      case 'b1_0': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial b_{1,1}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial a_{1,1}} \\cdot \\frac{\\partial a_{1,1}}{\\partial z_{1,1}} \\cdot 1';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial a_{1,1}}',
          '\\frac{\\partial a_{1,1}}{\\partial z_{1,1}}',
          '1.0',
        ];
        const dz2_da10 = weights.W2[0];
        const da10_dz10 = Activations.derivative(out.z1[0], weights.activation);
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_da10, da10_dz10, 1.0];
        finalGradient = dL_dz2 * dz2_da10 * da10_dz10;
        break;
      }
      case 'b1_1': {
        symbolicEquation = '\\frac{\\partial \\mathcal{L}}{\\partial b_{1,2}} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z_2} \\cdot \\frac{\\partial z_2}{\\partial a_{1,2}} \\cdot \\frac{\\partial a_{1,2}}{\\partial z_{1,2}} \\cdot 1';
        symbolicTerms = [
          '\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}}',
          '\\frac{\\partial \\hat{y}}{\\partial z_2}',
          '\\frac{\\partial z_2}{\\partial a_{1,2}}',
          '\\frac{\\partial a_{1,2}}{\\partial z_{1,2}}',
          '1.0',
        ];
        const dz2_da11 = weights.W2[1];
        const da11_dz11 = Activations.derivative(out.z1[1], weights.activation);
        numericalTerms = [dL_dyHat, dyHat_dz2, dz2_da11, da11_dz11, 1.0];
        finalGradient = dL_dz2 * dz2_da11 * da11_dz11;
        break;
      }
    }

    return {
      sample,
      forward: out,
      loss,
      weightKey,
      symbolicEquation,
      symbolicTerms,
      numericalTerms,
      finalGradient,
      isDead,
      deadReason,
    };
  },

  // Apply one optimization step (SGD, Momentum, or Adam)
  applyOptimizerStep(
    weights: NetworkWeights,
    grads: Gradients,
    optState: OptimizerState,
    config: OptimizerConfig
  ): { updatedWeights: NetworkWeights; updatedState: OptimizerState } {
    const { type, learningRate, momentumGamma, beta1, beta2 } = config;
    const eps = 1e-8;

    const newWeights: NetworkWeights = {
      W1: [
        [weights.W1[0][0], weights.W1[0][1]],
        [weights.W1[1][0], weights.W1[1][1]],
      ],
      b1: [weights.b1[0], weights.b1[1]],
      W2: [weights.W2[0], weights.W2[1]],
      b2: weights.b2,
      activation: weights.activation,
    };

    const newState: OptimizerState = {
      vW1: [
        [optState.vW1[0][0], optState.vW1[0][1]],
        [optState.vW1[1][0], optState.vW1[1][1]],
      ],
      vb1: [optState.vb1[0], optState.vb1[1]],
      vW2: [optState.vW2[0], optState.vW2[1]],
      vb2: optState.vb2,
      mW1: [
        [optState.mW1[0][0], optState.mW1[0][1]],
        [optState.mW1[1][0], optState.mW1[1][1]],
      ],
      mb1: [optState.mb1[0], optState.mb1[1]],
      mW2: [optState.mW2[0], optState.mW2[1]],
      mb2: optState.mb2,
      vAdamW1: [
        [optState.vAdamW1[0][0], optState.vAdamW1[0][1]],
        [optState.vAdamW1[1][0], optState.vAdamW1[1][1]],
      ],
      vAdamb1: [optState.vAdamb1[0], optState.vAdamb1[1]],
      vAdamW2: [optState.vAdamW2[0], optState.vAdamW2[1]],
      vAdamb2: optState.vAdamb2,
      t: optState.t + 1,
    };

    if (type === 'sgd') {
      newWeights.W1[0][0] -= learningRate * grads.dW1[0][0];
      newWeights.W1[0][1] -= learningRate * grads.dW1[0][1];
      newWeights.W1[1][0] -= learningRate * grads.dW1[1][0];
      newWeights.W1[1][1] -= learningRate * grads.dW1[1][1];
      newWeights.b1[0] -= learningRate * grads.db1[0];
      newWeights.b1[1] -= learningRate * grads.db1[1];
      newWeights.W2[0] -= learningRate * grads.dW2[0];
      newWeights.W2[1] -= learningRate * grads.dW2[1];
      newWeights.b2 -= learningRate * grads.db2;
    } else if (type === 'momentum') {
      const updateParam = (val: number, grad: number, vKey: { v: number; setV: (nv: number) => void }): number => {
        const newV = momentumGamma * vKey.v + learningRate * grad;
        vKey.setV(newV);
        return val - newV;
      };

      newWeights.W1[0][0] = updateParam(newWeights.W1[0][0], grads.dW1[0][0], {
        v: newState.vW1[0][0],
        setV: nv => (newState.vW1[0][0] = nv),
      });
      newWeights.W1[0][1] = updateParam(newWeights.W1[0][1], grads.dW1[0][1], {
        v: newState.vW1[0][1],
        setV: nv => (newState.vW1[0][1] = nv),
      });
      newWeights.W1[1][0] = updateParam(newWeights.W1[1][0], grads.dW1[1][0], {
        v: newState.vW1[1][0],
        setV: nv => (newState.vW1[1][0] = nv),
      });
      newWeights.W1[1][1] = updateParam(newWeights.W1[1][1], grads.dW1[1][1], {
        v: newState.vW1[1][1],
        setV: nv => (newState.vW1[1][1] = nv),
      });

      newWeights.b1[0] = updateParam(newWeights.b1[0], grads.db1[0], {
        v: newState.vb1[0],
        setV: nv => (newState.vb1[0] = nv),
      });
      newWeights.b1[1] = updateParam(newWeights.b1[1], grads.db1[1], {
        v: newState.vb1[1],
        setV: nv => (newState.vb1[1] = nv),
      });

      newWeights.W2[0] = updateParam(newWeights.W2[0], grads.dW2[0], {
        v: newState.vW2[0],
        setV: nv => (newState.vW2[0] = nv),
      });
      newWeights.W2[1] = updateParam(newWeights.W2[1], grads.dW2[1], {
        v: newState.vW2[1],
        setV: nv => (newState.vW2[1] = nv),
      });

      newWeights.b2 = updateParam(newWeights.b2, grads.db2, {
        v: newState.vb2,
        setV: nv => (newState.vb2 = nv),
      });
    } else if (type === 'adam') {
      const t = newState.t;
      const updateAdam = (
        val: number,
        grad: number,
        m: number,
        v: number,
        setMV: (nm: number, nv: number) => void
      ): number => {
        const nm = beta1 * m + (1 - beta1) * grad;
        const nv = beta2 * v + (1 - beta2) * grad * grad;
        setMV(nm, nv);

        const mHat = nm / (1 - Math.pow(beta1, t));
        const vHat = nv / (1 - Math.pow(beta2, t));
        return val - (learningRate * mHat) / (Math.sqrt(vHat) + eps);
      };

      newWeights.W1[0][0] = updateAdam(
        newWeights.W1[0][0],
        grads.dW1[0][0],
        newState.mW1[0][0],
        newState.vAdamW1[0][0],
        (nm, nv) => {
          newState.mW1[0][0] = nm;
          newState.vAdamW1[0][0] = nv;
        }
      );
      newWeights.W1[0][1] = updateAdam(
        newWeights.W1[0][1],
        grads.dW1[0][1],
        newState.mW1[0][1],
        newState.vAdamW1[0][1],
        (nm, nv) => {
          newState.mW1[0][1] = nm;
          newState.vAdamW1[0][1] = nv;
        }
      );
      newWeights.W1[1][0] = updateAdam(
        newWeights.W1[1][0],
        grads.dW1[1][0],
        newState.mW1[1][0],
        newState.vAdamW1[1][0],
        (nm, nv) => {
          newState.mW1[1][0] = nm;
          newState.vAdamW1[1][0] = nv;
        }
      );
      newWeights.W1[1][1] = updateAdam(
        newWeights.W1[1][1],
        grads.dW1[1][1],
        newState.mW1[1][1],
        newState.vAdamW1[1][1],
        (nm, nv) => {
          newState.mW1[1][1] = nm;
          newState.vAdamW1[1][1] = nv;
        }
      );

      newWeights.b1[0] = updateAdam(
        newWeights.b1[0],
        grads.db1[0],
        newState.mb1[0],
        newState.vAdamb1[0],
        (nm, nv) => {
          newState.mb1[0] = nm;
          newState.vAdamb1[0] = nv;
        }
      );
      newWeights.b1[1] = updateAdam(
        newWeights.b1[1],
        grads.db1[1],
        newState.mb1[1],
        newState.vAdamb1[1],
        (nm, nv) => {
          newState.mb1[1] = nm;
          newState.vAdamb1[1] = nv;
        }
      );

      newWeights.W2[0] = updateAdam(
        newWeights.W2[0],
        grads.dW2[0],
        newState.mW2[0],
        newState.vAdamW2[0],
        (nm, nv) => {
          newState.mW2[0] = nm;
          newState.vAdamW2[0] = nv;
        }
      );
      newWeights.W2[1] = updateAdam(
        newWeights.W2[1],
        grads.dW2[1],
        newState.mW2[1],
        newState.vAdamW2[1],
        (nm, nv) => {
          newState.mW2[1] = nm;
          newState.vAdamW2[1] = nv;
        }
      );

      newWeights.b2 = updateAdam(
        newWeights.b2,
        grads.db2,
        newState.mb2,
        newState.vAdamb2,
        (nm, nv) => {
          newState.mb2 = nm;
          newState.vAdamb2 = nv;
        }
      );
    }

    return { updatedWeights: newWeights, updatedState: newState };
  },
};
