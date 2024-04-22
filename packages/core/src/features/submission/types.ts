import { JSONObject } from '../../types';

export interface Project {
  availability_type: string;
  code: string;
  project_id: string;
}

export interface ProjectResponse {
  projects: Array<Project>;
}

export interface SubmissionGraphqlParams {
  query: string;
  variables: Record<string, any>;
  mapping?: {
    [key: string]: string;
  };
}

export interface SubmissionGraphqlResponse {
  data: JSONObject;
}

export interface ProjectDetailsParams {
  ids : Array<string>;
}

export interface ProjectDetailsResponse {
  data: JSONObject[];
}

export interface ProjectsListRequestParams {
  size: number;
  projectQuery: JSONObject;
  projectDetailsQuery: JSONObject;
  mapping?: {
    [key: string]: string;
  };
}

export interface ProjectResponse {
  projects: Array<Project>;
}
