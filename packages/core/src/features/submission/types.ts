export interface Project {
  availability_type: string;
  code: string;
  project_id: string;
}

export interface ProjectResponse {
  projects: Array<Project>;
}
