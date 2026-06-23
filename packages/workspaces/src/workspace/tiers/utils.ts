/* ------------------------------------------------------------------ */
/*  Scoped notebook path — deterministic, multi-tenant isolated path   */
/* ------------------------------------------------------------------ */

// NFC normalization runs first so visually identical Unicode sequences (e.g.
// decomposed combining characters) are collapsed before the ASCII whitelist strips them.
export const sanitizeSegment = (s: string) =>
  s.normalize('NFC').replace(/[^a-zA-Z0-9._-]/g, '_');

export const generateScopedNotebookPath = (opts: {
  tenantId: string;
  workspaceId: string;
  userId: string;
  notebookName?: string;
}): string => {
  const { tenantId, workspaceId, userId, notebookName = 'untitled' } = opts;
  if (!tenantId || !workspaceId || !userId) {
    throw new Error(
      'tenantId, workspaceId, and userId are required for session scoping',
    );
  }
  return `/${sanitizeSegment(tenantId)}/${sanitizeSegment(workspaceId)}/${sanitizeSegment(userId)}/${sanitizeSegment(notebookName)}.ipynb`;
};
