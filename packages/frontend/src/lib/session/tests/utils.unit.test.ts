/**
 * Unit tests for the session utils.
 *
 * isUserOnPage decides whether the inactivity check runs at all (it is skipped on
 * the Login page), so a false positive silently disables logout for a page.
 */

import { isUserOnPage } from '../utils';

describe('isUserOnPage', () => {
  it.each([
    ['Login', '/Login'],
    ['Login', 'login'],
    ['Login', '/LoginRedirect'],
    ['Login', '/Login/[error]'],
    ['Login', '/admin/Login/Callback'],
  ])('matches %s against %s', (pageName, pathName) => {
    expect(isUserOnPage(pageName, pathName)).toBe(true);
  });

  it.each([
    ['/no-login-access', 'Login'],
    ['/Explorer', 'Login'],
    ['/Workspace', 'Login'],
    ['/Discovery/[studyId]', 'Login'],
    ['/', 'Login'],
  ])('does not match %s against %s', (pathname, pageName) => {
    expect(isUserOnPage(pageName, pathname)).toBe(false);
  });

  it('matches per segment, not anywhere in the path', () => {
    // The page name has to start a segment: a route that merely contains the word
    // is a different page with a different inactivity policy.
    expect(isUserOnPage('Login', '/no-login-access')).toBe(false);
    expect(isUserOnPage('Login', '/my-login')).toBe(false);
  });

  it('is not a match without a pathname', () => {
    // Server rendering, or a router that has not resolved yet — neither is a
    // reason to change session behaviour, and neither may throw.
    expect(isUserOnPage('Login', undefined)).toBe(false);
    expect(isUserOnPage('Login', '')).toBe(false);
  });

  it('is not a match without a page name', () => {
    // Guards against an empty target matching every segment
    expect(isUserOnPage('', '/Login')).toBe(false);
  });
});

// redirectTo is a one-line window.location.href assignment that jsdom cannot
// exercise (Location is non-configurable). The URL it is handed is asserted in
// session.unit.test.tsx, where the seam is mocked.
