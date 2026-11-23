export type JobSector = 'Tech' | 'Health' | 'Finance';
export type Region = 'North' | 'South' | 'East' | 'West';

export interface DataRow {
  id: number;
  age: number;
  income: number;
  job_sector: JobSector;
  region: Region;
}

export interface LatentPoint extends DataRow {
  x: number;
  y: number;
  z: number;
}

export type ModelType = 'VAE' | 'Standard Autoencoder' | 'PCA' | 'UMAP/t-SNE';

export interface ModelIntuition {
  title: string;
  formula: string;
  description: string;
  keyStrengths: string;
}

export type ColorDimension = 'job_sector' | 'region' | 'income' | 'age';
