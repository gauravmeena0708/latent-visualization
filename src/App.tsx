import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ModelType, ColorDimension } from './types';
import { generateDataset } from './lib/dataGenerator';
import { calculateLatentCoordinates } from './lib/latentModels';
import { Header } from './components/Header';
import { DataTable } from './components/DataTable';
import { LatentPlot } from './components/LatentPlot';
import { ModelInsight } from './components/ModelInsight';
import { InfoModal } from './components/InfoModal';

export default function App() {
  // Sync initial model from URL if present
  const [modelType, setModelType] = useState<ModelType>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('model');
      if (
        param === 'VAE' ||
        param === 'Standard Autoencoder' ||
        param === 'PCA' ||
        param === 'UMAP/t-SNE'
      ) {
        return param;
      }
    }
    return 'VAE';
  });

  const [seed, setSeed] = useState<number>(42);
  const [colorDimension, setColorDimension] = useState<ColorDimension>('job_sector');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  // Sync URL when modelType changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('model', modelType);
    window.history.replaceState({}, '', url.toString());
  }, [modelType]);

  const handleRegenerate = useCallback(() => {
    setSeed((prev) => (prev + 17) % 100000);
  }, []);

  // 1. Deterministic Data Generation
  const dataset = useMemo(() => {
    return generateDataset(150, seed);
  }, [seed]);

  // 2. Deterministic Latent Coordinates
  const latentCoordinates = useMemo(() => {
    return calculateLatentCoordinates(dataset, modelType, seed);
  }, [dataset, modelType, seed]);

  return (
    <div className="h-screen w-screen bg-[#0c0d0e] text-[#e6edf3] font-sans flex flex-col overflow-hidden select-none">
      {/* HEADER */}
      <Header
        modelType={modelType}
        onModelChange={setModelType}
        onRegenerate={handleRegenerate}
        onOpenInfo={() => setInfoOpen(true)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR: Data & Encoding Pipelines */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-20 w-[320px] md:w-[340px] shrink-0
            border-r border-[#30363d] bg-[#161b22] flex flex-col p-4 overflow-y-auto custom-scrollbar
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <DataTable dataset={dataset} />

          <div className="mt-auto pt-4 border-t border-[#30363d] font-mono text-[11px] text-[#8b949e] flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#3fb950]">
              <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
              <span>Deterministic Seed #{seed}</span>
            </div>
            <p>Dataset Sample: {dataset.length} records</p>
            <p>Latent Manifold: ℝ³ Projection</p>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-xs"
          />
        )}

        {/* VISUALIZATION CANVAS */}
        <LatentPlot
          data={latentCoordinates}
          modelType={modelType}
          colorDimension={colorDimension}
          onColorDimensionChange={setColorDimension}
        />
      </main>

      {/* FOOTER */}
      <ModelInsight modelType={modelType} datasetCount={dataset.length} />

      {/* INFO / DOCUMENTATION MODAL */}
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
