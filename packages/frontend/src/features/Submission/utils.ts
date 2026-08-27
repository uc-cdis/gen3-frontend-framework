import { ProjectTableColumn } from './types';

export const ROW_LIMIT = 20000;

export const extractMappingFromProjectTableConfig = (
  columns: ProjectTableColumn[],
) => {
  const mapping: Record<string, string> = {};
  columns.forEach((column) => {
    mapping[column.field] = column.field;
  });
  return mapping;
};

export const buildQuery = (fields: string[]) => {
  return fields.map((field) => {
    return `${field}:${field}(project_id: $name)`;
  });
};

export const parseTSVFile = async (file: File) => {
  const fileContents = await file.text();
  const data = fileContents.split('\n');
  const [headers, ...rows] = data;
  const processedHeaders = headers.split('\t');
  const processedRows: Record<string, string>[] = [];

  rows.forEach((row) => {
    const processedRow = row.split('\t');

    if (processedRow.length != processedHeaders.length) {
      // Empty row is not an error
      if (!(processedRow.length === 1 && processedRow[0] === '')) {
        throw 'Misformated TSV';
      }
    } else {
      processedRows.push(
        Object.fromEntries(
          processedRow.map((dataPoint, idx) => [
            processedHeaders[idx],
            dataPoint,
          ]),
        ),
      );
    }
  });

  return { headers: processedHeaders, rows: processedRows };
};
