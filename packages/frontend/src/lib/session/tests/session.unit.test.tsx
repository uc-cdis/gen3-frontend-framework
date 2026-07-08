/**
 * Unit tests for session.tsx
 *
 * Coverage targets:
 *  - logoutSession            – credentials vs. non-credentials logout path
 *  - useSession               – throws without provider, required redirect, custom handler
 *  - useIsAuthenticated       – isAuthenticated flag and userContext passthrough
 *  - SessionProvider rendering – CSRF loading / error states
 *  - Activity listener lifecycle (Bug #2 fix) – listeners are only attached while
 *    the user is authenticated (status === 'issued') and are removed on logout
 *  - Online / offline (useOnline wiring) – interval pauses while offline
 *  - Initial mount fetch      – getUserDetails is called once on mount
 */

import React from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  logoutSession,
  SessionContext,
  SessionProvider,
  useIsAuthenticated,
  useSession,
} from '../session';
import { Session } from '../types';

// ---------------------------------------------------------------------------
// Module mocks – must appear before any import that would resolve them
// ---------------------------------------------------------------------------

const mockRouterPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ push: mockRouterPush })),
}));

jest.mock('cookies-next', () => ({
  getCookie: jest.fn(),
  hasCookie: jest.fn(),
}));

jest.mock('@gen3/core', () => ({
  useGetCSRFQuery: jest.fn(),
  useLazyFetchUserDetailsQuery: jest.fn(),
  useCoreSelector: jest.fn(),
  useCoreDispatch: jest.fn(),
  selectUserAuthStatus: jest.fn(),
  showModal: jest.fn((args: unknown) => ({
    type: 'SHOW_MODAL',
    payload: args,
  })),
  Modals: { SessionExpireModal: 'SessionExpireModal' },
  GEN3_FENCE_API: 'https://fence.example.com',
  GEN3_REDIRECT_URL: 'https://example.com',
}));

jest.mock('@mantine/notifications', () => ({
  showNotification: jest.fn(),
}));

// Make useThrottledCallback a pass-through so throttled callbacks fire immediately
jest.mock('@mantine/hooks', () => ({
  useThrottledCallback: (fn: (...args: unknown[]) => unknown) => fn,
}));

jest.mock('@mantine/core', () => ({
  Center: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="center">{children}</div>
  ),
  Loader: () => <div data-testid="loader" />,
}));

jest.mock('../../../components/Providers/ResourceMonitor', () => ({
  useWorkspaceResourceMonitor: jest.fn(),
}));

jest.mock('../../../components/Modals/SessionExpiringModal', () => ({
  SessionExpiringModal: jest.fn(
    ({
      openModal,
      onRenew,
      onLogout,
      minutesRemaining,
    }: {
      openModal: boolean;
      onRenew: () => void;
      onLogout: () => void;
      minutesRemaining: number;
    }) =>
      openModal ? (
        <div data-testid="session-expiring-modal">
          <span data-testid="expiry-minutes">{minutesRemaining}</span>
          <button data-testid="renew-button" onClick={onRenew}>
            Renew
          </button>
          <button data-testid="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      ) : null,
  ),
}));

// Mock useManageSession so we can control sessionInfo.status directly
// without pulling in the jose / JWT dependencies from hooks.ts
jest.mock('../hooks', () => ({
  useManageSession: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are registered)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Typed mock references
// ---------------------------------------------------------------------------

const coreMock = jest.requireMock('@gen3/core') as {
  useGetCSRFQuery: jest.Mock;
  useLazyFetchUserDetailsQuery: jest.Mock;
  useCoreSelector: jest.Mock;
  useCoreDispatch: jest.Mock;
};

const hooksMock = jest.requireMock('../hooks') as {
  useManageSession: jest.Mock;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Session object for context injection */
const makeSession = (status: Session['status'], pending: boolean): Session => ({
  status,
  pending,
  userContext: { username: 'alice' },
  updateSession: jest.fn(),
  endSession: jest.fn(),
});

/** Wrap a hook in the SessionContext so it can call useSession */
const sessionWrapper =
  (session: Session) =>
  ({ children }: { children: React.ReactNode }) => (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );

/** Standard successful CSRF + getUserDetails default */
const setupDefaultCoreMocks = (
  getUserDetails = jest.fn().mockResolvedValue({}),
) => {
  coreMock.useGetCSRFQuery.mockReturnValue({ isSuccess: true, isError: false });
  coreMock.useLazyFetchUserDetailsQuery.mockReturnValue([getUserDetails]);
  coreMock.useCoreSelector.mockReturnValue('unauthenticated');
  coreMock.useCoreDispatch.mockReturnValue(jest.fn());
  // Default: session token is 'not present' — no expiry timers are scheduled
  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    json: jest.fn().mockResolvedValue({ status: 'not present' }),
  });
  return getUserDetails;
};

// ---------------------------------------------------------------------------
// BroadcastChannel stub (not available in jsdom)
// ---------------------------------------------------------------------------

const mockChannel = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  postMessage: jest.fn(),
  close: jest.fn(),
};

beforeAll(() => {
  Object.defineProperty(global, 'BroadcastChannel', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockChannel),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  // Reset channel mock counters between tests
  Object.values(mockChannel).forEach((fn) => (fn as jest.Mock).mockClear());
});

// ===========================================================================
// logoutSession
// ===========================================================================

describe('logoutSession', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
  });

  it('calls /api/auth/credentialsLogout when credentials_token cookie is present', async () => {
    const { getCookie } = jest.requireMock('cookies-next') as {
      getCookie: jest.Mock;
    };
    getCookie.mockReturnValue('my-access-token');
    fetchMock.mockResolvedValue({ ok: true });

    await logoutSession();

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/credentialsLogout');
  });

  it('does NOT call /api/auth/credentialsLogout when credentials_token is absent', async () => {
    const { getCookie } = jest.requireMock('cookies-next') as {
      getCookie: jest.Mock;
    };
    getCookie.mockReturnValue(undefined);

    await logoutSession();

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useSession
// ===========================================================================

describe('useSession', () => {
  it('throws when not wrapped in a <SessionProvider />', () => {
    // Suppress the expected error boundary output
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSession())).toThrow(
      '[gen3]: `useSession` must be wrapped in a <SessionProvider />',
    );
  });

  it('returns the session from context', () => {
    const session = makeSession('issued', false);
    const { result } = renderHook(() => useSession(), {
      wrapper: sessionWrapper(session),
    });

    expect(result.current.status).toBe('issued');
    expect(result.current.pending).toBe(false);
  });

  it('redirects to Login when required=true and user is unauthenticated', () => {
    const session = makeSession('invalid', false);
    renderHook(() => useSession(true), { wrapper: sessionWrapper(session) });

    expect(mockRouterPush).toHaveBeenCalledWith('Login');
  });

  it('calls onUnauthenticated instead of redirecting when provided', () => {
    const session = makeSession('invalid', false);
    const onUnauthenticated = jest.fn();

    renderHook(() => useSession(true, onUnauthenticated), {
      wrapper: sessionWrapper(session),
    });

    expect(onUnauthenticated).toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('does not redirect when pending=true even if not authenticated', () => {
    // pending means "still loading" – we must not redirect prematurely
    const session = makeSession('not present', true);
    renderHook(() => useSession(true), { wrapper: sessionWrapper(session) });

    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useIsAuthenticated
// ===========================================================================

describe('useIsAuthenticated', () => {
  it('returns isAuthenticated=true and userContext when status is issued', () => {
    const session = makeSession('issued', false);
    const { result } = renderHook(() => useIsAuthenticated(), {
      wrapper: sessionWrapper(session),
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ username: 'alice' });
  });

  it('returns isAuthenticated=false when status is not issued', () => {
    const session = makeSession('invalid', false);
    const { result } = renderHook(() => useIsAuthenticated(), {
      wrapper: sessionWrapper(session),
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});

// ===========================================================================
// SessionProvider – rendering
// ===========================================================================

describe('SessionProvider – rendering', () => {
  it('shows a loader while CSRF is still loading', () => {
    setupDefaultCoreMocks();
    coreMock.useGetCSRFQuery.mockReturnValue({
      isSuccess: false,
      isError: false,
    });
    hooksMock.useManageSession.mockReturnValue({
      status: 'not present',
      pending: true,
    });

    render(
      <SessionProvider>
        <div data-testid="child">hello</div>
      </SessionProvider>,
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('shows an error message when the CSRF call fails', () => {
    setupDefaultCoreMocks();
    coreMock.useGetCSRFQuery.mockReturnValue({
      isSuccess: false,
      isError: true,
    });
    hooksMock.useManageSession.mockReturnValue({
      status: 'not present',
      pending: true,
    });

    render(
      <SessionProvider>
        <div>child</div>
      </SessionProvider>,
    );

    expect(screen.getByTestId('center')).toHaveTextContent(
      'Error from the commons services',
    );
  });

  it('renders children when CSRF succeeds', () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'not present',
      pending: true,
    });

    render(
      <SessionProvider>
        <div data-testid="child">hello</div>
      </SessionProvider>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

// ===========================================================================
// SessionProvider – initial mount fetch
// ===========================================================================

describe('SessionProvider – initial mount fetch', () => {
  it('calls getUserDetails once on mount to establish auth state', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'not present',
      pending: true,
    });

    render(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(getUserDetails).toHaveBeenCalledTimes(1);
    });
  });
});

// ===========================================================================
// SessionProvider – activity listener lifecycle
// ===========================================================================

const ACTIVITY_EVENTS = [
  'mousedown',
  'keypress',
  'updateUserActivity',
  'scroll',
  'click',
  'touchstart',
] as const;

describe('SessionProvider – activity listener lifecycle', () => {
  let addSpy: jest.SpyInstance;
  let removeSpy: jest.SpyInstance;

  beforeEach(() => {
    addSpy = jest.spyOn(window, 'addEventListener');
    removeSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  const activityAddCalls = (spy: jest.SpyInstance) =>
    spy.mock.calls.filter(([event]) =>
      (ACTIVITY_EVENTS as readonly string[]).includes(event),
    );

  it('does NOT register activity listeners when user is not authenticated', async () => {
    setupDefaultCoreMocks();
    // Not logged in
    hooksMock.useManageSession.mockReturnValue({
      status: 'not present',
      pending: true,
    });

    render(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    // Allow all effects to flush
    await act(async () => {});

    expect(activityAddCalls(addSpy)).toHaveLength(0);
  });

  it('registers all activity listeners when the user is authenticated', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    render(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    await waitFor(() => {
      const registeredEvents = activityAddCalls(addSpy).map(([event]) => event);
      ACTIVITY_EVENTS.forEach((ev) => {
        expect(registeredEvents).toContain(ev);
      });
    });
  });

  it('removes all activity listeners when the user logs out', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    const { rerender } = render(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    // Wait for initial listener registration
    await waitFor(() => {
      expect(activityAddCalls(addSpy).length).toBeGreaterThan(0);
    });

    // Simulate logout
    hooksMock.useManageSession.mockReturnValue({
      status: 'invalid',
      pending: false,
    });
    rerender(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    await waitFor(() => {
      const removedEvents = removeSpy.mock.calls
        .filter(([event]) =>
          (ACTIVITY_EVENTS as readonly string[]).includes(event),
        )
        .map(([event]) => event);

      ACTIVITY_EVENTS.forEach((ev) => {
        expect(removedEvents).toContain(ev);
      });
    });
  });

  it('does not re-register activity listeners after logging out', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    const { rerender } = render(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(activityAddCalls(addSpy).length).toBeGreaterThan(0);
    });

    // Record how many add calls happened while logged in
    const addCallsWhileLoggedIn = activityAddCalls(addSpy).length;

    // Simulate logout
    hooksMock.useManageSession.mockReturnValue({
      status: 'invalid',
      pending: false,
    });
    rerender(
      <SessionProvider updateSessionTime={1}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});

    // No new activity listeners should have been added after logout
    expect(activityAddCalls(addSpy)).toHaveLength(addCallsWhileLoggedIn);
  });
});

// ===========================================================================
// SessionProvider – online / offline (useOnline wiring)
// ===========================================================================

describe('SessionProvider – online / offline interval control', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls getUserDetails on the interval tick when online', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Ensure browser is online (jsdom default)
    Object.defineProperty(navigator, 'onLine', {
      get: () => true,
      configurable: true,
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    // Flush mount effects then clear the initial mount call
    await act(async () => {});
    getUserDetails.mockClear();

    // Advance past the 1-minute interval and past the 5-minute UPDATE_SESSION_LIMIT
    // so refreshSession actually calls getUserDetails
    await act(async () => {
      jest.advanceTimersByTime(6 * 60 * 1000);
    });

    expect(getUserDetails).toHaveBeenCalled();
  });

  it('does NOT call getUserDetails on the interval tick when offline', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      get: () => false,
      configurable: true,
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    // Advance well past the interval – should not fire because isOnline is false
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(getUserDetails).not.toHaveBeenCalled();

    // Restore
    Object.defineProperty(navigator, 'onLine', {
      get: () => true,
      configurable: true,
    });
  });

  it('resumes polling after coming back online', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    let online = false;
    Object.defineProperty(navigator, 'onLine', {
      get: () => online,
      configurable: true,
    });

    const { rerender } = render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    // Confirm no polling while offline
    await act(async () => {
      jest.advanceTimersByTime(6 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();

    // Come back online and trigger a rerender so useOnline state updates
    online = true;
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    rerender(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {
      jest.advanceTimersByTime(6 * 60 * 1000);
    });
    expect(getUserDetails).toHaveBeenCalled();

    Object.defineProperty(navigator, 'onLine', {
      get: () => true,
      configurable: true,
    });
  });
});
