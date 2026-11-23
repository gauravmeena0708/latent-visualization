# Latent Space Explorer

Interactive 3D visualization simulator exploring how different machine learning dimensionality reduction techniques and generative architectures structure latent spaces from mixed tabular data.

---

## Overview

Latent Space Explorer is a browser-based educational tool to compare latent manifolds across four fundamental modeling paradigms:

1. **Variational Autoencoder (VAE):** Enforces a smooth Gaussian prior $\mathcal{N}(0, I)$ via KL divergence, removing dead zones and allowing smooth generative interpolation.
2. **Deterministic Autoencoder:** Focuses solely on reconstruction error minimization, creating fragmented clusters with unconstrained voids.
3. **Principal Component Analysis (PCA):** Linear orthogonal transformation maximizing explained variance.
4. **Manifold Learning (UMAP / t-SNE):** Prioritizes preservation of local neighborhood topology, producing distinct categorical islands.

---

## Features

- **Interactive 3D Visualizer:** Full 3D rotation, pan, zoom, and responsive resizing.
- **Multiple Color Dimensions:** Inspect representations by Job Sector, Geographic Region, Income, or Age.
- **Deterministic & Reproducible:** Seeded PRNG ensures identical data points across model transitions and reloads.
- **Export to High-Res PNG:** One-click snapshot of the 3D projection.
- **Shareable State:** Model selection is automatically synchronized with URL query parameters (`?model=VAE`).
- **Responsive Layout:** Works smoothly on mobile, tablet, and desktop viewports.

---

## Quick Start

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm

### Installation
```bash
git clone https://github.com/your-username/latent-visualization.git
cd latent-visualization
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## Architecture

```text
src/
├── components/
│   ├── Header.tsx        # Top navigation, model selection & seed controls
│   ├── DataTable.tsx     # Tabular data inspector & encoding pipeline overview
│   ├── LatentPlot.tsx    # Plotly 3D scatter plot container & legend
│   ├── ModelInsight.tsx  # Mathematical objective & telemetry footer
│   └── InfoModal.tsx     # Theoretical background & documentation modal
├── lib/
│   ├── prng.ts           # Mulberry32 seeded PRNG & Box-Muller Gaussian transform
│   ├── dataGenerator.ts  # Deterministic tabular dataset generator
│   └── latentModels.ts   # Latent coordinate projections (VAE, PCA, AE, UMAP)
├── types.ts              # Core TypeScript data contracts
├── constants.ts          # Color palettes & algorithm formulas
└── App.tsx               # Application orchestrator
```

---

## License

This project is licensed under the Apache 2.0 License.
