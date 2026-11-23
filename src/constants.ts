import { JobSector, Region, ModelType, ModelIntuition } from './types';

export const SECTORS: JobSector[] = ['Tech', 'Health', 'Finance'];
export const REGIONS: Region[] = ['North', 'South', 'East', 'West'];

export const SECTOR_COLORS: Record<JobSector, string> = {
  Tech: '#58a6ff',
  Health: '#d29922',
  Finance: '#3fb950',
};

export const REGION_COLORS: Record<Region, string> = {
  North: '#a371f7',
  South: '#f778ba',
  East: '#38bdf8',
  West: '#f59e0b',
};

export const MODEL_INTUITIONS: Record<ModelType, ModelIntuition> = {
  VAE: {
    title: 'Variational Autoencoder (VAE)',
    formula: 'L = || x - x\u0302 ||\u00B2 + \u03B2 \u00B7 D_{KL}( q(z|x) || P(z) )',
    description:
      'The Evidence Lower Bound (ELBO) regularizes the latent space toward a continuous multivariate Gaussian prior (N(0, I)). The KL Divergence pulls clusters toward the center and smooths transitions, enabling realistic generative sampling and interpolation.',
    keyStrengths: 'Smooth latent manifold, robust generative sampling, continuous interpolation.',
  },
  'Standard Autoencoder': {
    title: 'Deterministic Autoencoder',
    formula: 'L = MSE(x, Decoder(Encoder(x)))',
    description:
      'Compresses data through a bottleneck purely to minimize reconstruction error without distribution constraints. This creates arbitrary clusters with irregular voids and dead zones where generation fails.',
    keyStrengths: 'High reconstruction fidelity for training distribution; lacks prior regularization.',
  },
  PCA: {
    title: 'Principal Component Analysis (PCA)',
    formula: 'argmax_W Tr(W^T Cov(X) W)',
    description:
      'Linear transformation projecting data onto orthogonal eigenvectors that maximize explained variance. Preserves global geometric distances linearly without non-linear bending.',
    keyStrengths: 'Deterministic, mathematically optimal linear variance preservation, interpretable axes.',
  },
  'UMAP/t-SNE': {
    title: 'Manifold Learning (UMAP / t-SNE)',
    formula: 'Cost = \u03A3 P_{ij} log(P_{ij} / Q_{ij})',
    description:
      'Constructs fuzzy topological representations of high-dimensional neighborhoods and matches them in low dimensions. Emphasizes cluster separation and local manifold preservation over global distances.',
    keyStrengths: 'Crisp cluster isolation, revealing non-linear subgroup geometry.',
  },
};
