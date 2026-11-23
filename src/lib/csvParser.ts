export interface ParsedDataset {
  name: string;
  rows: Record<string, string | number>[];
  columns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  hasPrecomputed3D: boolean;
  coordColumns?: { x: string; y: string; z: string };
}

/**
 * Robust CSV parser that handles quotes, escaped quotes, newlines, and automatic type inference
 */
export function parseCSV(csvText: string, fileName = 'custom_data.csv'): ParsedDataset {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row.');
  }

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      const next = line[i + 1];

      if (c === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const rawHeaders = parseLine(lines[0]);
  const columns = rawHeaders.map((h, idx) => (h ? h.replace(/^["']|["']$/g, '') : `col_${idx + 1}`));

  const rows: Record<string, string | number>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length === 1 && cells[0] === '') continue;

    const rowObj: Record<string, string | number> = {
      id: i,
    };

    columns.forEach((col, idx) => {
      const rawVal = cells[idx] !== undefined ? cells[idx].replace(/^["']|["']$/g, '') : '';
      const numVal = Number(rawVal);
      if (rawVal !== '' && !isNaN(numVal)) {
        rowObj[col] = numVal;
      } else {
        rowObj[col] = rawVal;
      }
    });

    rows.push(rowObj);
  }

  // Detect column types
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  columns.forEach((col) => {
    let numericCount = 0;
    rows.forEach((r) => {
      if (typeof r[col] === 'number') numericCount++;
    });
    if (numericCount / rows.length > 0.75) {
      numericColumns.push(col);
    } else {
      categoricalColumns.push(col);
    }
  });

  // Check for precomputed 3D coordinates
  const lowerCols = columns.map((c) => c.toLowerCase());
  let coordCols: { x: string; y: string; z: string } | undefined;

  const candidateSets = [
    ['x', 'y', 'z'],
    ['z1', 'z2', 'z3'],
    ['z_1', 'z_2', 'z_3'],
    ['latent_x', 'latent_y', 'latent_z'],
    ['latent1', 'latent2', 'latent3'],
    ['dim1', 'dim2', 'dim3'],
    ['pca1', 'pca2', 'pca3'],
    ['umap1', 'umap2', 'umap3'],
    ['tsne1', 'tsne2', 'tsne3'],
  ];

  for (const set of candidateSets) {
    const iX = lowerCols.indexOf(set[0]);
    const iY = lowerCols.indexOf(set[1]);
    const iZ = lowerCols.indexOf(set[2]);
    if (iX !== -1 && iY !== -1 && iZ !== -1) {
      coordCols = {
        x: columns[iX],
        y: columns[iY],
        z: columns[iZ],
      };
      break;
    }
  }

  return {
    name: fileName,
    rows,
    columns,
    numericColumns,
    categoricalColumns,
    hasPrecomputed3D: !!coordCols,
    coordColumns: coordCols,
  };
}
