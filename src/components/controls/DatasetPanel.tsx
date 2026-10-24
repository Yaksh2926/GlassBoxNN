import React from 'react';
import { Point2D } from '../../math/types';
import { Datasets, DatasetPreset } from '../../math/datasets';
import { Database, Plus, Undo2, Trash2, RotateCcw, HelpCircle } from 'lucide-react';

interface DatasetPanelProps {
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  dataset: Point2D[];
  activeClass: 0 | 1;
  onSetActiveClass: (cls: 0 | 1) => void;
  onUndoPoint: () => void;
  onClearDataset: () => void;
  onResetDataset: () => void;
}

export const DatasetPanel: React.FC<DatasetPanelProps> = ({
  currentPreset,
  onSelectPreset,
  dataset,
  activeClass,
  onSetActiveClass,
  onUndoPoint,
  onClearDataset,
  onResetDataset,
}) => {
  const count0 = dataset.filter(p => p.label === 0).length;
  const count1 = dataset.filter(p => p.label === 1).length;
  const explanation = Datasets.getExplanation(currentPreset);

  return (
    <div className="bg-[#0E1524] rounded-xl border border-[#1E2D4A] p-3 space-y-3 shadow-glass">
      <div className="flex items-center justify-between border-b border-[#1E2D4A]/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyber-cyan" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Dataset Playground
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          N = {dataset.length} samples
        </span>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
        <button
          onClick={() => onSelectPreset('xor')}
          className={`px-2 py-1.5 rounded border transition-colors text-left flex items-center justify-between ${
            currentPreset === 'xor'
              ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
              : 'bg-[#131B2E] border-[#2A374F] text-slate-300 hover:text-white'
          }`}
        >
          <span>1. XOR Gate</span>
          <span className="text-[9px] opacity-70">Non-linear</span>
        </button>

        <button
          onClick={() => onSelectPreset('circles')}
          className={`px-2 py-1.5 rounded border transition-colors text-left flex items-center justify-between ${
            currentPreset === 'circles'
              ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
              : 'bg-[#131B2E] border-[#2A374F] text-slate-300 hover:text-white'
          }`}
        >
          <span>2. Concentric</span>
          <span className="text-[9px] opacity-70">Radial</span>
        </button>

        <button
          onClick={() => onSelectPreset('moons')}
          className={`px-2 py-1.5 rounded border transition-colors text-left flex items-center justify-between ${
            currentPreset === 'moons'
              ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
              : 'bg-[#131B2E] border-[#2A374F] text-slate-300 hover:text-white'
          }`}
        >
          <span>3. Two Moons</span>
          <span className="text-[9px] opacity-70">Interlocking</span>
        </button>

        <button
          onClick={() => onSelectPreset('linear')}
          className={`px-2 py-1.5 rounded border transition-colors text-left flex items-center justify-between ${
            currentPreset === 'linear'
              ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold'
              : 'bg-[#131B2E] border-[#2A374F] text-slate-300 hover:text-white'
          }`}
        >
          <span>4. Linear Blob</span>
          <span className="text-[9px] opacity-70">Separable</span>
        </button>
      </div>

      {/* Manual Point Adding Bar */}
      <div className="bg-[#131B2E] p-2.5 rounded-lg border border-[#2A374F] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-300 font-semibold uppercase">Add Point On Click:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSetActiveClass(0)}
              className={`px-2 py-0.5 rounded font-bold border transition-colors flex items-center gap-1 ${
                activeClass === 0
                  ? 'bg-cyber-cyan/25 border-cyber-cyan text-cyber-cyan shadow-sm'
                  : 'bg-[#0B101D] border-[#1E2D4A] text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyber-cyan" /> Class 0 ({count0})
            </button>
            <button
              onClick={() => onSetActiveClass(1)}
              className={`px-2 py-0.5 rounded font-bold border transition-colors flex items-center gap-1 ${
                activeClass === 1
                  ? 'bg-cyber-magenta/25 border-cyber-magenta text-cyber-magenta shadow-sm'
                  : 'bg-[#0B101D] border-[#1E2D4A] text-slate-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyber-magenta" /> Class 1 ({count1})
            </button>
          </div>
        </div>

        {/* Dataset Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
          <button
            onClick={onUndoPoint}
            disabled={dataset.length === 0}
            className="p-1 rounded bg-[#0B101D] hover:bg-[#1C2844] border border-[#1E2D4A] text-slate-300 flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Undo2 className="w-3 h-3" /> Undo Point
          </button>
          <button
            onClick={onClearDataset}
            disabled={dataset.length === 0}
            className="p-1 rounded bg-[#0B101D] hover:bg-rose-950/40 border border-[#1E2D4A] hover:border-rose-500/50 text-rose-300 flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
          <button
            onClick={onResetDataset}
            className="p-1 rounded bg-[#0B101D] hover:bg-[#1C2844] border border-[#1E2D4A] text-cyber-cyan flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Preset
          </button>
        </div>
      </div>

      {/* Dataset Topological Difficulty Note */}
      <div className="bg-[#0B101D] p-2 rounded-lg border border-[#1E2D4A] text-[10px] font-mono space-y-1">
        <div className="flex items-center gap-1 text-cyber-cyan font-bold">
          <HelpCircle className="w-3 h-3" />
          <span>{explanation.title}</span>
        </div>
        <p className="text-slate-400 leading-tight">{explanation.mathReason}</p>
      </div>
    </div>
  );
};
