import { ProjectTableColumn } from './types';

export const extractMappingFromProjectTableConfig = (columns: ProjectTableColumn[]) => {
  const mapping: Record<string, string> = {};
  columns.forEach((column) => {
    mapping[column.field] = column.field;
  });
  return mapping;
};

export const buildQuery = (fields:string[]) => {
  return fields.map((field) => {
    return `${field}:${field}(project_id: $name)`;
  });
};
