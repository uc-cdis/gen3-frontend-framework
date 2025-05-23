export interface RequestQueryBody {
  policy_id?: string;
  resource_display_name?: string;
  resource_id?: string;
  resource_path?: string;
  resource_paths?: string[];
  role_ids?: string[];
  status?: string;
  username?: string;
}

export interface RequestorResponse {
  resource_display_name?: string | null;
  updated_time?: string;
  resource_id?: string;
  request_id?: string;
  username?: string;
  status?: string;
  revoke?: boolean;
  policy_id?: string;
  created_time?: string;
}

export interface RequestListQuery {
  policy_ids: Array<string>;
  resource_ids: Array<string>;
  status: string;
  revoke: boolean;
}
