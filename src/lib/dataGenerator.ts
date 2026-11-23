import { DataRow, JobSector, Region } from '../types';
import { SECTORS, REGIONS } from '../constants';
import { createRng } from './prng';

export function generateDataset(count = 150, seed = 42): DataRow[] {
  const rng = createRng(seed);

  return Array.from({ length: count }, (_, i) => {
    const sectorIndex = Math.floor(rng() * SECTORS.length);
    const regionIndex = Math.floor(rng() * REGIONS.length);
    const age = 22 + Math.floor(rng() * 42); // 22 to 63
    const income = 38000 + Math.floor(rng() * 125000); // 38k to 163k

    return {
      id: i + 1,
      age,
      income,
      job_sector: SECTORS[sectorIndex] as JobSector,
      region: REGIONS[regionIndex] as Region,
    };
  });
}
