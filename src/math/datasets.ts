import { Point2D } from './types';

export type DatasetPreset = 'xor' | 'circles' | 'moons' | 'linear' | 'custom';

export const Datasets = {
  // Simple seeded pseudo-random generator
  seededRandom(seed: number): () => number {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  },

  // Box-Muller transform for normal distribution
  normal(rand: () => number, mean = 0, std = 0.2): number {
    const u1 = Math.max(1e-7, rand());
    const u2 = rand();
    return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  },

  // Generate XOR dataset
  generateXOR(numPoints = 80, seed = 42, noise = 0.35): Point2D[] {
    const rand = this.seededRandom(seed);
    const points: Point2D[] = [];
    const pointsPerQuadrant = Math.max(1, Math.floor(numPoints / 4));

    const centers: Array<{ x: number; y: number; label: 0 | 1 }> = [
      { x: 1.4, y: 1.4, label: 0 },    // Top-Right: Class 0
      { x: -1.4, y: -1.4, label: 0 },  // Bottom-Left: Class 0
      { x: -1.4, y: 1.4, label: 1 },   // Top-Left: Class 1
      { x: 1.4, y: -1.4, label: 1 },   // Bottom-Right: Class 1
    ];

    centers.forEach(c => {
      for (let i = 0; i < pointsPerQuadrant; i++) {
        points.push({
          x: this.normal(rand, c.x, Math.max(0.05, noise)),
          y: this.normal(rand, c.y, Math.max(0.05, noise)),
          label: c.label,
          id: `xor-${c.label}-${points.length}`,
        });
      }
    });

    return points;
  },

  // Generate Concentric Circles
  generateCircles(numPoints = 90, seed = 101, noise = 0.25): Point2D[] {
    const rand = this.seededRandom(seed);
    const points: Point2D[] = [];
    const half = Math.max(1, Math.floor(numPoints / 2));

    // Inner Circle (Class 0: Silver)
    for (let i = 0; i < half; i++) {
      const theta = rand() * 2 * Math.PI;
      const r = 0.3 + 0.55 * rand() + (rand() - 0.5) * noise;
      points.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        label: 0,
        id: `circle-0-${i}`,
      });
    }

    // Outer Ring (Class 1: Pink)
    for (let i = 0; i < half; i++) {
      const theta = rand() * 2 * Math.PI;
      const r = 1.6 + 0.6 * rand() + (rand() - 0.5) * noise;
      points.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        label: 1,
        id: `circle-1-${i}`,
      });
    }

    return points;
  },

  // Generate Two Moons
  generateMoons(numPoints = 80, seed = 77, noise = 0.25): Point2D[] {
    const rand = this.seededRandom(seed);
    const points: Point2D[] = [];
    const half = Math.max(1, Math.floor(numPoints / 2));

    // Top Moon (Class 0)
    for (let i = 0; i < half; i++) {
      const theta = (i / half) * Math.PI;
      const r = 1.3 + (rand() - 0.5) * noise;
      points.push({
        x: r * Math.cos(theta) - 0.5,
        y: r * Math.sin(theta) - 0.2,
        label: 0,
        id: `moon-0-${i}`,
      });
    }

    // Bottom Inverted Moon (Class 1)
    for (let i = 0; i < half; i++) {
      const theta = (i / half) * Math.PI;
      const r = 1.3 + (rand() - 0.5) * noise;
      points.push({
        x: 0.5 - r * Math.cos(theta),
        y: 0.2 - r * Math.sin(theta),
        label: 1,
        id: `moon-1-${i}`,
      });
    }

    return points;
  },

  // Generate Linearly Separable Blobs
  generateLinear(numPoints = 60, seed = 13, noise = 0.4): Point2D[] {
    const rand = this.seededRandom(seed);
    const points: Point2D[] = [];
    const half = Math.max(1, Math.floor(numPoints / 2));

    // Blob 0: centered at (-1.3, -1.1)
    for (let i = 0; i < half; i++) {
      points.push({
        x: this.normal(rand, -1.3, Math.max(0.08, noise)),
        y: this.normal(rand, -1.1, Math.max(0.08, noise)),
        label: 0,
        id: `lin-0-${i}`,
      });
    }

    // Blob 1: centered at (1.3, 1.1)
    for (let i = 0; i < half; i++) {
      points.push({
        x: this.normal(rand, 1.3, Math.max(0.08, noise)),
        y: this.normal(rand, 1.1, Math.max(0.08, noise)),
        label: 1,
        id: `lin-1-${i}`,
      });
    }

    return points;
  },

  // Generate with custom points count and noise level
  generateWithParams(
    preset: DatasetPreset,
    pointsPerClass = 50,
    noise = 0.1,
    seed = 42
  ): Point2D[] {
    const totalPoints = pointsPerClass * 2;
    switch (preset) {
      case 'xor':
        return this.generateXOR(totalPoints, seed, noise * 2.5);
      case 'circles':
        return this.generateCircles(totalPoints, seed, noise * 2.0);
      case 'moons':
        return this.generateMoons(totalPoints, seed, noise * 2.0);
      case 'linear':
        return this.generateLinear(totalPoints, seed, noise * 2.5);
      case 'custom':
        return this.generateLinear(totalPoints, seed, noise * 2.5);
      default:
        return this.generateLinear(totalPoints, seed, noise * 2.5);
    }
  },

  // Get dataset by preset
  getPreset(preset: DatasetPreset): Point2D[] {
    switch (preset) {
      case 'xor':
        return this.generateXOR();
      case 'circles':
        return this.generateCircles();
      case 'moons':
        return this.generateMoons();
      case 'linear':
        return this.generateLinear();
      case 'custom':
        return this.generateXOR(20);
      default:
        return this.generateXOR();
    }
  },

  // Mathematical explanation for why the dataset is or isn't linearly separable
  getExplanation(preset: DatasetPreset): { title: string; mathReason: string; intuition: string } {
    switch (preset) {
      case 'xor':
        return {
          title: 'The Minsky-Papert XOR Barrier (1969)',
          mathReason:
            'No affine hyperplane w^T x + b = 0 can satisfy w^T x > 0 for points in {(1,1), (-1,-1)} and w^T x < 0 for points in {(1,-1), (-1,1)} simultaneously.',
          intuition:
            'A single straight line cannot separate diagonal corners. Space MUST be folded or projected into higher dimensions to untangle them.',
        };
      case 'circles':
        return {
          title: 'Radial Inseparability (Concentric Topology)',
          mathReason:
            'Class 0 is bounded in Euclidean norm ||x|| < r_1, while Class 1 resides in r_1 < ||x|| < r_2. The decision boundary is non-convex (quadratic).',
          intuition:
            'One circle lives completely inside another. A single scissor cut cannot separate the inner donut hole from the outer ring without bending space.',
        };
      case 'moons':
        return {
          title: 'Interlocking Non-Convex Manifolds',
          mathReason:
            'The convex hulls of both classes overlap. Linear separation theorem (Hyperplane Separation Theorem) fails because neither set is strictly separable.',
          intuition:
            'The two crescent arms hook into each other. A linear model can at best achieve ~75% accuracy; non-linear activation is required to unhook them.',
        };
      case 'linear':
        return {
          title: 'Trivially Separable (Convex Hull Disjoint)',
          mathReason:
            'Conv(Class 0) ∩ Conv(Class 1) = ∅. By the Hyperplane Separation Theorem, a linear boundary exists that achieves 100% margin.',
          intuition:
            'Two completely isolated islands. A simple straight line can easily divide them without any hidden layer transformations.',
        };
      case 'custom':
        return {
          title: 'User-Defined Discrete Point Set',
          mathReason:
            'Classification difficulty depends on whether your placed points form linearly separable convex hulls in R^2.',
          intuition:
            'Click anywhere on the grid to add points and test whether your network can fold space to separate them!',
        };
    }
  },
};
