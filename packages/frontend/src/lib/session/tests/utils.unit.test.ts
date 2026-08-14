/**
 * Unit tests for the session utils.
 *
 * isUserOnPage decides whether the workspace inactivity limit applies and whether
 * the inactivity check runs at all, so a false positive silently changes the
 * logout policy for a page.
 */

import { isUserOnPage } from '../utils';

describe('isUserOnPage', () => {
  it.each([
    ['/Login', 'Login'],
    ['/login', 'Login'],
    ['Workspaces', 'Workspace'],
    ['Workspace', 'Workspace'],
    ['/Workspace/[id]', 'Workspace'],
    ['/admin/Workspace/Notebooks', 'Workspace'],
  ])('matches %s against %s', (pathname, pageName) => {
    expect(isUserOnPage(pageName, pathname)).toBe(true);
  });

  it.each([
    ['/no-workspace-access', 'Workspace'],
    ['/Explorer', 'Workspace'],
    ['/Discovery/[studyId]', 'Login'],
    ['/', 'Login'],
  ])('does not match %s against %s', (pathname, pageName) => {
    expect(isUserOnPage(pageName, pathname)).toBe(false);
  });

  it('matches per segment, not anywhere in the path', () => {
    // The page name has to start a segment: a route that merely contains the word
    // is a different page with a different inactivity policy.
    expect(isUserOnPage('Workspace', '/no-workspace-access')).toBe(false);
    expect(isUserOnPage('Workspace', '/my-workspace')).toBe(false);
  });

  it('is not a match without a pathname', () => {
    // Server rendering, or a router that has not resolved yet — neither is a
    // reason to change session behaviour, and neither may throw.
    expect(isUserOnPage('Login', undefined)).toBe(false);
    expect(isUserOnPage('Login', '')).toBe(false);
  });

  it('is not a match without a page name', () => {
    // Guards against an empty target matching every segment
    expect(isUserOnPage('', '/Workspace')).toBe(false);
  });
});

// redirectTo is a one-line window.location.href assignment that jsdom cannot
// exercise (Location is non-configurable). The URL it is handed is asserted in
// session.unit.test.tsx, where the seam is mocked.
