import {
  Point2D,
  NetworkWeights,
  LossLandscapeGrid,
  HessianResult,
  OptimizerType,
  RaceResult,
  RaceTrajectoryStep,
} from './types';
import { NeuralEngine } from './neuralEngine';
import { LinearAlgebra } from './linearAlgebra';

export interface ParamAccessor {
  key1: string;
  key2: string;
  get: (w: NetworkWeights) => [number, number];
  set: (w: NetworkWeights, p1: number, p2: number) => NetworkWeights;
}

export const ParamAccessors: Record<string, ParamAccessor> = {
  W1_diag: {
    key1: 'w_{11}',
    key2: 'w_{22}',
    get: w => [w.W1[0][0], w.W1[1][1]],
    set: (w, p1, p2) => ({
      ...w,
      W1: [
        [p1, w.W1[0][1]],
        [w.W1[1][0], p2],
      ],
    }),
  },
  W1_row1: {
    key1: 'w_{11}',
    key2: 'w_{12}',
    get: w => [w.W1[0][0], w.W1[0][1]],
    set: (w, p1, p2) => ({
      ...w,
      W1: [
        [p1, p2],
        [w.W1[1][0], w.W1[1][1]],
      ],
    }),
  },
  W2_both: {
    key1: 'w_{2,1}',
    key2: 'w_{2,2}',
    get: w => [w.W2[0], w.W2[1]],
    set: (w, p1, p2) => ({
      ...w,
      W2: [p1, p2],
    }),
  },
};

export const LossLandscape = {
  // Generate a 2D slice grid around current parameters
  generateGrid(
    dataset: Point2D[],
    weights: NetworkWeights,
    accessorKey = 'W1_diag',
    resolution = 35,
    span = 3.0
  ): LossLandscapeGrid {
    const accessor = ParamAccessors[accessorKey] || ParamAccessors.W1_diag;
    const [currentP1, currentP2] = accessor.get(weights);

    const minP1 = currentP1 - span;
    const maxP1 = currentP1 + span;
    const minP2 = currentP2 - span;
    const maxP2 = currentP2 + span;

    const p1Values: number[] = [];
    const p2Values: number[] = [];

    const stepP1 = (maxP1 - minP1) / (resolution - 1);
    const stepP2 = (maxP2 - minP2) / (resolution - 1);

    for (let i = 0; i < resolution; i++) {
      p1Values.push(minP1 + i * stepP1);
      p2Values.push(minP2 + i * stepP2);
    }

    const grid: number[][] = [];
    let minLoss = Infinity;
    let maxLoss = -Infinity;

    for (let r = 0; r < resolution; r++) {
      const row: number[] = [];
      const p2 = p2Values[r];
      for (let c = 0; c < resolution; c++) {
        const p1 = p1Values[c];
        const testWeights = accessor.set(weights, p1, p2);
        const loss = NeuralEngine.computeLoss(dataset, testWeights);
        row.push(loss);
        if (loss < minLoss) minLoss = loss;
        if (loss > maxLoss) maxLoss = loss;
      }
      grid.push(row);
    }

    return {
      param1Range: [minP1, maxP1],
      param2Range: [minP2, maxP2],
      p1Values,
      p2Values,
      grid,
      minLoss,
      maxLoss,
      p1Key: accessor.key1,
      p2Key: accessor.key2,
    };
  },

  // Compute 2x2 Hessian matrix & eigenvalues via finite differences
  computeHessian(
    dataset: Point2D[],
    weights: NetworkWeights,
    accessorKey = 'W1_diag'
  ): HessianResult {
    const accessor = ParamAccessors[accessorKey] || ParamAccessors.W1_diag;
    const [p1, p2] = accessor.get(weights);

    const h = 1e-4;
    const L0 = NeuralEngine.computeLoss(dataset, weights);

    const evalAt = (dp1: number, dp2: number) => {
      const w = accessor.set(weights, p1 + dp1, p2 + dp2);
      return NeuralEngine.computeLoss(dataset, w);
    };

    const L_p1_plus = evalAt(h, 0);
    const L_p1_minus = evalAt(-h, 0);
    const H11 = (L_p1_plus - 2 * L0 + L_p1_minus) / (h * h);

    const L_p2_plus = evalAt(0, h);
    const L_p2_minus = evalAt(0, -h);
    const H22 = (L_p2_plus - 2 * L0 + L_p2_minus) / (h * h);

    const L_pp = evalAt(h, h);
    const L_pm = evalAt(h, -h);
    const L_mp = evalAt(-h, h);
    const L_mm = evalAt(-h, -h);
    const H12 = (L_pp - L_pm - L_mp + L_mm) / (4 * h * h);
    const H21 = H12; // Symmetry of mixed partials (Clairaut's theorem)

    const H: [[number, number], [number, number]] = [
      [H11, H12],
      [H21, H22],
    ];

    const eigenH = LinearAlgebra.eigen(H);
    let mu1 = 0, mu2 = 0;
    if (eigenH.isReal) {
      const vals = eigenH.values as [number, number];
      mu1 = vals[0];
      mu2 = vals[1];
    } else {
      const vals = eigenH.values as { real: number; imag: number };
      mu1 = vals.real;
      mu2 = vals.real;
    }

    let curvatureType: 'bowl' | 'peak' | 'saddle' | 'flat';
    let description: string;

    const eps = 1e-3;
    if (Math.abs(mu1) < eps || Math.abs(mu2) < eps) {
      curvatureType = 'flat';
      description = 'Degenerate Curvature: Zero eigenvalue creates a flat valley/ravine.';
    } else if (mu1 > 0 && mu2 > 0) {
      curvatureType = 'bowl';
      description = 'Local Minimum (Convex Bowl): Both Hessian eigenvalues > 0. Positive definite curvature.';
    } else if (mu1 < 0 && mu2 < 0) {
      curvatureType = 'peak';
      description = 'Local Maximum: Both Hessian eigenvalues < 0. Negative definite curvature.';
    } else {
      curvatureType = 'saddle';
      description = 'Saddle Point: Opposing eigenvalue signs (mu1 * mu2 < 0). Curvature bends up in one direction and down in another!';
    }

    return {
      H,
      eigenvalues: [mu1, mu2],
      curvatureType,
      description,
    };
  },

  // Simulate simultaneous optimizer race from the exact same starting coordinates
  raceOptimizers(
    dataset: Point2D[],
    initialWeights: NetworkWeights,
    startP1: number,
    startP2: number,
    accessorKey = 'W1_diag',
    steps = 45,
    learningRate = 0.15
  ): Record<OptimizerType, RaceResult> {
    const accessor = ParamAccessors[accessorKey] || ParamAccessors.W1_diag;
    const h = 1e-4;

    const evalLossAndGrad = (p1: number, p2: number, baseW: NetworkWeights) => {
      const w = accessor.set(baseW, p1, p2);
      const loss = NeuralEngine.computeLoss(dataset, w);
      const wP1 = accessor.set(baseW, p1 + h, p2);
      const wP2 = accessor.set(baseW, p1, p2 + h);
      const g1 = (NeuralEngine.computeLoss(dataset, wP1) - loss) / h;
      const g2 = (NeuralEngine.computeLoss(dataset, wP2) - loss) / h;
      return { loss, g1, g2 };
    };

    // 1. SGD Run
    const sgdSteps: RaceTrajectoryStep[] = [];
    let curP1 = startP1;
    let curP2 = startP2;
    for (let s = 0; s < steps; s++) {
      const { loss, g1, g2 } = evalLossAndGrad(curP1, curP2, initialWeights);
      sgdSteps.push({ p1: curP1, p2: curP2, loss, grad1: g1, grad2: g2 });
      curP1 -= learningRate * g1;
      curP2 -= learningRate * g2;
    }

    // 2. Momentum Run (Heavy Ball)
    const momentumSteps: RaceTrajectoryStep[] = [];
    curP1 = startP1;
    curP2 = startP2;
    let v1 = 0;
    let v2 = 0;
    const gamma = 0.85;
    for (let s = 0; s < steps; s++) {
      const { loss, g1, g2 } = evalLossAndGrad(curP1, curP2, initialWeights);
      momentumSteps.push({ p1: curP1, p2: curP2, loss, grad1: g1, grad2: g2 });
      v1 = gamma * v1 + learningRate * g1;
      v2 = gamma * v2 + learningRate * g2;
      curP1 -= v1;
      curP2 -= v2;
    }

    // 3. Adam Run
    const adamSteps: RaceTrajectoryStep[] = [];
    curP1 = startP1;
    curP2 = startP2;
    let m1 = 0, m2 = 0;
    let vAdam1 = 0, vAdam2 = 0;
    const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
    for (let s = 0; s < steps; s++) {
      const { loss, g1, g2 } = evalLossAndGrad(curP1, curP2, initialWeights);
      adamSteps.push({ p1: curP1, p2: curP2, loss, grad1: g1, grad2: g2 });
      const t = s + 1;
      m1 = beta1 * m1 + (1 - beta1) * g1;
      m2 = beta1 * m2 + (1 - beta1) * g2;
      vAdam1 = beta2 * vAdam1 + (1 - beta2) * g1 * g1;
      vAdam2 = beta2 * vAdam2 + (1 - beta2) * g2 * g2;

      const mHat1 = m1 / (1 - Math.pow(beta1, t));
      const mHat2 = m2 / (1 - Math.pow(beta1, t));
      const vHat1 = vAdam1 / (1 - Math.pow(beta2, t));
      const vHat2 = vAdam2 / (1 - Math.pow(beta2, t));

      curP1 -= (learningRate * mHat1) / (Math.sqrt(vHat1) + eps);
      curP2 -= (learningRate * mHat2) / (Math.sqrt(vHat2) + eps);
    }

    return {
      sgd: { optimizer: 'sgd', steps: sgdSteps, color: '#00F5D4' },        // Neon Cyan
      momentum: { optimizer: 'momentum', steps: momentumSteps, color: '#F59E0B' }, // Neon Amber
      adam: { optimizer: 'adam', steps: adamSteps, color: '#FF2A85' },       // Electric Magenta
    };
  },
};
