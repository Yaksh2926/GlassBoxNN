import { describe, it, expect } from 'vitest';
import { LinearAlgebra } from '../linearAlgebra';
import { Activations } from '../activations';
import { NeuralEngine } from '../neuralEngine';
import { LossLandscape } from '../lossLandscape';
import { Datasets } from '../datasets';
import { Matrix2x2, NetworkWeights, Point2D } from '../types';

describe('Linear Algebra Engine', () => {
  it('correctly calculates determinant', () => {
    const M: Matrix2x2 = [[2, 3], [1, 4]];
    expect(LinearAlgebra.det(M)).toBe(2 * 4 - 3 * 1); // 5

    const singular: Matrix2x2 = [[2, 4], [1, 2]];
    expect(LinearAlgebra.det(singular)).toBe(0);
  });

  it('correctly calculates real eigenvalues and eigenvectors', () => {
    // Symmetric matrix [[2, 1], [1, 2]] with eigenvalues 3 and 1
    const M: Matrix2x2 = [[2, 1], [1, 2]];
    const res = LinearAlgebra.eigen(M);
    expect(res.isReal).toBe(true);
    if (res.isReal) {
      const vals = res.values as [number, number];
      expect(vals[0]).toBeCloseTo(3, 4);
      expect(vals[1]).toBeCloseTo(1, 4);
    }
  });

  it('detects complex conjugate eigenvalues for 90-degree rotation', () => {
    // 90 deg rotation: [[0, -1], [1, 0]], eigenvalues are 0 +- 1i
    const M: Matrix2x2 = [[0, -1], [1, 0]];
    const res = LinearAlgebra.eigen(M);
    expect(res.isReal).toBe(false);
    if (!res.isReal) {
      const complexVal = res.values as { real: number; imag: number };
      expect(complexVal.real).toBeCloseTo(0, 4);
      expect(complexVal.imag).toBeCloseTo(1, 4);
    }
  });

  it('reconstructs matrix via SVD: W = U * Sigma * V^T', () => {
    const W: Matrix2x2 = [[1.5, 0.8], [-0.5, 2.0]];
    const svd = LinearAlgebra.svd(W);

    // Compute reconstructed: U * diag(singularValues) * VT
    const Sigma: Matrix2x2 = [
      [svd.singularValues[0], 0],
      [0, svd.singularValues[1]],
    ];
    const USigma = LinearAlgebra.multiply(svd.U, Sigma);
    const reconstructed = LinearAlgebra.multiply(USigma, svd.VT);

    expect(reconstructed[0][0]).toBeCloseTo(W[0][0], 2);
    expect(reconstructed[0][1]).toBeCloseTo(W[0][1], 2);
    expect(reconstructed[1][0]).toBeCloseTo(W[1][0], 2);
    expect(reconstructed[1][1]).toBeCloseTo(W[1][1], 2);
  });

  it('smoothly interpolates SVD through 3 stages from Identity to W', () => {
    const W: Matrix2x2 = [[1.5, 0.8], [-0.5, 2.0]];
    const svd = LinearAlgebra.svd(W);

    // Stage 0: Identity
    const M0 = LinearAlgebra.interpolateSVDMatrix(W, 0);
    expect(M0[0][0]).toBeCloseTo(1, 4);
    expect(M0[0][1]).toBeCloseTo(0, 4);
    expect(M0[1][0]).toBeCloseTo(0, 4);
    expect(M0[1][1]).toBeCloseTo(1, 4);

    // Stage 1: VT
    const M1 = LinearAlgebra.interpolateSVDMatrix(W, 1.0);
    expect(M1[0][0]).toBeCloseTo(svd.VT[0][0], 3);
    expect(M1[0][1]).toBeCloseTo(svd.VT[0][1], 3);
    expect(M1[1][0]).toBeCloseTo(svd.VT[1][0], 3);
    expect(M1[1][1]).toBeCloseTo(svd.VT[1][1], 3);

    // Stage 3: Full W
    const M3 = LinearAlgebra.interpolateSVDMatrix(W, 3.0);
    expect(M3[0][0]).toBeCloseTo(W[0][0], 2);
    expect(M3[0][1]).toBeCloseTo(W[0][1], 2);
    expect(M3[1][0]).toBeCloseTo(W[1][0], 2);
    expect(M3[1][1]).toBeCloseTo(W[1][1], 2);

    // Ellipse axes lengths at Stage 2 and Stage 3 match singular values
    const axes2 = LinearAlgebra.getSVDEllipseAxes(W, 2.0);
    expect(axes2.len1).toBeCloseTo(svd.singularValues[0], 2);
    expect(axes2.len2).toBeCloseTo(svd.singularValues[1], 2);

    const axes3 = LinearAlgebra.getSVDEllipseAxes(W, 3.0);
    expect(axes3.len1).toBeCloseTo(svd.singularValues[0], 2);
    expect(axes3.len2).toBeCloseTo(svd.singularValues[1], 2);
  });
});

describe('Activation Functions', () => {
  it('computes ReLU and derivative', () => {
    expect(Activations.fn(2.5, 'relu')).toBe(2.5);
    expect(Activations.fn(-1.5, 'relu')).toBe(0);
    expect(Activations.derivative(2.5, 'relu')).toBe(1);
    expect(Activations.derivative(-1.5, 'relu')).toBe(0);
  });

  it('computes Sigmoid and derivative', () => {
    expect(Activations.fn(0, 'sigmoid')).toBeCloseTo(0.5, 5);
    expect(Activations.derivative(0, 'sigmoid')).toBeCloseTo(0.25, 5);
  });

  it('detects dead ReLU when all preactivations are negative', () => {
    const health = Activations.checkHealth([-1, -2, -0.5, -4], 'relu');
    expect(health.isDead).toBe(true);
  });
});

describe('Neural Engine & Gradient Checking (Calculus)', () => {
  const dataset: Point2D[] = [
    { x: 1, y: 1, label: 0 },
    { x: -1, y: -1, label: 0 },
    { x: 1, y: -1, label: 1 },
    { x: -1, y: 1, label: 1 },
  ];

  const weights: NetworkWeights = {
    W1: [[0.5, -0.3], [0.2, 0.8]],
    b1: [0.1, -0.2],
    W2: [0.7, -0.6],
    b2: 0.1,
    activation: 'tanh',
  };

  it('forward pass produces valid probabilities in (0, 1)', () => {
    for (const pt of dataset) {
      const out = NeuralEngine.forward(weights, [pt.x, pt.y]);
      expect(out.yHat).toBeGreaterThan(0);
      expect(out.yHat).toBeLessThan(1);
    }
  });

  it('verifies analytical backprop gradients match finite differences (Gradient Check)', () => {
    const analyticalGrads = NeuralEngine.computeGradients(dataset, weights);
    const h = 1e-5;

    // Check dW1[0][0]
    const wPlus = { ...weights, W1: [[weights.W1[0][0] + h, weights.W1[0][1]], [weights.W1[1][0], weights.W1[1][1]]] as Matrix2x2 };
    const wMinus = { ...weights, W1: [[weights.W1[0][0] - h, weights.W1[0][1]], [weights.W1[1][0], weights.W1[1][1]]] as Matrix2x2 };
    const numGrad_W1_00 = (NeuralEngine.computeLoss(dataset, wPlus) - NeuralEngine.computeLoss(dataset, wMinus)) / (2 * h);
    expect(analyticalGrads.dW1[0][0]).toBeCloseTo(numGrad_W1_00, 3);

    // Check dW2[0]
    const w2Plus = { ...weights, W2: [weights.W2[0] + h, weights.W2[1]] as [number, number] };
    const w2Minus = { ...weights, W2: [weights.W2[0] - h, weights.W2[1]] as [number, number] };
    const numGrad_W2_0 = (NeuralEngine.computeLoss(dataset, w2Plus) - NeuralEngine.computeLoss(dataset, w2Minus)) / (2 * h);
    expect(analyticalGrads.dW2[0]).toBeCloseTo(numGrad_W2_0, 3);
  });
});

describe('Loss Landscape & Hessian', () => {
  it('computes 2x2 Hessian and curvature eigenvalues', () => {
    const dataset = Datasets.generateXOR(20);
    const weights: NetworkWeights = {
      W1: [[1.0, -1.0], [-1.0, 1.0]],
      b1: [0, 0],
      W2: [1.0, 1.0],
      b2: 0,
      activation: 'tanh',
    };

    const hessian = LossLandscape.computeHessian(dataset, weights, 'W1_diag');
    expect(hessian.H.length).toBe(2);
    expect(hessian.H[0].length).toBe(2);
    expect(hessian.eigenvalues.length).toBe(2);
    expect(['bowl', 'peak', 'saddle', 'flat']).toContain(hessian.curvatureType);
  });
});
