export interface WorkspaceAuthContext {
  username?: string;
  jwt?: string;
  rbac?: string[];
  abac?: Record<string, unknown>;
  // Multi-tenant scoping for session isolation
  tenantId?: string;
  workspaceId?: string;
}

export interface WorkspaceAccessPolicy {
  requireUsername?: boolean;
  requireJwt?: boolean;
  requiredRbac?: string[];
  requiredAbacKeys?: string[];
  allowLocalDevBypass?: boolean;
}

export interface AuthVerificationResult {
  allowed: boolean;
  reason?: string;
}

export const defaultAccessPolicy: WorkspaceAccessPolicy = {
  requireUsername: true,
  requireJwt: true,
  requiredRbac: [],
  requiredAbacKeys: [],
  allowLocalDevBypass: false,
};

const isLocalDevelopmentRuntime = () => {
  const hostname = (globalThis as any)?.location?.hostname;
  const isLocalHost =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const isProduction =
    typeof globalThis !== 'undefined' &&
    Boolean((globalThis as any)?.process?.env?.NODE_ENV === 'production');

  return isLocalHost && !isProduction;
};

export const verifyWorkspaceAccess = (
  authContext: WorkspaceAuthContext | null | undefined,
  accessPolicy?: WorkspaceAccessPolicy,
): AuthVerificationResult => {
  const policy = {
    ...defaultAccessPolicy,
    ...(accessPolicy || {}),
  };

  if (policy.allowLocalDevBypass && isLocalDevelopmentRuntime()) {
    return { allowed: true, reason: 'Local development bypass enabled.' };
  }

  if (!authContext) {
    const requiresAuthContext =
      policy.requireUsername ||
      policy.requireJwt ||
      (Array.isArray(policy.requiredRbac) && policy.requiredRbac.length > 0) ||
      (Array.isArray(policy.requiredAbacKeys) &&
        policy.requiredAbacKeys.length > 0);

    if (requiresAuthContext) {
      return { allowed: false, reason: 'Missing auth context.' };
    }

    return { allowed: true };
  }

  if (policy.requireUsername && !authContext.username) {
    return { allowed: false, reason: 'Missing username.' };
  }

  if (policy.requireJwt && !authContext.jwt) {
    return { allowed: false, reason: 'Missing jwt.' };
  }

  if (Array.isArray(policy.requiredRbac) && policy.requiredRbac.length > 0) {
    const rbac = new Set(authContext.rbac || []);
    const hasAllRequiredRbac = policy.requiredRbac.every((requiredRole) =>
      rbac.has(requiredRole),
    );
    if (!hasAllRequiredRbac) {
      return { allowed: false, reason: 'RBAC policy not satisfied.' };
    }
  }

  if (
    Array.isArray(policy.requiredAbacKeys) &&
    policy.requiredAbacKeys.length > 0
  ) {
    const abac = authContext.abac || {};
    const hasAllRequiredAbac = policy.requiredAbacKeys.every(
      (requiredKey) => requiredKey in abac,
    );
    if (!hasAllRequiredAbac) {
      return { allowed: false, reason: 'ABAC policy not satisfied.' };
    }
  }

  return { allowed: true };
};
