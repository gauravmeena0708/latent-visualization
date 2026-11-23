import { DataRow, LatentPoint, ModelType } from '../types';
import { SECTORS, REGIONS } from '../constants';
import { createRng, seededGaussian } from './prng';

/**
 * Deterministically simulates latent coordinates z in R^3
 * conditioned on the model type and data point attributes.
 */
export function calculateLatentCoordinates(
  dataset: DataRow[],
  modelType: ModelType,
  seed = 101
): LatentPoint[] {
  return dataset.map((d) => {
    // Generate deterministic perturbation per data row
    const rowRng = createRng(seed + d.id * 7919);
    const gNoise1 = seededGaussian(rowRng);
    const gNoise2 = seededGaussian(rowRng);
    const gNoise3 = seededGaussian(rowRng);

    const sIdx = SECTORS.indexOf(d.job_sector);
    const rIdx = REGIONS.indexOf(d.region);

    // Feature Normalization [0, 1]
    const ageN = (d.age - 22) / 42;
    const incN = (d.income - 38000) / 125000;

    let x = 0;
    let y = 0;
    let z = 0;

    if (modelType === 'PCA') {
      // Orthogonal linear variance axes
      x = ageN * 5.5 + incN * 9.5 + sIdx * 1.8;
      y = incN * -6.2 + rIdx * 2.8 + ageN * 1.5;
      z = ageN * 2.5 + incN * 2.0 + sIdx * 1.4 - rIdx * 0.8;
    } else if (modelType === 'Standard Autoencoder') {
      // Bottleneck without regularization - sparse disconnected clusters with gaps
      x = Math.sin(sIdx * 2.1 + ageN * 9) * 7.5 + (rowRng() - 0.5) * 4.5;
      y = Math.cos(rIdx * 1.6 - incN * 7.5) * 7.5 + (rowRng() - 0.5) * 4.5;
      z = Math.sin(incN * 4.8 + sIdx * 2.8) * 7.5 + (rowRng() - 0.5) * 4.5;
    } else if (modelType === 'VAE') {
      // Regularized Gaussian prior centered close to origin with continuous transitions
      const cx = (sIdx - 1) * 2.4;
      const cy = (rIdx - 1.5) * 1.6;
      const cz = (d.age > 42 ? 1.0 : -1.0) * 1.4;

      x = cx + gNoise1 * 1.5;
      y = cy + gNoise2 * 1.5;
      z = cz + gNoise3 * 1.5;
    } else if (modelType === 'UMAP/t-SNE') {
      // High separation of non-linear topological manifolds
      const angle = sIdx * ((2 * Math.PI) / 3);
      const radius = 16 + rIdx * 2.5;
      const cx = Math.cos(angle) * radius;
      const cy = Math.sin(angle) * radius;
      const cz = (rIdx - 1.5) * 7.5;

      const jitter = 0.65;
      x = cx + gNoise1 * 1.8 * jitter;
      y = cy + gNoise2 * 1.8 * jitter;
      z = cz + gNoise3 * 1.8 * jitter;
    }

    return {
      ...d,
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      z: Number(z.toFixed(3)),
    };
  });
}
