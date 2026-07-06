import { isUserOnPage } from '../utils';

describe('isUserOnPage', () => {
  const originalWindow = global.window;

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  it('should return true when the current page includes the page name', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com/users/profile',
      },
      writable: true,
    });

    expect(isUserOnPage('profile')).toBe(true);
  });

  it('should match the page name case-insensitively', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com/users/Profile',
      },
      writable: true,
    });

    expect(isUserOnPage('profile')).toBe(true);
  });

  it('should return false when the current page does not include the page name', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://example.com/users/profile',
      },
      writable: true,
    });

    expect(isUserOnPage('settings')).toBe(false);
  });

  it('should return false when window is undefined', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(isUserOnPage('profile')).toBe(false);
  });
});
