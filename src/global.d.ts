export interface PlotlyScatterData {
  x: number[];
  y: number[];
  z: number[];
  mode: string;
  type: string;
  marker?: {
    size: number | number[];
    color?: string | number[] | string[];
    colorscale?: string;
    colorbar?: Record<string, unknown>;
    opacity?: number;
    symbol?: string | string[];
    line?: { width: number; color: string };
  };
  text?: string[];
  hoverinfo?: string;
}

export interface PlotlyLayout {
  autosize?: boolean;
  uirevision?: string;
  margin?: { l: number; r: number; b: number; t: number };
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  scene?: Record<string, unknown>;
  hoverlabel?: Record<string, unknown>;
}

declare global {
  interface Window {
    Plotly?: {
      react: (
        root: HTMLElement | string,
        data: PlotlyScatterData[],
        layout: PlotlyLayout,
        config?: Record<string, unknown>
      ) => Promise<unknown>;
      downloadImage?: (
        root: HTMLElement | string,
        options?: { format: string; width: number; height: number; filename: string }
      ) => Promise<string>;
      Plots?: {
        resize: (root: HTMLElement | string) => void;
      };
    };
  }
}

export {};
