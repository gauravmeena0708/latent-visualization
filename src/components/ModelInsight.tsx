import React from 'react';
import { ModelType } from '../types';
import { MODEL_INTUITIONS } from '../constants';
import { Info, Activity } from 'lucide-react';

interface ModelInsightProps {
  modelType: ModelType;
  datasetCount: number;
}

export const ModelInsight: React.FC<ModelInsightProps> = ({ modelType, datasetCount }) => {
  const modelInfo = MODEL_INTUITIONS[modelType];

  return (
    <footer className="border-t border-[#30363d] bg-[#161b22] px-4 md:px-6 py-4 shrink-0 flex flex-col md:flex-row gap-4 md:gap-6 z-20">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#58a6ff]" /> Mathematical Objective & Intuition
        </div>

        <div className="bg-[#0c0d0e]/60 p-3.5 rounded-[8px] border border-[#30363d] flex flex-col justify-center">
          <div className="font-mono text-[#58a6ff] text-[13px] md:text-[14px] overflow-x-auto pb-1">
            {modelInfo.formula}
          </div>
          <p className="text-[12px] text-[#c9d1d9] mt-2 leading-relaxed">
            {modelInfo.description}
          </p>
          <p className="text-[11px] text-[#8b949e] mt-1.5">
            <strong className="text-[#3fb950]">Key feature:</strong> {modelInfo.keyStrengths}
          </p>
        </div>
      </div>

      <div className="w-full md:w-[280px] shrink-0 flex flex-col">
        <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#3fb950]" /> Manifold Telemetry
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="bg-[#0c0d0e]/60 p-3 rounded-[6px] border border-[#30363d] flex flex-col justify-center">
            <div className="text-[16px] font-semibold font-mono text-[#3fb950]">Active</div>
            <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mt-0.5">Projection Status</div>
          </div>
          <div className="bg-[#0c0d0e]/60 p-3 rounded-[6px] border border-[#30363d] flex flex-col justify-center">
            <div className="text-[16px] font-semibold font-mono text-[#e6edf3]">{datasetCount}</div>
            <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mt-0.5">3D Vectors</div>
          </div>
          <div className="bg-[#0c0d0e]/60 p-3 rounded-[6px] border border-[#30363d] flex flex-col justify-center col-span-2">
            <div className="text-[12px] font-mono text-[#58a6ff] truncate">{modelInfo.title}</div>
            <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mt-0.5">Selected Algorithm</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
