import { Matrix2x2, Vector2D, SVDResult, EigenResult } from './types';

export const LinearAlgebra = {
  // Determinant of 2x2 matrix
  det(M: Matrix2x2): number {
    return M[0][0] * M[1][1] - M[0][1] * M[1][0];
  },

  // Trace of 2x2 matrix
  trace(M: Matrix2x2): number {
    return M[0][0] + M[1][1];
  },

  // Transpose of 2x2 matrix
  transpose(M: Matrix2x2): Matrix2x2 {
    return [
      [M[0][0], M[1][0]],
      [M[0][1], M[1][1]],
    ];
  },

  // Matrix multiplication: A * B
  multiply(A: Matrix2x2, B: Matrix2x2): Matrix2x2 {
    return [
      [
        A[0][0] * B[0][0] + A[0][1] * B[1][0],
        A[0][0] * B[0][1] + A[0][1] * B[1][1],
      ],
      [
        A[1][0] * B[0][0] + A[1][1] * B[1][0],
        A[1][0] * B[0][1] + A[1][1] * B[1][1],
      ],
    ];
  },

  // Matrix * Vector: M * v
  transformVector(M: Matrix2x2, v: Vector2D): Vector2D {
    return [
      M[0][0] * v[0] + M[0][1] * v[1],
      M[1][0] * v[0] + M[1][1] * v[1],
    ];
  },

  // Vector addition: u + v
  addVectors(u: Vector2D, v: Vector2D): Vector2D {
    return [u[0] + v[0], u[1] + v[1]];
  },

  // Scale vector: s * v
  scaleVector(v: Vector2D, s: number): Vector2D {
    return [v[0] * s, v[1] * s];
  },

  // Vector norm ||v||_2
  norm(v: Vector2D): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  },

  // Normalize vector to unit length
  normalize(v: Vector2D): Vector2D {
    const len = this.norm(v);
    if (len < 1e-12) return [1, 0];
    return [v[0] / len, v[1] / len];
  },

  // Interpolate between Identity and Matrix M: (1 - t)*I + t*M
  interpolateMatrix(M: Matrix2x2, t: number): Matrix2x2 {
    return [
      [(1 - t) * 1 + t * M[0][0], t * M[0][1]],
      [t * M[1][0], (1 - t) * 1 + t * M[1][1]],
    ];
  },

  // Calculate Eigenvalues and Eigenvectors for 2x2 matrix
  eigen(M: Matrix2x2): EigenResult {
    const tr = this.trace(M);
    const d = this.det(M);
    const disc = tr * tr - 4 * d;

    if (disc >= -1e-12) {
      // Real eigenvalues
      const sqrtDisc = Math.sqrt(Math.max(0, disc));
      const lambda1 = (tr + sqrtDisc) / 2;
      const lambda2 = (tr - sqrtDisc) / 2;

      // Find eigenvector for lambda1: (M - lambda1 * I) v1 = 0
      const getEigenvector = (lambda: number): Vector2D => {
        const a = M[0][0] - lambda;
        const b = M[0][1];
        const c = M[1][0];
        const d_term = M[1][1] - lambda;

        // Try row 1: a*x + b*y = 0 => (x, y) ~ (-b, a) or (b, -a)
        if (Math.abs(b) > 1e-8 || Math.abs(a) > 1e-8) {
          return this.normalize([-b, a]);
        }
        // Try row 2: c*x + d_term*y = 0
        if (Math.abs(c) > 1e-8 || Math.abs(d_term) > 1e-8) {
          return this.normalize([-d_term, c]);
        }
        return [1, 0];
      };

      const v1 = getEigenvector(lambda1);
      let v2 = getEigenvector(lambda2);

      // If eigenvalues are identical and degenerate, find an orthogonal direction
      if (Math.abs(lambda1 - lambda2) < 1e-6) {
        v2 = [-v1[1], v1[0]];
      }

      return {
        isReal: true,
        values: [lambda1, lambda2],
        vectors: [v1, v2],
      };
    } else {
      // Complex conjugate eigenvalues: alpha +- beta * i
      const alpha = tr / 2;
      const beta = Math.sqrt(-disc) / 2;
      return {
        isReal: false,
        values: { real: alpha, imag: beta },
      };
    }
  },

  // Singular Value Decomposition: W = U * diag(sigma) * V^T
  svd(W: Matrix2x2): SVDResult {
    // S = W^T * W (symmetric positive semi-definite)
    const WT = this.transpose(W);
    const S = this.multiply(WT, W);

    // Compute eigenvalues and eigenvectors of S
    const eigenS = this.eigen(S);
    let sValues: [number, number];
    let vVectors: [Vector2D, Vector2D];

    if (eigenS.isReal && eigenS.vectors) {
      const vals = eigenS.values as [number, number];
      if (vals[0] >= vals[1]) {
        sValues = vals;
        vVectors = eigenS.vectors;
      } else {
        sValues = [vals[1], vals[0]];
        vVectors = [eigenS.vectors[1], eigenS.vectors[0]];
      }
    } else {
      // Fallback for extreme numerical edge cases
      sValues = [1, 1];
      vVectors = [[1, 0], [0, 1]];
    }

    const sigma1 = Math.sqrt(Math.max(0, sValues[0]));
    const sigma2 = Math.sqrt(Math.max(0, sValues[1]));

    const v1 = vVectors[0];
    const v2 = vVectors[1];

    // Compute U columns: u_i = W * v_i / sigma_i
    let u1: Vector2D;
    let u2: Vector2D;

    if (sigma1 > 1e-8) {
      const Wv1 = this.transformVector(W, v1);
      u1 = this.scaleVector(Wv1, 1 / sigma1);
    } else {
      u1 = [1, 0];
    }

    if (sigma2 > 1e-8) {
      const Wv2 = this.transformVector(W, v2);
      u2 = this.scaleVector(Wv2, 1 / sigma2);
    } else {
      // orthogonal to u1
      u2 = [-u1[1], u1[0]];
    }

    // Ensure U is a valid orthonormal rotation/reflection matrix
    u1 = this.normalize(u1);
    u2 = this.normalize(u2);

    const V: Matrix2x2 = [
      [v1[0], v2[0]],
      [v1[1], v2[1]],
    ];
    const VT = this.transpose(V);

    const U: Matrix2x2 = [
      [u1[0], u2[0]],
      [u1[1], u2[1]],
    ];

    return {
      U,
      singularValues: [sigma1, sigma2],
      V,
      VT,
    };
  },

  // Condition number: kappa = sigma_max / sigma_min
  conditionNumber(W: Matrix2x2): number {
    const svdRes = this.svd(W);
    const s1 = svdRes.singularValues[0];
    const s2 = Math.max(1e-12, svdRes.singularValues[1]);
    return s1 / s2;
  },

  // Interpolate SVD transformation matrix across 3 continuous stages: tau in [0, 3]
  // tau in [0, 1]: Stage 1 - Identity -> V^T (Orthogonal rotation/reflection)
  // tau in [1, 2]: Stage 2 - V^T -> Sigma * V^T (Diagonal scaling by singular values)
  // tau in [2, 3]: Stage 3 - Sigma * V^T -> U * Sigma * V^T = W (Final orthogonal rotation by U)
  interpolateSVDMatrix(W: Matrix2x2, tauSVD: number): Matrix2x2 {
    const svd = this.svd(W);
    const clampedTau = Math.max(0, Math.min(3, tauSVD));

    if (clampedTau <= 1.0) {
      // Stage 1: Interpolate from I to VT
      const t = clampedTau;
      return [
        [(1 - t) * 1 + t * svd.VT[0][0], t * svd.VT[0][1]],
        [t * svd.VT[1][0], (1 - t) * 1 + t * svd.VT[1][1]],
      ];
    } else if (clampedTau <= 2.0) {
      // Stage 2: VT -> Sigma * VT
      const t = clampedTau - 1.0;
      const s1 = (1 - t) * 1.0 + t * svd.singularValues[0];
      const s2 = (1 - t) * 1.0 + t * svd.singularValues[1];
      const Sigma_t: Matrix2x2 = [
        [s1, 0],
        [0, s2],
      ];
      return this.multiply(Sigma_t, svd.VT);
    } else {
      // Stage 3: Sigma * VT -> U * Sigma * VT
      const t = clampedTau - 2.0;
      const Sigma: Matrix2x2 = [
        [svd.singularValues[0], 0],
        [0, svd.singularValues[1]],
      ];
      const SigmaVT = this.multiply(Sigma, svd.VT);
      const U_t: Matrix2x2 = [
        [(1 - t) * 1 + t * svd.U[0][0], t * svd.U[0][1]],
        [t * svd.U[1][0], (1 - t) * 1 + t * svd.U[1][1]],
      ];
      return this.multiply(U_t, SigmaVT);
    }
  },

  // Get current ellipse principal semi-axes vectors and lengths for visualization
  getSVDEllipseAxes(W: Matrix2x2, tauSVD: number): {
    axis1: Vector2D;
    axis2: Vector2D;
    len1: number;
    len2: number;
  } {
    const svd = this.svd(W);
    const M = this.interpolateSVDMatrix(W, tauSVD);

    // Initial orthogonal singular basis vectors v1, v2
    const v1: Vector2D = [svd.V[0][0], svd.V[1][0]];
    const v2: Vector2D = [svd.V[0][1], svd.V[1][1]];

    const axis1 = this.transformVector(M, v1);
    const axis2 = this.transformVector(M, v2);

    return {
      axis1,
      axis2,
      len1: this.norm(axis1),
      len2: this.norm(axis2),
    };
  },
};
