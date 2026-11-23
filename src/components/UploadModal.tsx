import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { parseCSV, ParsedDataset } from '../lib/csvParser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (parsed: ParsedDataset) => void;
}

const SAMPLE_3D_CSV = `id,label,category,score,x,y,z
1,Sample_Alpha,Group_A,88.5,1.24,-0.85,0.42
2,Sample_Beta,Group_A,92.1,1.52,-0.71,0.61
3,Sample_Gamma,Group_B,64.2,-1.32,1.45,-0.88
4,Sample_Delta,Group_B,58.0,-1.48,1.20,-0.95
5,Sample_Epsilon,Group_C,76.3,0.12,0.34,1.82
6,Sample_Zeta,Group_C,81.9,0.25,0.18,1.65`;

const SAMPLE_TABULAR_CSV = `id,customer_age,annual_spending,membership_tier,store_region
1,29,48500,Gold,East
2,45,82000,Platinum,West
3,22,23000,Bronze,North
4,38,61000,Silver,East
5,54,95000,Platinum,South
6,31,41000,Silver,North`;

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onDatasetLoaded }) => {
  const [csvContent, setCsvContent] = useState('');
  const [parsed, setParsed] = useState<ParsedDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string, filename = 'custom_data.csv') => {
    setCsvContent(text);
    setError(null);
    if (!text.trim()) {
      setParsed(null);
      return;
    }
    try {
      const result = parseCSV(text, filename);
      setParsed(result);
    } catch (err: unknown) {
      setParsed(null);
      setError(err instanceof Error ? err.message : 'Invalid CSV structure');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleTextChange(text, file.name);
    };
    reader.onerror = () => {
      setError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleApply = () => {
    if (!parsed) return;
    onDatasetLoaded(parsed);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div className="bg-[#161b22] border border-[#30363d] rounded-[10px] max-w-2xl w-full p-6 text-[#e6edf3] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-[#8b949e] hover:text-white p-1 rounded-md focus:ring-2 focus:ring-[#2f81f7] outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#238636] flex items-center justify-center text-white">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h2 id="upload-title" className="text-[17px] font-semibold text-white">
              Load Custom Latent Data / Tabular Dataset
            </h2>
            <p className="text-[12px] text-[#8b949e]">
              Upload your own CSV or paste data to inspect custom representations in 3D
            </p>
          </div>
        </div>

        {/* Templates quick action */}
        <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-[#0c0d0e]/60 rounded-[8px] border border-[#30363d] text-[12px]">
          <span className="text-[#8b949e] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#d29922]" /> Load Sample Template:
          </span>
          <button
            type="button"
            onClick={() => handleTextChange(SAMPLE_3D_CSV, 'precomputed_3d_latent.csv')}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[#58a6ff] rounded-[4px] border border-[#30363d] transition"
          >
            Precomputed Latent Space (x, y, z)
          </button>
          <button
            type="button"
            onClick={() => handleTextChange(SAMPLE_TABULAR_CSV, 'raw_tabular_data.csv')}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[#3fb950] rounded-[4px] border border-[#30363d] transition"
          >
            Raw Multi-feature Tabular CSV
          </button>
        </div>

        {/* File Drag/Drop or Browse */}
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-[#30363d] hover:border-[#58a6ff] rounded-[8px] bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <FileText className="w-6 h-6 text-[#58a6ff]" />
            <span className="text-[13px] font-medium text-[#c9d1d9]">Click to choose a .CSV file from your computer</span>
            <span className="text-[11px] text-[#8b949e]">Supports pre-trained embeddings or raw multi-attribute tables</span>
          </button>
        </div>

        {/* Or Paste CSV Area */}
        <div className="mb-4 flex flex-col flex-1">
          <label htmlFor="csv-input" className="text-[11px] text-[#8b949e] uppercase font-bold tracking-wider mb-1">
            Or Paste Raw CSV Data Below:
          </label>
          <textarea
            id="csv-input"
            rows={5}
            value={csvContent}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="col1,col2,col3,x,y,z&#10;val1,val2,val3,1.2,-0.5,0.8"
            className="w-full bg-[#0c0d0e] border border-[#30363d] rounded-[6px] p-2.5 font-mono text-[11px] text-[#e6edf3] focus:ring-1 focus:ring-[#2f81f7] outline-none"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-[6px] flex items-center gap-2 text-[#f85149] text-[12px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Parsed Summary */}
        {parsed && (
          <div className="mb-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-[6px] text-[12px]">
            <div className="flex items-center gap-2 text-[#3fb950] font-semibold mb-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Parsed {parsed.rows.length} rows successfully ({parsed.columns.length} columns)</span>
            </div>
            <div className="text-[#8b949e] space-y-0.5">
              <p>
                <strong>Columns:</strong> {parsed.columns.join(', ')}
              </p>
              {parsed.hasPrecomputed3D ? (
                <p className="text-[#58a6ff]">
                  ✓ 3D coordinates detected: <strong>({parsed.coordColumns?.x}, {parsed.coordColumns?.y}, {parsed.coordColumns?.z})</strong>. Displaying true model embeddings.
                </p>
              ) : (
                <p className="text-[#d29922]">
                  ℹ No 3D coordinate headers found. Raw tabular attributes will be mapped into ℝ³ via the active simulator algorithm.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-[#30363d] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-[12px] font-medium rounded-[6px] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!parsed || parsed.rows.length === 0}
            className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-[12px] font-medium rounded-[6px] transition focus:ring-2 focus:ring-[#2ea043] outline-none"
          >
            Load Into 3D Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
