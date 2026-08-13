/**
 * Leave the SPA for a full page load.
 *
 * Behind a function so the one place the session gives up client-side routing is
 * explicit, and so it can be observed in tests — jsdom cannot navigate and makes
 * both `window.location` and `location.href` non-configurable.
 */
export const redirectTo = (url: string) => {
  window.location.href = url;
};

/**
 * Is `pathname` the named page?
 *
 * Matched one path segment at a time, prefix-wise, so `/Workspace`,
 * `/Workspaces` and `/Workspace/[id]` all count as the Workspace page while
 * `/no-workspace-access` does not. Pass `router.pathname` — it carries no query
 * string or hash to confuse the match.
 *
 * A missing pathname is never a match: the caller is rendering on the server or
 * holds a router that has not resolved yet, and neither is a reason to change
 * session behavior.
 */
export const isUserOnPage = (pageName: string, pathname?: string): boolean => {
  if (!pageName || !pathname) return false;

  const target = pageName.toLowerCase();
  return pathname
    .toLowerCase()
    .split('/')
    .some((segment) => segment.startsWith(target));
};
