import React, { useState } from 'react';
import { DataRow } from '../types';
import { MoveRight, Database, Search } from 'lucide-react';

interface DataTableProps {
  dataset: DataRow[];
}

export const DataTable: React.FC<DataTableProps> = ({ dataset }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = dataset.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      row.job_sector.toLowerCase().includes(term) ||
      row.region.toLowerCase().includes(term) ||
      String(row.age).includes(term) ||
      String(row.income).includes(term) ||
      String(row.id).includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Source Data Preview */}
      <div className="flex flex-col">
        <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#58a6ff]" /> Source Data ({dataset.length} rows)
          </span>
        </div>

        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            placeholder="Filter sector, region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0c0d0e] border border-[#30363d] text-[12px] text-[#e6edf3] pl-8 pr-3 py-1 rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#2f81f7]"
          />
        </div>

        <div className="max-h-[200px] overflow-y-auto custom-scrollbar border border-[#30363d] rounded-[6px] bg-[#0c0d0e]/50">
          <table className="w-full border-collapse font-mono text-[11px]">
            <thead className="sticky top-0 bg-[#161b22] shadow-sm">
              <tr>
                <th scope="col" className="text-left text-[#8b949e] p-2 border-b border-[#30363d] font-medium">ID</th>
                <th scope="col" className="text-left p-2 border-b border-[#30363d] font-medium text-[#58a6ff]">Age</th>
                <th scope="col" className="text-left p-2 border-b border-[#30363d] font-medium text-[#58a6ff]">Income</th>
                <th scope="col" className="text-left p-2 border-b border-[#30363d] font-medium text-[#3fb950]">Sector</th>
                <th scope="col" className="text-left p-2 border-b border-[#30363d] font-medium text-[#3fb950]">Region</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 15).map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-2 border-b border-[#30363d]/40 text-[#8b949e]">
                    #{String(row.id).padStart(3, '0')}
                  </td>
                  <td className="p-2 border-b border-[#30363d]/40 text-[#e6edf3]">{row.age}</td>
                  <td className="p-2 border-b border-[#30363d]/40 text-[#e6edf3]">
                    ${Math.round(row.income / 1000)}k
                  </td>
                  <td className="p-2 border-b border-[#30363d]/40">
                    <span
                      className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase ${
                        row.job_sector === 'Tech'
                          ? 'bg-[#2f81f7]/15 text-[#58a6ff]'
                          : row.job_sector === 'Finance'
                          ? 'bg-[#238636]/15 text-[#3fb950]'
                          : 'bg-[#d29922]/15 text-[#d29922]'
                      }`}
                    >
                      {row.job_sector}
                    </span>
                  </td>
                  <td className="p-2 border-b border-[#30363d]/40 text-[#c9d1d9]">{row.region}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-[#8b949e]">
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
          <span>Feature Pipelines</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[12px] flex items-center justify-between">
            <span className="flex items-center text-[#e6edf3]">
              <span className="text-[#58a6ff] font-mono mr-1.5">[N]</span> Continuous (Age, Income)
            </span>
            <span className="flex items-center text-[#8b949e] text-[11px] font-mono">
              <MoveRight className="w-3.5 h-3.5 mx-1" /> MinMax [-1, 1]
            </span>
          </div>
          <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[12px] flex items-center justify-between">
            <span className="flex items-center text-[#e6edf3]">
              <span className="text-[#3fb950] font-mono mr-1.5">[C]</span> Categorical (Sector, Region)
            </span>
            <span className="flex items-center text-[#8b949e] text-[11px] font-mono">
              <MoveRight className="w-3.5 h-3.5 mx-1" /> One-Hot / Latent
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
      </div>
    </div>
  );
};
