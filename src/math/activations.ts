import { ActivationType } from './types';

export const Activations = {
  // Compute activation value f(x)
  fn(x: number, type: ActivationType): number {
    switch (type) {
      case 'relu':
        return Math.max(0, x);
      case 'leaky_relu':
        return x > 0 ? x : 0.1 * x;
      case 'tanh':
        return Math.tanh(x);
      case 'sigmoid':
        return 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, x))));
      default:
        return x;
    }
  },

  // Compute activation derivative f'(x)
  derivative(x: number, type: ActivationType): number {
    switch (type) {
      case 'relu':
        return x > 0 ? 1 : 0;
      case 'leaky_relu':
        return x > 0 ? 1 : 0.1;
      case 'tanh': {
        const th = Math.tanh(x);
        return 1 - th * th;
      }
      case 'sigmoid': {
        const sig = 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, x))));
        return sig * (1 - sig);
      }
      default:
        return 1;
    }
  },

  // Interpolate between linear (Identity) and full non-linear activation:
  // t in [0, 1], where 0 = z, 1 = sigma(z)
  interpolateFolding(z: number, t: number, type: ActivationType): number {
    const clampedT = Math.max(0, Math.min(1, t));
    const activated = this.fn(z, type);
    return (1 - clampedT) * z + clampedT * activated;
  },

  // Check if a neuron is dead or saturated
  checkHealth(zValues: number[], type: ActivationType): {
    isDead: boolean;
    isSaturated: boolean;
    avgGrad: number;
    description: string;
  } {
    if (zValues.length === 0) {
      return { isDead: false, isSaturated: false, avgGrad: 1, description: 'No data' };
    }

    const grads = zValues.map(z => this.derivative(z, type));
    const avgGrad = grads.reduce((a, b) => a + b, 0) / grads.length;

    if (type === 'relu') {
      const allZero = grads.every(g => g === 0);
      if (allZero) {
        return {
          isDead: true,
          isSaturated: false,
          avgGrad: 0,
          description: 'Dead ReLU: All inputs <= 0. Gradient is permanently zero.',
        };
      }
    }

    if (type === 'sigmoid' || type === 'tanh') {
      if (avgGrad < 0.04) {
        return {
          isDead: false,
          isSaturated: true,
          avgGrad,
          description: 'Vanishing Gradient: Activation saturated in flat tails.',
        };
      }
    }

    return {
      isDead: false,
      isSaturated: false,
      avgGrad,
      description: 'Healthy active gradient flow.',
    };
  },
};
