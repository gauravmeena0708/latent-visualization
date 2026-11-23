import { LatentPoint, ModelType } from '../types';
import { createRng, seededGaussian } from './prng';
import { ParsedDataset } from './csvParser';

/**
 * Deterministically simulates latent coordinates z in R^3
 * conditioned on the model type and data point attributes.
 */
export function calculateLatentCoordinates(
  dataset: Record<string, string | number>[],
  modelType: ModelType,
  seed = 101,
  parsedMeta?: ParsedDataset
): LatentPoint[] {
  // If the user uploaded a dataset with pre-existing 3D coordinates, use their exact coordinates!
  if (parsedMeta?.hasPrecomputed3D && parsedMeta.coordColumns) {
    const { x: colX, y: colY, z: colZ } = parsedMeta.coordColumns;
    return dataset.map((d, i) => ({
      ...d,
      id: typeof d.id === 'number' ? d.id : i + 1,
      x: Number(Number(d[colX] || 0).toFixed(4)),
      y: Number(Number(d[colY] || 0).toFixed(4)),
      z: Number(Number(d[colZ] || 0).toFixed(4)),
    }));
  }

  // Find continuous numeric keys and categorical keys
  const numericKeys = parsedMeta
    ? parsedMeta.numericColumns.filter((k) => k !== 'id' && k !== 'x' && k !== 'y' && k !== 'z')
    : ['age', 'income'];

  const categoricalKeys = parsedMeta
    ? parsedMeta.categoricalColumns
    : ['job_sector', 'region'];

  // Calculate min/max for normalization
  const bounds: Record<string, { min: number; max: number }> = {};
  numericKeys.forEach((k) => {
    let min = Infinity;
    let max = -Infinity;
    dataset.forEach((row) => {
      const v = Number(row[k]);
      if (!isNaN(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    });
    bounds[k] = { min: min === Infinity ? 0 : min, max: max === -Infinity ? 1 : max };
  });

  return dataset.map((d, idx) => {
    const rowId = typeof d.id === 'number' ? d.id : idx + 1;
    const rowRng = createRng(seed + rowId * 7919);
    const gNoise1 = seededGaussian(rowRng);
    const gNoise2 = seededGaussian(rowRng);
    const gNoise3 = seededGaussian(rowRng);

    // Normalize first two numeric features
    const num1Key = numericKeys[0];
    const num2Key = numericKeys[1] || numericKeys[0];

    const v1 = Number(d[num1Key]) || 0;
    const v2 = Number(d[num2Key]) || 0;

    const b1 = bounds[num1Key] || { min: 0, max: 1 };
    const b2 = bounds[num2Key] || { min: 0, max: 1 };

    const norm1 = b1.max > b1.min ? (v1 - b1.min) / (b1.max - b1.min) : 0.5;
    const norm2 = b2.max > b2.min ? (v2 - b2.min) / (b2.max - b2.min) : 0.5;

    // Hash categorical features
    const cat1 = String(d[categoricalKeys[0]] || 'A');
    const cat2 = String(d[categoricalKeys[1]] || 'B');

    let hashCat1 = 0;
    for (let i = 0; i < cat1.length; i++) hashCat1 = (hashCat1 * 31 + cat1.charCodeAt(i)) % 5;
    let hashCat2 = 0;
    for (let i = 0; i < cat2.length; i++) hashCat2 = (hashCat2 * 31 + cat2.charCodeAt(i)) % 5;

    let x = 0;
    let y = 0;
    let z = 0;

    if (modelType === 'PCA') {
      x = norm1 * 5.5 + norm2 * 9.5 + hashCat1 * 1.8;
      y = norm2 * -6.2 + hashCat2 * 2.8 + norm1 * 1.5;
      z = norm1 * 2.5 + norm2 * 2.0 + hashCat1 * 1.4 - hashCat2 * 0.8;
    } else if (modelType === 'Standard Autoencoder') {
      x = Math.sin(hashCat1 * 2.1 + norm1 * 9) * 7.5 + (rowRng() - 0.5) * 4.5;
      y = Math.cos(hashCat2 * 1.6 - norm2 * 7.5) * 7.5 + (rowRng() - 0.5) * 4.5;
      z = Math.sin(norm2 * 4.8 + hashCat1 * 2.8) * 7.5 + (rowRng() - 0.5) * 4.5;
    } else if (modelType === 'VAE') {
      const cx = (hashCat1 - 1.5) * 2.4;
      const cy = (hashCat2 - 1.5) * 1.6;
      const cz = (norm1 > 0.5 ? 1.0 : -1.0) * 1.4;

      x = cx + gNoise1 * 1.5;
      y = cy + gNoise2 * 1.5;
      z = cz + gNoise3 * 1.5;
    } else if (modelType === 'UMAP/t-SNE') {
      const angle = (hashCat1 / 5) * (2 * Math.PI);
      const radius = 16 + hashCat2 * 2.5;
      const cx = Math.cos(angle) * radius;
      const cy = Math.sin(angle) * radius;
      const cz = (hashCat2 - 2) * 7.5;

      const jitter = 0.65;
      x = cx + gNoise1 * 1.8 * jitter;
      y = cy + gNoise2 * 1.8 * jitter;
      z = cz + gNoise3 * 1.8 * jitter;
    }

    return {
      ...d,
      id: rowId,
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      z: Number(z.toFixed(3)),
    };
  });
}
