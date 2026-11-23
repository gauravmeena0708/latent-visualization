import React, { useState } from 'react';
import { MoveRight, Database, Search } from 'lucide-react';

interface DataTableProps {
  dataset: Record<string, string | number>[];
  datasetName?: string;
  hasPrecomputed3D?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataset,
  datasetName = 'Source Data',
  hasPrecomputed3D = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (dataset.length === 0) {
    return (
      <div className="p-4 text-center text-[#8b949e] text-[12px]">
        No records available.
      </div>
    );
  }

  // Get preview columns (skip coordinates in the table preview if > 5 columns)
  const allColumns = Object.keys(dataset[0] || {});
  const displayColumns = allColumns.slice(0, 5);

  const filtered = dataset.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Source Data Preview */}
      <div className="flex flex-col">
        <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#58a6ff]" /> {datasetName} ({dataset.length} rows)
          </span>
        </div>

        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c0d0e] border border-[#30363d] text-[12px] text-[#e6edf3] pl-8 pr-3 py-1 rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#2f81f7]"
          />
        </div>

        <div className="max-h-[200px] overflow-x-auto overflow-y-auto custom-scrollbar border border-[#30363d] rounded-[6px] bg-[#0c0d0e]/50">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead className="sticky top-0 bg-[#161b22] shadow-sm">
              <tr>
                {displayColumns.map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="text-left p-2 border-b border-[#30363d] font-medium text-[#8b949e] capitalize whitespace-nowrap"
                  >
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                  {displayColumns.map((col) => {
                    const val = row[col];
                    const isNum = typeof val === 'number';
                    return (
                      <td
                        key={col}
                        className="p-2 border-b border-[#30363d]/40 text-[#e6edf3] whitespace-nowrap"
                      >
                        {isNum && col.toLowerCase().includes('income')
                          ? `$${Math.round(val / 1000)}k`
                          : typeof val === 'number'
                          ? Number.isInteger(val)
                            ? val
                            : val.toFixed(2)
                          : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={displayColumns.length} className="p-4 text-center text-[#8b949e]">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Pipelines */}
      <div className="flex flex-col">
        <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-2 flex items-center justify-between">
          <span>{hasPrecomputed3D ? 'Embedding Pipeline: Native' : 'Feature Pipelines: Simulated'}</span>
        </div>

        {hasPrecomputed3D ? (
          <div className="p-2.5 bg-[#238636]/10 border border-[#238636]/30 rounded-[6px] text-[12px] text-[#3fb950] leading-relaxed">
            ✓ Loaded precomputed 3D vectors directly from file. Visualizing true model latent space.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[12px] flex items-center justify-between">
              <span className="flex items-center text-[#e6edf3]">
                <span className="text-[#58a6ff] font-mono mr-1.5">[N]</span> Continuous Attributes
              </span>
              <span className="flex items-center text-[#8b949e] text-[11px] font-mono">
                <MoveRight className="w-3.5 h-3.5 mx-1" /> MinMax [-1, 1]
              </span>
            </div>
            <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[12px] flex items-center justify-between">
              <span className="flex items-center text-[#e6edf3]">
                <span className="text-[#3fb950] font-mono mr-1.5">[C]</span> Categorical Attributes
              </span>
              <span className="flex items-center text-[#8b949e] text-[11px] font-mono">
                <MoveRight className="w-3.5 h-3.5 mx-1" /> Embedding Hash
              </span>
            </div>
            <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[12px] flex items-center justify-between">
              <span className="flex items-center text-[#e6edf3]">
                <span className="text-[#d29922] font-mono mr-1.5">[Σ]</span> Bottleneck Projection
              </span>
              <span className="flex items-center text-[#8b949e] text-[11px] font-mono">
                <MoveRight className="w-3.5 h-3.5 mx-1" /> Latent ℝ³
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
