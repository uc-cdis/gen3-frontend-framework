
export interface NamedURL {
  name: string,
  url: string
}

export interface ExternalProvider {
  'base_url': string,
  'idp': string,
  'name': string,
  'refresh_token_expiration': string,
  'urls': NamedURL[]
}

export interface FileMetadata {
  'object_id': string,
}
