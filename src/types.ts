export type JobSector = 'Tech' | 'Health' | 'Finance';
export type Region = 'North' | 'South' | 'East' | 'West';

export interface DataRow {
  id: number;
  age: number;
  income: number;
  job_sector: JobSector;
  region: Region;
  [key: string]: string | number;
}

export interface LatentPoint {
  id: number;
  x: number;
  y: number;
  z: number;
  [key: string]: string | number;
}

export type ModelType = 'VAE' | 'Standard Autoencoder' | 'PCA' | 'UMAP/t-SNE';

export interface ModelIntuition {
  title: string;
  formula: string;
  description: string;
  keyStrengths: string;
}

export type ColorDimension = string;
