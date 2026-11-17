export interface AccessRule {
  resource: string;
  service?: string; // default '*'
  method?: string; // default '*'
}

export type AuthzMapping = Record<
  string,
  ReadonlyArray<{ service: string; method: string }>
>;

/**
 * True if `resourcePrefix` is the same as, or an ancestor of, `resourcePath`.
 * Compares whole path segments, so `/a` covers `/a/b` but not `/ab`.
 * Port of Arborist's `is_path_prefix_of_path`.
 */
export const isPathPrefixOfPath = (
  resourcePrefix: string,
  resourcePath: string,
): boolean => {
  const prefixList = resourcePrefix.replace(/\/+$/, '').split('/');
  const pathList = resourcePath.replace(/\/+$/, '').split('/');
  if (prefixList.length > pathList.length) return false;
  return prefixList.every((segment, i) => pathList[i] === segment);
};

const matches = (granted: string, required: string) =>
  granted === '*' || required === '*' || granted === required;

/**
 * /authz/mapping only lists resources Arborist knows about, so a grant on
 * `/a` must be treated as covering `/a/b`, `/a/b/c`, ... for the same
 * service and method, even though those paths never appear in the mapping.
 */
export const hasPermission = (
  mapping: AuthzMapping,
  { resource, service = '*', method = '*' }: AccessRule,
): boolean =>
  Object.entries(mapping).some(
    ([path, perms]) =>
      isPathPrefixOfPath(path, resource) &&
      perms.some(
        (p) => matches(p.service, service) && matches(p.method, method),
      ),
  );
