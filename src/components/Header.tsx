import React from 'react';
import { Layers, RotateCcw, HelpCircle, Menu, X, ChevronDown, Upload, Undo2 } from 'lucide-react';
import { ModelType } from '../types';
import { MODEL_INTUITIONS } from '../constants';

interface HeaderProps {
  modelType: ModelType;
  onModelChange: (model: ModelType) => void;
  onRegenerate: () => void;
  onOpenInfo: () => void;
  onOpenUpload: () => void;
  isCustomData: boolean;
  onResetCustomData: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modelType,
  onModelChange,
  onRegenerate,
  onOpenInfo,
  onOpenUpload,
  isCustomData,
  onResetCustomData,
  sidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="h-[60px] px-4 md:px-6 shrink-0 flex items-center justify-between border-b border-[#30363d] bg-[#161b22]/90 backdrop-blur-md z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="md:hidden p-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2f81f7]"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="w-8 h-8 bg-gradient-to-br from-[#1f6feb] to-[#238636] rounded-[6px] flex items-center justify-center text-white shadow-sm">
          <Layers className="w-5 h-5" aria-hidden="true" />
        </div>

        <div>
          <h1 className="text-[16px] md:text-[18px] font-semibold tracking-tight text-[#e6edf3] flex items-center gap-2">
            Latent Space Explorer
            {isCustomData ? (
              <span className="px-2 py-0.5 text-[11px] font-mono text-[#3fb950] bg-[#238636]/15 border border-[#238636]/30 rounded-full">
                Custom Dataset
              </span>
            ) : (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-[#58a6ff] bg-[#1f6feb]/15 border border-[#1f6feb]/30 rounded-full">
                v1.0
              </span>
            )}
          </h1>
          <p className="hidden md:block text-[11px] text-[#8b949e]">
            {isCustomData
              ? 'Analyzing custom imported data'
              : 'Multi-model representation simulator for mixed tabular data'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="model-select" className="hidden lg:block text-[12px] text-[#8b949e] font-medium uppercase tracking-wider">
            Model
          </label>
          <div className="relative">
            <select
              id="model-select"
              aria-label="Select latent model"
              className="appearance-none bg-[#0c0d0e] border border-[#30363d] text-[#e6edf3] text-[13px] rounded-[6px] pl-3 pr-8 py-1.5 outline-none cursor-pointer hover:border-[#8b949e] focus:ring-2 focus:ring-[#2f81f7] transition-all"
              value={modelType}
              onChange={(e) => onModelChange(e.target.value as ModelType)}
            >
              {Object.keys(MODEL_INTUITIONS).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e] pointer-events-none" />
          </div>
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={onOpenUpload}
          title="Upload custom CSV or latent vector data"
          aria-label="Upload custom CSV data"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium rounded-[6px] transition focus:outline-none focus:ring-2 focus:ring-[#2ea043]"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Data</span>
        </button>

        {/* Reseed or Reset */}
        {isCustomData ? (
          <button
            type="button"
            onClick={onResetCustomData}
            title="Reset to default sample dataset"
            aria-label="Reset to default dataset"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#d29922] text-[13px] rounded-[6px] border border-[#30363d] focus:outline-none transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onRegenerate}
            title="Regenerate random seed for dataset"
            aria-label="Regenerate random seed"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-[13px] rounded-[6px] border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reseed</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenInfo}
          title="About and Documentation"
          aria-label="Open documentation"
          className="p-1.5 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-[6px] border border-transparent hover:border-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#2f81f7] transition"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
