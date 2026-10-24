import React from 'react';
import { Matrix2x2, Vector2D } from '../../math/types';
import { MathView } from './MathView';
import { RotateCw, Maximize2, Minimize2, AlertTriangle, Sparkles } from 'lucide-react';

interface MatrixEditorProps {
  W1: Matrix2x2;
  b1: Vector2D;
  onChangeW1: (newW1: Matrix2x2) => void;
  onChangeB1: (newB1: Vector2D) => void;
  disabled?: boolean;
}

export const MatrixEditor: React.FC<MatrixEditorProps> = ({
  W1,
  b1,
  onChangeW1,
  onChangeB1,
  disabled = false,
}) => {
  const updateCell = (row: 0 | 1, col: 0 | 1, val: number) => {
    const updated: Matrix2x2 = [
      [W1[0][0], W1[0][1]],
      [W1[1][0], W1[1][1]],
    ];
    updated[row][col] = isNaN(val) ? 0 : Math.max(-5, Math.min(5, val));
    onChangeW1(updated);
  };

  const updateBias = (idx: 0 | 1, val: number) => {
    const updated: Vector2D = [b1[0], b1[1]];
    updated[idx] = isNaN(val) ? 0 : Math.max(-5, Math.min(5, val));
    onChangeB1(updated);
  };

  // Presets for rapid mathematical experimentation
  const applyPreset = (preset: 'identity' | 'rotate45' | 'shear' | 'collapse' | 'reflect') => {
    if (disabled) return;
    switch (preset) {
      case 'identity':
        onChangeW1([[1.0, 0.0], [0.0, 1.0]]);
        onChangeB1([0.0, 0.0]);
        break;
      case 'rotate45': {
        const rad = Math.PI / 4;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        onChangeW1([[parseFloat(cos.toFixed(3)), parseFloat((-sin).toFixed(3))], [parseFloat(sin.toFixed(3)), parseFloat(cos.toFixed(3))]]);
        break;
      }
      case 'shear':
        onChangeW1([[1.0, 1.2], [0.0, 1.0]]);
        break;
      case 'collapse':
        // Singular matrix: det = 0
        onChangeW1([[1.0, 1.0], [1.0, 1.0]]);
        break;
      case 'reflect':
        onChangeW1([[-1.0, 0.0], [0.0, 1.0]]);
        break;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
          Layer 1 Affine Map <MathView math="W_1 x + b_1" className="text-cyber-cyan text-xs" />
        </label>
        <span className="text-[10px] text-slate-400 font-mono">Range: [-5, 5]</span>
      </div>

      {/* 2x2 Matrix & Bias Interactive Cockpit */}
      <div className="grid grid-cols-6 gap-2 items-center bg-[#0B101D] p-3 rounded-lg border border-[#1E2D4A]">
        {/* Left bracket */}
        <div className="col-span-4 grid grid-cols-2 gap-2 relative">
          <div className="absolute -left-1.5 top-0 bottom-0 w-1 border-l-2 border-t-2 border-b-2 border-cyber-cyan rounded-l opacity-80" />
          <div className="absolute -right-1.5 top-0 bottom-0 w-1 border-r-2 border-t-2 border-b-2 border-cyber-cyan rounded-r opacity-80" />

          {/* W11 */}
          <div className="flex flex-col">
            <span className="text-[9px] text-cyber-cyan font-mono mb-0.5">w₁₁</span>
            <input
              type="number"
              step="0.05"
              value={parseFloat(W1[0][0].toFixed(2))}
              onChange={e => updateCell(0, 0, parseFloat(e.target.value))}
              disabled={disabled}
              className="bg-[#131B2E] text-slate-100 font-mono text-xs px-2 py-1.5 rounded border border-[#2A374F] focus:border-cyber-cyan focus:outline-none text-center"
            />
          </div>

          {/* W12 */}
          <div className="flex flex-col">
            <span className="text-[9px] text-cyber-cyan font-mono mb-0.5">w₁₂</span>
            <input
              type="number"
              step="0.05"
              value={parseFloat(W1[0][1].toFixed(2))}
              onChange={e => updateCell(0, 1, parseFloat(e.target.value))}
              disabled={disabled}
              className="bg-[#131B2E] text-slate-100 font-mono text-xs px-2 py-1.5 rounded border border-[#2A374F] focus:border-cyber-cyan focus:outline-none text-center"
            />
          </div>

          {/* W21 */}
          <div className="flex flex-col">
            <span className="text-[9px] text-cyber-cyan font-mono mb-0.5">w₂₁</span>
            <input
              type="number"
              step="0.05"
              value={parseFloat(W1[1][0].toFixed(2))}
              onChange={e => updateCell(1, 0, parseFloat(e.target.value))}
              disabled={disabled}
              className="bg-[#131B2E] text-slate-100 font-mono text-xs px-2 py-1.5 rounded border border-[#2A374F] focus:border-cyber-cyan focus:outline-none text-center"
            />
          </div>

          {/* W22 */}
          <div className="flex flex-col">
            <span className="text-[9px] text-cyber-cyan font-mono mb-0.5">w₂₂</span>
            <input
              type="number"
              step="0.05"
              value={parseFloat(W1[1][1].toFixed(2))}
              onChange={e => updateCell(1, 1, parseFloat(e.target.value))}
              disabled={disabled}
              className="bg-[#131B2E] text-slate-100 font-mono text-xs px-2 py-1.5 rounded border border-[#2A374F] focus:border-cyber-cyan focus:outline-none text-center"
            />
          </div>
        </div>

        {/* Plus sign */}
        <div className="col-span-1 text-center font-bold text-slate-400 font-mono text-sm">+</div>

        {/* Bias Vector b1 */}
        <div className="col-span-1 flex flex-col gap-2 relative">
          <div className="absolute -left-1 top-0 bottom-0 w-0.5 border-l border-t border-b border-cyber-amber rounded-l" />
          <div className="absolute -right-1 top-0 bottom-0 w-0.5 border-r border-t border-b border-cyber-amber rounded-r" />

          <div className="flex flex-col">
            <span className="text-[9px] text-cyber-amber font-mono mb-0.5">b₁</span>
            <input
              type="number"
              step="0.05"
              value={parseFloat(b1[0].toFixed(2))}
              onChange={e => updateBias(0, parseFloat(e.target.value))}
              disabled={disabled}
              className="bg-[#131B2E] text-slate-100 font-mono text-xs px-1 py-1.5 rounded border border-[#2A374F] focus:border-cyber-amber focus:outline-none text-center"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-cyber-amber font-mono mb-0.5">b₂</span>
            <input
              type="number"
              step="0.05"
              value={parseFloat(b1[1].toFixed(2))}
              onChange={e => updateBias(1, parseFloat(e.target.value))}
              disabled={disabled}
              className="bg-[#131B2E] text-slate-100 font-mono text-xs px-1 py-1.5 rounded border border-[#2A374F] focus:border-cyber-amber focus:outline-none text-center"
            />
          </div>
        </div>
      </div>

      {/* Quick Linear Algebra Presets */}
      <div className="space-y-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Transform Presets:</span>
        <div className="grid grid-cols-5 gap-1 text-[10px]">
          <button
            onClick={() => applyPreset('identity')}
            disabled={disabled}
            className="px-1.5 py-1 rounded bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] hover:border-cyber-cyan text-slate-300 font-mono transition-colors text-center"
            title="Identity Matrix: No distortion"
          >
            Identity
          </button>
          <button
            onClick={() => applyPreset('rotate45')}
            disabled={disabled}
            className="px-1.5 py-1 rounded bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] hover:border-cyber-cyan text-slate-300 font-mono transition-colors text-center"
            title="Rotate 45 degrees"
          >
            45° Rot
          </button>
          <button
            onClick={() => applyPreset('shear')}
            disabled={disabled}
            className="px-1.5 py-1 rounded bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] hover:border-cyber-cyan text-slate-300 font-mono transition-colors text-center"
            title="Shear Transformation"
          >
            Shear
          </button>
          <button
            onClick={() => applyPreset('collapse')}
            disabled={disabled}
            className="px-1.5 py-1 rounded bg-[#131B2E] hover:bg-rose-950/40 border border-[#1E2D4A] hover:border-rose-500 text-rose-300 font-mono transition-colors text-center"
            title="Rank Collapse: det = 0"
          >
            Collapse
          </button>
          <button
            onClick={() => applyPreset('reflect')}
            disabled={disabled}
            className="px-1.5 py-1 rounded bg-[#131B2E] hover:bg-[#1C2844] border border-[#1E2D4A] hover:border-cyber-cyan text-slate-300 font-mono transition-colors text-center"
            title="Reflection across y-axis"
          >
            Reflect
          </button>
        </div>
      </div>
    </div>
  );
};
