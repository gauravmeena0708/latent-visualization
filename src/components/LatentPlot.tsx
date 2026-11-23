import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LatentPoint, ColorDimension, ModelType } from '../types';
import { SECTOR_COLORS, REGION_COLORS } from '../constants';
import { Download, Loader2, RefreshCw, Palette } from 'lucide-react';

interface LatentPlotProps {
  data: LatentPoint[];
  modelType: ModelType;
  colorDimension: ColorDimension;
  onColorDimensionChange: (dim: ColorDimension) => void;
}

export const LatentPlot: React.FC<LatentPlotProps> = ({
  data,
  modelType,
  colorDimension,
  onColorDimensionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [plotlyStatus, setPlotlyStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isExporting, setIsExporting] = useState(false);

  // Poll for Plotly CDN availability safely
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;

    const checkPlotly = () => {
      if (window.Plotly) {
        setPlotlyStatus('ready');
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkPlotly, 100);
      } else {
        setPlotlyStatus('error');
      }
    };

    checkPlotly();
  }, []);

  // Compute marker colors based on chosen dimension
  const getMarkerColors = useCallback(() => {
    if (colorDimension === 'job_sector') {
      return data.map((d) => SECTOR_COLORS[d.job_sector]);
    }
    if (colorDimension === 'region') {
      return data.map((d) => REGION_COLORS[d.region]);
    }
    if (colorDimension === 'income') {
      return data.map((d) => d.income);
    }
    // Age
    return data.map((d) => d.age);
  }, [data, colorDimension]);

  // Render or update plot
  useEffect(() => {
    if (plotlyStatus !== 'ready' || !containerRef.current || !window.Plotly) return;

    const colors = getMarkerColors();
    const isContinuous = colorDimension === 'income' || colorDimension === 'age';

    const trace = {
      x: data.map((d) => d.x),
      y: data.map((d) => d.y),
      z: data.map((d) => d.z),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: data.map((d) => 5 + ((d.income - 38000) / 125000) * 10),
        color: colors,
        colorscale: isContinuous ? 'Viridis' : undefined,
        colorbar: isContinuous
          ? {
              title: { text: colorDimension === 'income' ? 'Income ($)' : 'Age (yrs)', font: { color: '#8b949e', size: 10 } },
              tickfont: { color: '#8b949e', size: 9 },
              len: 0.6,
              thickness: 12,
              x: 1.02,
            }
          : undefined,
        opacity: 0.85,
        line: { width: 0.6, color: '#ffffff' },
      },
      text: data.map(
        (d) =>
          `<b>Record #${d.id}</b><br>` +
          `• Latent Coordinates: (${d.x}, ${d.y}, ${d.z})<br>` +
          `• Sector: ${d.job_sector}<br>` +
          `• Region: ${d.region}<br>` +
          `• Age: ${d.age} yrs<br>` +
          `• Income: $${d.income.toLocaleString()}`
      ),
      hoverinfo: 'text',
    };

    const layout = {
      autosize: true,
      uirevision: `${modelType}-${colorDimension}`,
      margin: { l: 0, r: 0, b: 0, t: 0 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      scene: {
        xaxis: {
          backgroundcolor: 'transparent',
          gridcolor: '#30363d',
          showbackground: false,
          zerolinecolor: '#484f58',
          title: 'Latent z₁',
          tickfont: { color: '#8b949e', size: 10 },
          titlefont: { color: '#8b949e', size: 11 },
        },
        yaxis: {
          backgroundcolor: 'transparent',
          gridcolor: '#30363d',
          showbackground: false,
          zerolinecolor: '#484f58',
          title: 'Latent z₂',
          tickfont: { color: '#8b949e', size: 10 },
          titlefont: { color: '#8b949e', size: 11 },
        },
        zaxis: {
          backgroundcolor: 'transparent',
          gridcolor: '#30363d',
          showbackground: false,
          zerolinecolor: '#484f58',
          title: 'Latent z₃',
          tickfont: { color: '#8b949e', size: 10 },
          titlefont: { color: '#8b949e', size: 11 },
        },
        camera: {
          eye: { x: 1.55, y: 1.55, z: 1.25 },
        },
      },
      hoverlabel: {
        bgcolor: '#161b22',
        font: { color: '#e6edf3', family: 'Inter', size: 11 },
        bordercolor: '#30363d',
      },
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    window.Plotly.react(containerRef.current, [trace], layout, config);

    const handleResize = () => {
      if (containerRef.current && window.Plotly?.Plots) {
        window.Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, modelType, colorDimension, plotlyStatus, getMarkerColors]);

  const handleExport = async () => {
    if (!containerRef.current || !window.Plotly?.downloadImage) return;
    try {
      setIsExporting(true);
      await window.Plotly.downloadImage(containerRef.current, {
        format: 'png',
        width: 1400,
        height: 900,
        filename: `latent-space-${modelType.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 relative flex flex-col bg-[radial-gradient(circle_at_center,#111827_0%,#0c0d0e_100%)] overflow-hidden">
      {/* Top Floating Controls */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10 gap-2">
        <div className="flex items-center gap-2 bg-[#161b22]/90 backdrop-blur-md border border-[#30363d] px-3 py-1.5 rounded-[6px] pointer-events-auto shadow-sm">
          <Palette className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-[11px] font-medium text-[#8b949e] uppercase tracking-wider hidden sm:inline">Color By:</span>
          <select
            value={colorDimension}
            onChange={(e) => onColorDimensionChange(e.target.value as ColorDimension)}
            aria-label="Color dimension selector"
            className="bg-[#0c0d0e] border border-[#30363d] text-[12px] text-[#e6edf3] rounded px-2 py-0.5 outline-none cursor-pointer focus:ring-1 focus:ring-[#2f81f7]"
          >
            <option value="job_sector">Sector (Categorical)</option>
            <option value="region">Region (Categorical)</option>
            <option value="income">Income (Continuous)</option>
            <option value="age">Age (Continuous)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleExport}
            disabled={plotlyStatus !== 'ready' || isExporting}
            className="flex items-center gap-1.5 bg-[#161b22]/90 hover:bg-[#21262d] backdrop-blur-md border border-[#30363d] text-[#c9d1d9] hover:text-white px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition disabled:opacity-50 shadow-sm"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Export PNG</span>
          </button>
        </div>
      </div>

      {/* Plotly Container */}
      <div
        ref={containerRef}
        role="region"
        aria-label="3D Latent Space Visualization"
        className="flex-1 w-full relative z-0"
      />

      {/* Loading & Error Overlays */}
      {plotlyStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0d0e]/80 backdrop-blur-xs z-20">
          <Loader2 className="w-8 h-8 text-[#58a6ff] animate-spin mb-3" />
          <p className="text-[14px] text-[#c9d1d9] font-medium">Initializing 3D WebGL Engine...</p>
          <p className="text-[12px] text-[#8b949e] mt-1">Loading Plotly representation manifold</p>
        </div>
      )}

      {plotlyStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0d0e]/90 z-20 p-6 text-center">
          <div className="max-w-md bg-[#161b22] border border-[#f85149]/40 p-6 rounded-[8px]">
            <h3 className="text-[16px] font-semibold text-[#f85149] mb-2">Graphics Engine Unavailable</h3>
            <p className="text-[13px] text-[#8b949e] mb-4">
              Failed to load the 3D rendering library. Check your network connection or ad-blocker settings.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-[13px] rounded-[6px] border border-[#30363d]"
            >
              <RefreshCw className="w-4 h-4" /> Reload Explorer
            </button>
          </div>
        </div>
      )}

      {/* Floating Legend */}
      <div className="absolute bottom-4 right-4 bg-[#161b22]/90 border border-[#30363d] p-3 rounded-[8px] text-[11px] backdrop-blur-md pointer-events-auto max-w-[200px] shadow-lg">
        <div className="font-semibold text-[#e6edf3] mb-1.5 uppercase tracking-wide text-[#8b949e] text-[10px]">
          Legend ({colorDimension.replace('_', ' ')})
        </div>

        {colorDimension === 'job_sector' &&
          Object.entries(SECTOR_COLORS).map(([sector, color]) => (
            <div key={sector} className="flex items-center gap-2 py-0.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[#c9d1d9]">{sector} Sector</span>
            </div>
          ))}

        {colorDimension === 'region' &&
          Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-2 py-0.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[#c9d1d9]">{region}</span>
            </div>
          ))}

        {(colorDimension === 'income' || colorDimension === 'age') && (
          <div className="text-[#8b949e] py-0.5">
            Viridis colormap: lower values in dark violet/blue, higher values in yellow.
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-[#30363d] text-[#8b949e] flex items-center gap-2">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b949e]" />
          </div>
          <span>Marker size = Income</span>
        </div>
      </div>
    </div>
  );
};
