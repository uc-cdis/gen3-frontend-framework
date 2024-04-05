import { AuthzMapping } from '../authz';

export interface NamedURL {
  name: string;
  url: string;
}

export interface ExternalProvider {
  base_url: string;
  idp: string;
  name: string;
  refresh_token_expiration: string;
  urls: NamedURL[];
}

export interface FileMetadata {
  object_id: string;
}

/**
 * Data model for a Gen3 User obtained from the /user/user endpoint
 */
export interface UserProfile {
  authz: AuthzMapping;
  id: number;
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_admin: boolean;
  project_access: {
    [key: string]: string[];
  };
  phone_number: string;
  display_name: string;
  preferred_username: string;
  ga4gh_passport_v1: Record<string, string>[];
  certificates_uploaded: Record<string, string>[];
  primary_google_service_account: null;
  resources_granted: Record<string, string>[];
  groups: string[];
  message: string;
  sub: string;
  idp: string;
  azp: string[] | null;
}

export type Gen3User = Partial<UserProfile>;

export type LoginStatus = 'authenticated' | 'unauthenticated' | 'pending';
