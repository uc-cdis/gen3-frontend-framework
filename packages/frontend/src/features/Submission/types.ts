
export interface ProjectTableField {
  field: string;
  fieldPath?: string;
  header: string;
}

export interface ProjectTableProps {
  fields: ProjectTableField[];
}
