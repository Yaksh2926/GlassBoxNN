# GlassBox NN — Explainable AI Through Pure Mathematics

> **"Open the Black Box. See the Mathematics."**  
> A competitive mathematics ideathon project for **MathX: A New Dimension of Mathematics**, organized by the **Infinity Society** at **Guru Tegh Bahadur Institute of Technology (GTBIT)**.

---

## 1. Product Vision & Proposition

Most neural network educational tools portray machine learning as a series of connected circles and arbitrary weight lines. **GlassBox NN** departs entirely from decorative representations by transforming every hidden operation—from affine transformations and non-linear folding to loss landscapes and gradient backpropagation—into an interactive mathematical playground rooted in **Linear Algebra, Topology, and Multivariable Calculus**.

### Key Educational Objectives
1. **Linear Algebra & Invariants:** Demystify matrix multiplication $z = Wx + b$ as continuous geometric rotations, shear, reflections, and scaling. Compute real-time determinants $\det(W)$, condition numbers $\kappa(W)$, and Singular Value Decompositions ($W = U \Sigma V^T$).
2. **Topological Space Folding (Cover's Theorem):** Visualize how non-linear activations (ReLU, Tanh, Sigmoid, Leaky ReLU) fold, crease, and bend the 2D Cartesian plane so that non-linearly separable datasets (XOR, Concentric Rings, Two Moons) become linearly separable by a single straight decision hyperplane.
3. **Multivariable Calculus & Loss Landscapes:** Explore the true Binary Cross-Entropy loss surface $\mathcal{L}(w_{11}, w_{22})$ in interactive 3D and high-resolution 2D contour maps. Calculate the $2 \times 2$ Hessian matrix $H = \nabla^2 \mathcal{L}$ and curvature eigenvalues $\mu_1, \mu_2$ to identify convex minima and saddle points.
4. **Simultaneous Optimizer Race:** Race **Vanilla SGD**, **Momentum (Heavy Ball)**, and **Adam** from the exact same starting point on the loss landscape to observe zig-zagging in ravines, momentum inertia, and adaptive scaling.
5. **Interactive Chain-Rule Engine:** Hover over any weight $w_{ij}$ to highlight the exact backward path from the Loss node $\mathcal{L}$ and render both the symbolic calculus formula and live floating-point factor products via KaTeX. Detect **Dead ReLUs** and vanishing gradient saturation in real-time.

---

## 2. Technology Stack & Architecture

- **Frontend & UI:** React 18, Vite 6, TypeScript 5, Tailwind CSS 3 (Dark Cyber-Math Aesthetic: Deep Slate `#090D16`, Neon Cyan `#00F5D4`, Electric Magenta `#FF2A85`, Amber `#F59E0B`, Violet `#8B5CF6`).
- **Typography & Math:** KaTeX for crisp dynamic equation rendering; Google Fonts (Inter, Fira Code, Outfit).
- **2D & 3D Visualization:** HTML5 Canvas (60fps continuous Homotopy space-folding engine) + Three.js WebGL (interactive 3D loss surface with orbit controls and lighting).
- **Zero-Dependency Math Engine:** Pure TypeScript implementation of 2D linear algebra, SVD solvers, characteristic polynomial eigenvalue finders, forward passes, analytical backpropagation, and finite-difference Hessian curvature.
- **Testing:** Vitest for mathematical unit tests and numerical gradient checking.

---

## 3. Project Directory Structure

```
GlassBoxNN/
├── index.html                     # HTML5 template with KaTeX and Google Fonts
├── package.json                   # Dependencies & scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Cyber-Math design tokens and color scheme
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler configuration
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── index.css                  # Core design system and glow styles
│   ├── App.tsx                    # 12-Column Scientific Cockpit Dashboard
│   ├── math/
│   │   ├── types.ts               # Mathematical data structures & interfaces
│   │   ├── linearAlgebra.ts       # SVD, eigenvalues/vectors, determinant, condition number
│   │   ├── activations.ts         # ReLU, Tanh, Sigmoid, Leaky ReLU & folding interpolation
│   │   ├── neuralEngine.ts        # Forward pass, BCE loss, analytical backprop, optimizers
│   │   ├── lossLandscape.ts       # 2D loss slice grid, Hessian curvature, optimizer race
│   │   ├── datasets.ts            # Seeded generators: XOR, Circles, Moons, Linear, Custom
│   │   └── __tests__/
│   │       └── math.test.ts       # Vitest test suite (10 automated unit tests)
│   └── components/
│       ├── common/
│       │   ├── MathView.tsx       # KaTeX dynamic math renderer
│       │   ├── MatrixEditor.tsx   # Interactive 2x2 matrix & bias cockpit
│       │   └── MathGuideModal.tsx # Educational mathematical reference modal
│       ├── layout/
│       │   └── Navbar.tsx         # Observatory navigation & branding
│       ├── story/
│       │   ├── StoryModeBar.tsx   # 5-Step guided hackathon pitch tour
│       │   └── PersonaExplanation.tsx # Dual-persona: "Explain Like I'm 12" vs "Math Judge"
│       ├── warper/
│       │   ├── ManifoldWarper2D.tsx # 60fps 2D space-folding canvas & homotopy scrubber
│       │   ├── SpectralHUD.tsx    # Live determinant, area scaling, eigenvalues, condition
│       │   └── SVDInspector.tsx   # W = U Σ V^T 3-step geometric decomposer
│       ├── loss/
│       │   └── LossLandscapeView.tsx # Three.js 3D surface, 2D contour, Hessian & race
│       ├── graph/
│       │   └── BackpropGraph.tsx  # Node-link backprop graph & chain-rule factor inspector
│       └── controls/
│           ├── DatasetPanel.tsx   # Preset selection & click-to-add point controls
│           └── TrainingPanel.tsx  # Live training loop, BCE loss, accuracy, confettis
```

---

## 4. Mathematical Algorithms Implemented

### A. Continuous Homotopy Space Folding
We define a continuous homotopy $H(x, \tau)$ for $\tau \in [0, 3]$:
- **$\tau \in [0, 1]$ (Affine Warp):**
  $$H(x, \tau) = (1 - \tau) x + \tau (W_1 x + b_1)$$
  Basis vectors $\hat{i} = (1, 0)$ and $\hat{j} = (0, 1)$ smoothly deform to the columns of $W_1$. The unit square area scales by $|\det((1-\tau)I + \tau W_1)|$.
- **$\tau \in [1, 2]$ (Non-Linear Folding):**
  $$H(x, \tau) = (2 - \tau) z_1 + (\tau - 1) \sigma(z_1)$$
  where $\sigma$ is ReLU, Tanh, Sigmoid, or Leaky ReLU. Negative preactivations are collapsed or bent, demonstrating Cover's Theorem.
- **$\tau \in [2, 3]$ (Decision Hyperplane):**
  The affine boundary $w_2^T a_1 + b_2 = 0$ is evaluated, showing that a straight hyperplane in feature space projects as a curved manifold in input space.

### B. Singular Value Decomposition ($W_1 = U \Sigma V^T$)
- $S = W_1^T W_1$ is symmetric positive semi-definite.
- Singular values $\sigma_1 = \sqrt{\lambda_1(S)}, \sigma_2 = \sqrt{\lambda_2(S)}$.
- $V$ contains the orthonormal eigenvectors of $S$.
- Columns of $U$ are $u_i = \frac{1}{\sigma_i} W_1 v_i$.
- Geometric decomposition: $V^T$ rotates input axes $\to$ $\Sigma$ stretches the unit circle into an ellipse with semi-axes $\sigma_1, \sigma_2$ $\to$ $U$ applies output rotation.

### C. Multivariable Calculus & Hessian Curvature
- Binary Cross-Entropy Loss:
  $$\mathcal{L} = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \ln(\hat{y}_i) + (1 - y_i) \ln(1 - \hat{y}_i) \right]$$
- Second-order $2 \times 2$ Hessian matrix $H = \nabla^2 \mathcal{L}$ evaluated via central finite differences:
  $$H_{11} = \frac{\partial^2 \mathcal{L}}{\partial p_1^2}, \quad H_{22} = \frac{\partial^2 \mathcal{L}}{\partial p_2^2}, \quad H_{12} = H_{21} = \frac{\partial^2 \mathcal{L}}{\partial p_1 \partial p_2}$$
- Curvature classification via Hessian eigenvalues $\mu_1, \mu_2$:
  - $\mu_1 > 0, \mu_2 > 0$: Local Minimum (Convex Bowl)
  - $\mu_1 < 0, \mu_2 < 0$: Local Maximum (Peak)
  - $\mu_1 \cdot \mu_2 < 0$: Saddle Point (Plateau)

### D. Analytical Backpropagation & The Chain Rule
Every gradient is computed via exact calculus derivatives without automatic differentiation libraries:
$$\frac{\partial \mathcal{L}}{\partial w_{11}} = \frac{\partial \mathcal{L}}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z_2} \cdot \frac{\partial z_2}{\partial a_{1,1}} \cdot \frac{\partial a_{1,1}}{\partial z_{1,1}} \cdot \frac{\partial z_{1,1}}{\partial w_{11}}$$
where:
- $\frac{\partial \mathcal{L}}{\partial \hat{y}} = \frac{\hat{y} - y}{\hat{y}(1 - \hat{y})}$
- $\frac{\partial \hat{y}}{\partial z_2} = \hat{y}(1 - \hat{y}) \implies \frac{\partial \mathcal{L}}{\partial z_2} = \hat{y} - y$
- $\frac{\partial z_2}{\partial a_{1,1}} = w_{2,1}$
- $\frac{\partial a_{1,1}}{\partial z_{1,1}} = \sigma'(z_{1,1})$
- $\frac{\partial z_{1,1}}{\partial w_{11}} = x_1$

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js version 18 or higher (v20+ recommended)
- npm version 9 or higher

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Open in your browser
# Default: http://localhost:3000 (or http://localhost:3001)
```

### Running Automated Tests
```bash
# Execute mathematical unit tests with Vitest
npm test
```

### Production Build
```bash
# Compile TypeScript & bundle production assets
npm run build

# Preview the production build locally
npm run preview
```

---

## 6. Recommended 3-Minute Live Hackathon Pitch Sequence for MathX Judges

1. **Step 1: The XOR Impossibility (0:00 - 0:40)**
   - Click **Step 1** on the top pitch tour bar.
   - Explain why Minsky & Papert's 1969 proof demonstrated that linear models fail on XOR: no affine hyperplane $w^T x + b = 0$ can separate diagonal coordinates in $\mathbb{R}^2$.
2. **Step 2: Linear Algebra & Rank Collapse (0:40 - 1:15)**
   - Click **Step 2** or select the **Rank Collapse Preset** in the Matrix Editor.
   - Show how $\det(W_1) = 0$ crushes the 2D Cartesian plane into a 1D line, permanently destroying classification capacity. Point out the Live Spectral HUD and condition number.
3. **Step 3: Space Folding via Non-Linear Activations (1:15 - 1:55)**
   - Click **Step 3** and press **"Play Folding"** or drag the Homotopy Scrubber $\tau$ from $1 \to 2$.
   - Show how ReLU creases the manifold along negative preactivations, untangling the XOR points so they become linearly separable (Cover's Theorem).
4. **Step 4: 3D Loss Landscapes & Optimizer Race (1:55 - 2:35)**
   - Switch to the **3D Loss Landscape** tab.
   - Explain the Hessian eigenvalues $\mu_1, \mu_2$ and click **"Race Optimizers"** to show SGD, Momentum, and Adam racing down the parameter valley.
5. **Step 5: The Chain Rule Engine & Live Backprop (2:35 - 3:00)**
   - Switch to the **Chain Rule Graph** tab.
   - Hover over $w_{11}$ to show the exact multivariable calculus chain formula and live floating-point factor products multiplying together. Show how a Dead ReLU extinguishes gradients.

---

## 7. License & Credits

Built for **MathX: A New Dimension of Mathematics**  
Organized by the **Infinity Society**, Guru Tegh Bahadur Institute of Technology (GTBIT).  
Developed with pure mathematics, TypeScript, React, and Three.js.
