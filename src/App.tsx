/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Database, Binary, Component, Fingerprint, Layers, MoveRight, ChevronDown } from 'lucide-react';

// --- MATH & UTILS --- //

// Box-Muller transform for standard normal distribution N(0,1)
const randomG = () => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const SECTORS = ['Tech', 'Health', 'Finance'];
const REGIONS = ['North', 'South', 'East', 'West'];

// Map sector to specific brand colors for the scatter plot
const SECTOR_COLORS: Record<string, string> = {
  'Tech': '#58a6ff',    // Blue
  'Health': '#d29922',  // Gold/Amber
  'Finance': '#3fb950', // Green
};

// Map models to their mathematical intuition texts
const MODEL_INTUITIONS: Record<string, { title: string, formula: string, description: string }> = {
  'VAE': {
    title: 'Variational Autoencoder (VAE)',
    formula: 'L = || x - x\u0302 ||\u00B2 + \u03B2 \u00B7 D_{KL}( q(z|x) || P(z) )',
    description: 'The Evidence Lower Bound (ELBO) forces the latent space to approximate a continuous multivariate Gaussian prior (usually N(0, I)). The KL Divergence acts as a regularizer, forcing clusters to overlap smoothly. This enables seamless generative interpolation without disjointed gaps.'
  },
  'Standard Autoencoder': {
    title: 'Deterministic Autoencoder',
    formula: 'L = MSE(x, Decoder(Encoder(x)))',
    description: 'Maps data to a latent bottleneck purely to minimize reconstruction error. Because there are no geometric priors or mathematical constraints on the latent distribution, the network learns to scatter data arbitrarily. This leads to a disjointed, non-smooth latent space with sparse \"dead zones\".'
  },
  'PCA': {
    title: 'Principal Component Analysis',
    formula: 'argmax_W Tr(W^T Cov(X) W)',
    description: 'A linear dimensionality reduction technique. PCA finds orthogonal axes (eigenvectors) that maximize the variance of the data. The resulting latent space shows a rigid, flat, linear spread of the principal components.'
  },
  'UMAP/t-SNE': {
    title: 'Manifold Learning (UMAP / t-SNE)',
    formula: 'Cost = \u03A3 P_{ij} log(P_{ij} / Q_{ij})',
    description: 'These manifold learning algorithms minimize the Kullback-Leibler divergence between neighborhood probabilities in the high-dimensional space vs low-dimensional space. They prioritize preserving local topological structure, creating visually striking, hyper-separated non-linear "islands" based on categorical similarities.'
  }
};

type DataRow = {
  id: number;
  age: number;
  income: number;
  job_sector: string;
  region: string;
};

type LatentPoint = DataRow & {
  x: number;
  y: number;
  z: number;
};

export default function App() {
  const [modelType, setModelType] = useState<string>('VAE');
  const plotRef = useRef<HTMLDivElement>(null);

  // --- 1. DATA GENERATION (Mock Tabular Data) --- //
  const dataset = useMemo<DataRow[]>(() => {
    return Array.from({ length: 150 }, (_, i) => {
      const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const age = 22 + Math.floor(Math.random() * 40); // 22 to 61
      const income = 40000 + Math.floor(Math.random() * 120000); // 40k to 160k
      return { id: i, age, income, job_sector: sector, region };
    });
  }, []);

  // --- 2. LATENT SPACE SIMULATION --- //
  // Function to simulate how different models structure the latent coordinates
  const latentCoordinates = useMemo<LatentPoint[]>(() => {
    return dataset.map(d => {
      let x = 0, y = 0, z = 0;
      const sIdx = SECTORS.indexOf(d.job_sector);
      const rIdx = REGIONS.indexOf(d.region);

      // Feature Normalization [0, 1]
      const ageN = (d.age - 22) / 40;
      const incN = (d.income - 40000) / 120000;

      if (modelType === 'PCA') {
        // PCA simulates a linear transformation spread out mostly along a plane
        x = ageN * 5 + incN * 10 + sIdx * 2;
        y = incN * -6 + rIdx * 3;
        z = ageN * 2 + incN * 2 + sIdx * 1.5;
        
      } else if (modelType === 'Standard Autoencoder') {
        // Arbitrary dense non-linear mapping 
        x = Math.sin(sIdx * 2.1 + ageN * 10) * 8 + (Math.random() - 0.5) * 6;
        y = Math.cos(rIdx * 1.5 - incN * 8) * 8 + (Math.random() - 0.5) * 6;
        z = Math.sin(incN * 5 + sIdx * 3) * 8 + (Math.random() - 0.5) * 6;

      } else if (modelType === 'VAE') {
        // VAE simulates spherical Gaussians attempting to fit a standard normal prior N(0,I)
        // Means clustered closely around the origin
        const cx = (sIdx - 1) * 2.5; 
        const cy = (rIdx - 1.5) * 1.5;
        const cz = (d.age > 40 ? 1 : -1) * 1.5;
        
        // Emphasized dense Gaussian noise sampling
        x = cx + randomG() * 1.8;
        y = cy + randomG() * 1.8;
        z = cz + randomG() * 1.8;

      } else if (modelType === 'UMAP/t-SNE') {
        // Manifold mapping creates extreme separation of topological "islands"
        const angle = sIdx * Math.PI * 0.66;
        const radius = 18;
        const cx = Math.cos(angle) * (radius + rIdx * 2);
        const cy = Math.sin(angle) * (radius + rIdx * 2);
        const cz = (rIdx - 1.5) * 8;
        
        const noiseScale = 0.5 + (Math.random() * 0.5);
        x = cx + randomG() * 2 * noiseScale;
        y = cy + randomG() * 2 * noiseScale;
        z = cz + randomG() * 2 * noiseScale;
      }

      return { ...d, x, y, z };
    });
  }, [dataset, modelType]);

  // --- 3. PLOTLY INTEGRATION --- //
  useEffect(() => {
    let plotRetries = 0;

    const renderPlot = () => {
      // @ts-ignore
      if (!window.Plotly) {
        if (plotRetries < 20) {
          plotRetries++;
          setTimeout(renderPlot, 100);
        }
        return;
      }

      const trace = {
        x: latentCoordinates.map(d => d.x),
        y: latentCoordinates.map(d => d.y),
        z: latentCoordinates.map(d => d.z),
        mode: 'markers',
        marker: {
          // Map Income to Size (min 5, max 16)
          size: latentCoordinates.map(d => 5 + ((d.income - 40000) / 120000) * 11),
          // Map Sector to Color
          color: latentCoordinates.map(d => SECTOR_COLORS[d.job_sector]),
          opacity: 0.8,
          line: { width: 0.5, color: '#ffffff' }
        },
        type: 'scatter3d',
        text: latentCoordinates.map(d => 
          `<b>Row ID:</b> ${d.id}<br>` +
          `<b>Age:</b> ${d.age}<br>` +
          `<b>Income:</b> $${d.income.toLocaleString()}<br>` +
          `<b>Sector:</b> ${d.job_sector}<br>` +
          `<b>Region:</b> ${d.region}`
        ),
        hoverinfo: 'text'
      };

      const layout = {
        autosize: true,
        uirevision: 'true', // Critical: prevents camera from resetting on re-renders
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        scene: {
          xaxis: { backgroundcolor: 'transparent', gridcolor: '#30363d', showbackground: false, zerolinecolor: '#30363d', title: 'Latent z₁', tickfont: { color: '#8b949e' }, titlefont: { color: '#8b949e' } },
          yaxis: { backgroundcolor: 'transparent', gridcolor: '#30363d', showbackground: false, zerolinecolor: '#30363d', title: 'Latent z₂', tickfont: { color: '#8b949e' }, titlefont: { color: '#8b949e' } },
          zaxis: { backgroundcolor: 'transparent', gridcolor: '#30363d', showbackground: false, zerolinecolor: '#30363d', title: 'Latent z₃', tickfont: { color: '#8b949e' }, titlefont: { color: '#8b949e' } },
          camera: {
            // Give a nice default isometric viewing angle
            eye: {x: 1.5, y: 1.5, z: 1.2}
          }
        },
        hoverlabel: { bgcolor: '#161b22', font: { color: '#e6edf3', family: 'Inter' }, bordercolor: '#30363d' }
      };

      const config = { responsive: true, displayModeBar: false };
      
      // @ts-ignore
      window.Plotly.react(plotRef.current, [trace], layout, config);
    };

    renderPlot();
  }, [latentCoordinates]);


  // --- UI COMPONENTS --- //
  return (
    <div className="h-screen bg-[#0c0d0e] text-[#e6edf3] font-sans flex flex-col overflow-hidden">
      
      {/* HEADER & CONTROL BAR */}
      <header className="h-[56px] px-6 shrink-0 flex items-center justify-between border-b border-[#30363d] bg-[#161b22]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#2f81f7] rounded-[4px] flex items-center justify-center text-white">
            <Layers className="w-4 h-4" />
          </div>
          <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-[#e6edf3] flex items-center">
            Mixed Data Latent Space Explorer
            <span className="font-light opacity-50 text-[14px] ml-2 font-mono">v2.4</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-[12px] text-[#8b949e] font-medium uppercase tracking-[0.05em]">Active Latent Model</label>
          <div className="relative">
            <select 
              className="appearance-none bg-[#0c0d0e] border border-[#30363d] text-[#e6edf3] text-[13px] rounded-[6px] pl-3 pr-8 py-1.5 outline-none cursor-pointer min-w-[180px]"
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
            >
              {Object.keys(MODEL_INTUITIONS).map((modelName) => (
                <option key={modelName} value={modelName}>{modelName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e] pointer-events-none" />
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Data & Processing */}
        <aside className="w-[320px] shrink-0 border-r border-[#30363d] bg-[#161b22] flex flex-col p-4 gap-5 overflow-y-auto custom-scrollbar">
          
          {/* Mock Tabular Data */}
          <div className="flex flex-col">
            <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#30363d]">
              Source Mixed Data
            </div>
            
            <table className="w-full border-collapse font-mono text-[10px]">
              <thead>
                <tr>
                  <th className="text-left text-[#8b949e] p-2 border-b border-[#30363d] font-normal">ID</th>
                  <th className="text-left p-2 border-b border-[#30363d] font-normal text-[#2f81f7]">Age</th>
                  <th className="text-left p-2 border-b border-[#30363d] font-normal text-[#2f81f7]">Income</th>
                  <th className="text-left p-2 border-b border-[#30363d] font-normal text-[#238636]">Sector</th>
                  <th className="text-left p-2 border-b border-[#30363d] font-normal text-[#238636]">Region</th>
                </tr>
              </thead>
              <tbody>
                {dataset.slice(0, 5).map(row => (
                  <tr key={row.id}>
                    <td className="p-2 border-b border-dashed border-[#30363d]/50 text-[#e6edf3]">#{String(row.id).padStart(3, '0')}</td>
                    <td className="p-2 border-b border-dashed border-[#30363d]/50 text-[#e6edf3]">{row.age}</td>
                    <td className="p-2 border-b border-dashed border-[#30363d]/50 text-[#e6edf3]">{Math.round(row.income/1000)}k</td>
                    <td className="p-2 border-b border-dashed border-[#30363d]/50">
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase ${row.job_sector === 'Tech' ? 'bg-[#2f81f7]/15 text-[#58a6ff]' : row.job_sector === 'Finance' ? 'bg-[#238636]/15 text-[#3fb950]' : 'bg-[#d29922]/15 text-[#d29922]'}`}>
                        {row.job_sector}
                      </span>
                    </td>
                    <td className="p-2 border-b border-dashed border-[#30363d]/50 text-[#e6edf3]">{row.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Encoding Logic */}
          <div className="flex flex-col">
            <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#30363d]">
              Embedding Pipelines
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[11px] flex items-center">
                <span className="text-[#2f81f7] font-mono mr-1">[N]</span> MinMax Norm <MoveRight className="w-3 h-3 mx-2 text-[#8b949e]" /> [-1, 1]
              </div>
              <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[11px] flex items-center">
                <span className="text-[#238636] font-mono mr-1">[C]</span> Categorical <MoveRight className="w-3 h-3 mx-2 text-[#8b949e]" /> Latent Embedding
              </div>
              <div className="p-2 bg-white/5 border border-[#30363d] rounded-[6px] text-[11px] flex items-center">
                <span className="text-[#d29922] font-mono mr-1">[Σ]</span> Concat <MoveRight className="w-3 h-3 mx-2 text-[#8b949e]" /> ℝ³ Dense Block
              </div>
            </div>
          </div>
          
          <div className="mt-auto font-mono text-[10px] text-[#8b949e] flex flex-col gap-1">
            <p className="text-[#238636]">● System Ready</p>
            <p>Batch Size: 150 (Visualized)</p>
            <p>Latent Dim: 3 (Current Model)</p>
          </div>
        </aside>

        {/* RIGHT PANEL: Plotly Graph Container */}
        <div className="flex-1 relative flex flex-col bg-[radial-gradient(circle_at_center,#111827_0%,#0c0d0e_100%)]">
           <div className="absolute top-6 inset-x-6 flex justify-between items-start pointer-events-none z-10">
               <div className="flex items-center space-x-2 bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] px-3 py-1.5 rounded-[6px] pointer-events-auto shadow-sm">
                   <Component className="w-4 h-4 text-[#2f81f7]" />
                   <span className="text-[11px] font-semibold text-[#e6edf3] uppercase tracking-[0.05em]">Latent Manifold: z ∈ R³</span>
               </div>
           </div>

           <div ref={plotRef} className="flex-1 w-full relative z-0"></div>

           <div className="absolute bottom-6 right-6 bg-[#161b22]/80 border border-[#30363d] p-3 rounded-[8px] text-[11px] backdrop-blur-[4px] pointer-events-auto">
             <div className="font-semibold text-[#e6edf3] mb-2 uppercase tracking-wide text-[#8b949e]">Legend</div>
             {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
                <div key={sector} className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-[#e6edf3]">{sector} Sector</span>
                </div>
             ))}
             <div className="mt-2 pt-2 border-t border-[#30363d] text-[#8b949e] flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b949e]"></span>
                </div>
                Size = Income
             </div>
           </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="h-[160px] shrink-0 border-t border-[#30363d] bg-[#161b22] px-6 py-4 flex gap-8">
        <div className="flex-[2] flex flex-col">
          <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#30363d]">
            Mathematical Objective
          </div>
          <div className="bg-black/20 p-4 rounded-[8px] border border-[#30363d] font-mono text-[#2f81f7] text-[14px] leading-relaxed flex-1 flex flex-col justify-center">
            {MODEL_INTUITIONS[modelType].formula}
            <span className="text-[11px] text-[#8b949e] font-sans mt-2 leading-normal">
              {MODEL_INTUITIONS[modelType].description}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="text-[11px] text-[#8b949e] uppercase tracking-[0.1em] font-bold mb-3 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-[#30363d]">
            Simulation Status
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-white/5 p-3 rounded-[6px] border border-[#30363d] flex flex-col justify-center">
              <div className="text-[18px] font-semibold font-mono text-[#e6edf3]">Nominal</div>
              <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mt-1">Status</div>
            </div>
            <div className="bg-white/5 p-3 rounded-[6px] border border-[#30363d] flex flex-col justify-center">
              <div className="text-[18px] font-semibold font-mono text-[#e6edf3]">150</div>
              <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mt-1">Vectors Evaluated</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
