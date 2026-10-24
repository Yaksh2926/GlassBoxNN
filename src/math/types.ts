export interface Point2D {
  x: number;
  y: number;
  label: 0 | 1; // 0: Cyan, 1: Magenta
  id?: string;
}

export type Matrix2x2 = [[number, number], [number, number]];
export type Vector2D = [number, number];

export type ActivationType = 'relu' | 'tanh' | 'sigmoid' | 'leaky_relu';

export interface SVDResult {
  U: Matrix2x2;
  singularValues: [number, number]; // [sigma_1, sigma_2]
  V: Matrix2x2; // Note: W = U * diag(singularValues) * V^T
  VT: Matrix2x2;
}

export interface EigenResult {
  isReal: boolean;
  values: [number, number] | { real: number; imag: number };
  vectors?: [Vector2D, Vector2D]; // Real eigenvectors if isReal
}

export interface NetworkWeights {
  W1: Matrix2x2;     // Hidden layer weights (2 inputs -> 2 hidden neurons)
  b1: Vector2D;      // Hidden layer bias
  W2: Vector2D;      // Output layer weights (2 hidden neurons -> 1 output)
  b2: number;        // Output layer bias
  activation: ActivationType;
}

export interface LayerOutputs {
  x: Vector2D;       // Input
  z1: Vector2D;      // Pre-activation hidden
  a1: Vector2D;      // Post-activation hidden
  z2: number;        // Pre-activation output
  yHat: number;      // Predicted probability
}

export interface Gradients {
  dW1: Matrix2x2;
  db1: Vector2D;
  dW2: Vector2D;
  db2: number;
}

export interface ChainRuleBreakdown {
  sample: Point2D;
  forward: LayerOutputs;
  loss: number;
  // Partial derivatives for hovered weight w_ij
  weightKey: 'W1_00' | 'W1_01' | 'W1_10' | 'W1_11' | 'W2_0' | 'W2_1' | 'b1_0' | 'b1_1' | 'b2';
  symbolicEquation: string;
  symbolicTerms: string[];
  numericalTerms: number[];
  finalGradient: number;
  isDead: boolean;
  deadReason?: string;
}

export type OptimizerType = 'sgd' | 'momentum' | 'adam';

export interface OptimizerConfig {
  type: OptimizerType;
  learningRate: number;
  momentumGamma: number; // for momentum
  beta1: number;         // for adam
  beta2: number;         // for adam
}

export interface HessianResult {
  H: [[number, number], [number, number]];
  eigenvalues: [number, number];
  curvatureType: 'bowl' | 'peak' | 'saddle' | 'flat';
  description: string;
}

export interface RaceTrajectoryStep {
  p1: number;
  p2: number;
  loss: number;
  grad1: number;
  grad2: number;
}

export interface RaceResult {
  optimizer: OptimizerType;
  steps: RaceTrajectoryStep[];
  color: string;
}

export interface LossLandscapeGrid {
  param1Range: [number, number]; // [min, max]
  param2Range: [number, number];
  p1Values: number[];
  p2Values: number[];
  grid: number[][]; // [row][col] -> loss
  minLoss: number;
  maxLoss: number;
  p1Key: string;
  p2Key: string;
}
