/**
 * Unit tests for session.tsx
 *
 * Coverage targets:
 *  - logoutSession            – credentials vs. non-credentials logout path
 *  - useSession               – throws without provider, required redirect (once
 *    per transition), custom handler
 *  - useIsAuthenticated       – isAuthenticated flag and userContext passthrough
 *  - SessionProvider rendering – CSRF loading / error states
 *  - Token metadata on the context – issued / expires / userContext
 *  - Refresh scheduling       – expiry-driven timing, clock-skew bound, backoff on
 *    unhealthy cycles, definitive statuses, visibility catch-up
 *  - Activity listener lifecycle – listeners are only attached while the user is
 *    authenticated (status === 'issued') and are removed on logout
 *  - Cross-tab activity channel – unavailable / throwing / hostile payloads
 *  - Inactivity warning + logout – window sizing, renew, dismissal, modal cleanup
 *  - endSession               – awaitable, re-entrant-safe, settles the store
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
import type { Session } from '../types';

// ---------------------------------------------------------------------------
// Module mocks – must appear before any import that would resolve them
// ---------------------------------------------------------------------------

const mockRouterPush = jest.fn();
const routerState = { pathname: '/Explorer' };
jest.mock('next/router', () => ({
  // A fresh object per call, like the pages router on a route change, so tests
  // exercise the identity churn the provider has to tolerate.
  useRouter: jest.fn(() => ({
    push: mockRouterPush,
    basePath: '',
    get pathname() {
      return routerState.pathname;
    },
  })),
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

// Capture the imperative modal calls so the expiry-warning behaviour can be
// asserted without a real <ModalsProvider />
interface ExpiringModalInnerProps {
  minutesRemaining: number;
  onRenew: () => void;
  onLogout: () => void;
}

interface OpenContextModalArgs {
  innerProps: ExpiringModalInnerProps;
  onClose?: () => void;
  withCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

const mockOpenContextModal = jest.fn(
  (_args: OpenContextModalArgs) => 'expiring-modal-id',
);
const mockCloseModal = jest.fn((_id: string) => undefined);
jest.mock('@mantine/modals', () => ({
  modals: {
    openContextModal: (args: OpenContextModalArgs) =>
      mockOpenContextModal(args),
    close: (id: string) => mockCloseModal(id),
  },
}));

// Make useThrottledCallback a pass-through so throttled callbacks fire immediately
jest.mock('@mantine/hooks', () => ({
  ...jest.requireActual('@mantine/hooks'),
  useThrottledCallback: (fn: (...args: unknown[]) => unknown) => fn,
  // setupTests.ts's global beforeEach calls this on every mock of '@mantine/hooks'
  _resetMantineCounter: () => {},
}));

jest.mock('@mantine/core', () => ({
  ...jest.requireActual('@mantine/core'),
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

// Only the full-page navigation is stubbed; isUserOnPage stays real so the page
// matching the inactivity rules depend on is exercised, not mocked away.
const mockRedirectTo = jest.fn((_url: string) => undefined);
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  redirectTo: (url: string) => mockRedirectTo(url),
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
const sessionWrapper = (session: Session) =>
  Object.assign(
    ({ children }: { children: React.ReactNode }) => (
      <SessionContext.Provider value={session}>
        {children}
      </SessionContext.Provider>
    ),
    { displayName: 'SessionWrapper' },
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
  routerState.pathname = '/Explorer';
  // Reset channel mock counters between tests
  Object.values(mockChannel).forEach((fn) => (fn as jest.Mock).mockClear());
});

// ===========================================================================
// logoutSession
// ===========================================================================

describe('logoutSession', () => {
  const fetchMock = jest.fn();
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });
    jest.resetModules(); // clear the module cache so re-require picks up new env
  });

  afterAll(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    global.fetch = fetchMock;
  });

  it('calls /api/auth/credentialsLogout when credentials_token cookie is present', async () => {
    const { getCookie } = jest.requireMock('cookies-next') as {
      getCookie: jest.Mock;
    };
    getCookie.mockReturnValue('my-access-token');
    fetchMock.mockResolvedValue({ ok: true });

    // Re-import logoutSession after mocks are configured
    const { logoutSession: logoutSessionFresh } = await import('../session');
    await logoutSessionFresh('');

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/credentialsLogout');
  });

  it('does NOT call /api/auth/credentialsLogout when credentials_token is absent', async () => {
    const { getCookie } = jest.requireMock('cookies-next') as {
      getCookie: jest.Mock;
    };
    getCookie.mockReturnValue(undefined);

    await logoutSession('');

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

    expect(mockRouterPush).toHaveBeenCalledWith('/Login');
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

  it('handles an unauthenticated session once, not once per render', () => {
    // The router object changes identity on every route change, and it has to be
    // a dependency of the redirect effect. Without a guard, navigating while
    // unauthenticated fires the handler again — which for a delayed handler means
    // a second pending redirect.
    const session = makeSession('invalid', false);
    const onUnauthenticated = jest.fn();

    const { rerender } = renderHook(() => useSession(true, onUnauthenticated), {
      wrapper: sessionWrapper(session),
    });

    rerender();
    rerender();

    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('handles the next unauthenticated transition after re-authenticating', () => {
    const onUnauthenticated = jest.fn();
    const Probe = () => {
      useSession(true, onUnauthenticated);
      return null;
    };
    const tree = (session: Session) => (
      <SessionContext.Provider value={session}>
        <Probe />
      </SessionContext.Provider>
    );

    const { rerender } = render(tree(makeSession('invalid', false)));
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);

    // Logged back in — nothing to handle
    rerender(tree(makeSession('issued', false)));
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);

    // ...and logged out again: the guard must have been released
    rerender(tree(makeSession('invalid', false)));
    expect(onUnauthenticated).toHaveBeenCalledTimes(2);
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
  'keydown',
  'updateUserActivity',
  'scroll',
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

    // `keypress` never fires for arrows/backspace/delete/tab, so it must not be
    // what activity tracking relies on
    expect(addSpy.mock.calls.map(([event]) => event)).not.toContain('keypress');
  });

  it('registers scroll in the capture phase and passively', async () => {
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
      expect(activityAddCalls(addSpy).length).toBeGreaterThan(0);
    });

    // scroll does not bubble: without capture, scrolling a nested container is
    // invisible to the listener. Passive so it cannot delay the scroll.
    const scrollCall = addSpy.mock.calls.find(([event]) => event === 'scroll');
    expect(scrollCall?.[2]).toEqual({ passive: true, capture: true });

    const touchCall = addSpy.mock.calls.find(
      ([event]) => event === 'touchstart',
    );
    expect(touchCall?.[2]).toEqual({ passive: true });
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
// SessionProvider – expiry-driven refresh scheduling
// ===========================================================================

describe('SessionProvider – expiry-driven refresh scheduling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules a refresh from the token exp and calls getUserDetails when it fires', async () => {
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

    // Token expires 20 minutes from now — the scheduler should fire ~2
    // minutes early (REFRESH_MARGIN_MILLISECONDS), not on updateSessionTime's clock.
    const expiresSeconds = Math.floor(Date.now() / 1000) + 20 * 60;
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue({ status: 'issued', expires: expiresSeconds }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    // Flush mount effects (initial getUserDetails + the seeding fetch to
    // /api/auth/sessionToken) then clear the initial mount call.
    await act(async () => {});
    getUserDetails.mockClear();

    // Not yet due — well short of the 18-minute scheduled delay.
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();

    // Advance past the scheduled refresh (expires - REFRESH_MARGIN_MILLISECONDS).
    await act(async () => {
      jest.advanceTimersByTime(15 * 60 * 1000);
    });

    expect(getUserDetails).toHaveBeenCalled();
  });
});

// ===========================================================================
// SessionProvider – token metadata on the context
// ===========================================================================

/** Renders the token metadata the provider puts on the context */
const SessionProbe = () => {
  const session = useSession();
  return (
    <span data-testid="probe">
      {JSON.stringify({
        issued: session.issued ?? null,
        expires: session.expires ?? null,
        userContext: session.userContext ?? null,
      })}
    </span>
  );
};

describe('SessionProvider – token metadata on the context', () => {
  it('exposes issued / expires / userContext from the session token', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    const expires = Math.floor(Date.now() / 1000) + 20 * 60;
    const issued = Math.floor(Date.now() / 1000);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'issued',
        issued,
        expires,
        userContext: { username: 'alice' },
      }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <SessionProbe />
      </SessionProvider>,
    );

    await waitFor(() => {
      expect(JSON.parse(screen.getByTestId('probe').textContent)).toEqual({
        issued,
        expires,
        userContext: { username: 'alice' },
      });
    });
  });

  it('clears the token metadata when the user is no longer logged in', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'not present',
      pending: true,
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <SessionProbe />
      </SessionProvider>,
    );

    await act(async () => {});

    expect(JSON.parse(screen.getByTestId('probe').textContent)).toEqual({
      issued: null,
      expires: null,
      userContext: null,
    });
  });
});

// ===========================================================================
// SessionProvider – refresh scheduling resilience
// ===========================================================================

describe('SessionProvider – refresh scheduling resilience', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retries the refresh when the token expiry cannot be read', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // /api/auth/sessionToken is failing, so the expiry is unknown
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'boom' }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    // A failed read must not leave the session unscheduled: one prompt retry
    // 5s later, since hitting /user may fix things.
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(getUserDetails).toHaveBeenCalled();

    // ...then it backs off to 30s rather than retrying at that rate forever.
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(25000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(6000);
    });
    expect(getUserDetails).toHaveBeenCalled();

    // ...and doubles again to 60s for the next one.
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(55000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(6000);
    });
    expect(getUserDetails).toHaveBeenCalled();
  });

  it('backs off instead of tight-looping on an already-expiring token', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Inside the 2 minute refresh margin, and Fence is not moving the expiry
    // forward: the wall-clock delay stays negative on every read.
    const nowSeconds = Math.floor(Date.now() / 1000);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'issued',
        issued: nowSeconds - 20 * 60,
        expires: nowSeconds + 30,
      }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    // One prompt attempt at the floor — the refresh itself may reissue the token
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(getUserDetails).toHaveBeenCalled();

    // It didn't, so the next attempt backs off instead of firing 5s later again
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(25000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(6000);
    });
    expect(getUserDetails).toHaveBeenCalled();
  });

  it('bounds the delay by the token lifetime when the browser clock is behind', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Browser clock is an hour behind the server, so the raw `exp - now`
    // arithmetic claims ~78 minutes remain on a 20 minute token. The refresh has
    // to happen within one lifetime, not when the skewed clock says.
    const serverNowSeconds = Math.floor(Date.now() / 1000) + 60 * 60;
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'issued',
        issued: serverNowSeconds,
        expires: serverNowSeconds + 20 * 60,
      }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    // Bounded to lifetime - margin == 18 minutes
    await act(async () => {
      jest.advanceTimersByTime(17 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });
    expect(getUserDetails).toHaveBeenCalled();
  });

  it('does not retry when the token is definitively gone', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Well-formed answer: there is no token, so there is nothing to refresh
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ status: 'not present' }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it('makes exactly one recovery attempt on an expired token, then stops', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // 'expired' is a definitive answer, but hitting /user can still
    // re-authenticate through Fence's own session, so one attempt is worth it.
    const nowSeconds = Math.floor(Date.now() / 1000);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'expired',
        issued: nowSeconds - 20 * 60,
        expires: nowSeconds - 60,
      }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(getUserDetails).toHaveBeenCalledTimes(1);

    // Fence did not reissue, so nothing further is scheduled — polling a dead
    // token cannot bring it back.
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it('does not schedule anything for a malformed token', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // exp at or before iat: no refresh can fix this
    const nowSeconds = Math.floor(Date.now() / 1000);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'issued',
        issued: nowSeconds,
        expires: nowSeconds,
      }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );

    await act(async () => {});
    getUserDetails.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it('keeps the backoff across a tab foreground instead of restarting it', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'boom' }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    // Burn the one prompt attempt so the backoff is engaged
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    getUserDetails.mockClear();

    // Foregrounding re-derives the schedule; it must not reset the failure count,
    // or flipping tabs while the endpoint is down restarts fast retries.
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await act(async () => {
      jest.advanceTimersByTime(25000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it('throttles the visibility re-check', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Healthy token so the armed timer is ~18 minutes out and cannot add reads
    const nowSeconds = Math.floor(Date.now() / 1000);
    const fetchMock = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'issued',
        issued: nowSeconds,
        expires: nowSeconds + 20 * 60,
      }),
    });
    global.fetch = fetchMock;

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    const readsAfterMount = fetchMock.mock.calls.length;

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(fetchMock).toHaveBeenCalledTimes(readsAfterMount + 1);

    // Flipping back and forth must not be one request per flip
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(fetchMock).toHaveBeenCalledTimes(readsAfterMount + 1);

    // ...but a check is allowed again once the throttle window has passed
    await act(async () => {
      jest.advanceTimersByTime(11000);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(fetchMock).toHaveBeenCalledTimes(readsAfterMount + 2);
  });

  it('still attempts recovery on a token that expired while the tab was hidden', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // The endpoint is down, which is what a hidden tab's late-firing timers look
    // like: each unhealthy cycle spends another step of the backoff.
    global.fetch = jest.fn().mockResolvedValue({
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'boom' }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(5000); // burn the prompt attempt, engaging the backoff
    });

    // The tab comes back, and the token turned out to have expired meanwhile.
    const nowSeconds = Math.floor(Date.now() / 1000);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'expired',
        issued: nowSeconds - 20 * 60,
        expires: nowSeconds - 60,
      }),
    });
    getUserDetails.mockClear();

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // An expired token gets its recovery attempt even though the backoff counter
    // was already spent — sharing that counter meant nothing was armed here.
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(getUserDetails).toHaveBeenCalledTimes(1);

    // Still exactly one: Fence did not reissue, so polling stops.
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
  });

  it('settles the login state when the token no longer backs it', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    // Healthy at mount, so the refresh is armed ~18 minutes out and nothing else
    // is due.
    const nowSeconds = Math.floor(Date.now() / 1000);
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        status: 'issued',
        issued: nowSeconds,
        expires: nowSeconds + 20 * 60,
      }),
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    // The cookie is gone by the time the tab is foregrounded. `userStatus` is
    // derived from a cached /user response, so without an explicit request the
    // store keeps reporting an authenticated session against no token at all.
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ status: 'not present' }),
    });
    getUserDetails.mockClear();

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Asked for immediately, not on some later timer.
    expect(getUserDetails).toHaveBeenCalledTimes(1);
  });
});

// ===========================================================================
// SessionProvider – cross-tab activity channel
// ===========================================================================

describe('SessionProvider – cross-tab activity channel', () => {
  /** The 'message' listener the provider registered on the channel */
  const messageHandler = () => {
    const call = mockChannel.addEventListener.mock.calls.find(
      ([event]) => event === 'message',
    );
    if (!call) throw new Error('no message listener was registered');
    return call[1] as (event: MessageEvent) => void;
  };

  it('does not crash when BroadcastChannel is unavailable', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    const original = global.BroadcastChannel;
    // Safari < 15.4 and non-DOM environments
    // @ts-expect-error – deliberately removing the global
    delete global.BroadcastChannel;

    try {
      render(
        <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
          <div data-testid="child" />
        </SessionProvider>,
      );
      await act(async () => {});

      expect(screen.getByTestId('child')).toBeInTheDocument();
    } finally {
      global.BroadcastChannel = original;
    }
  });

  it('does not crash when the constructor throws', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    const channelCtor = global.BroadcastChannel as unknown as jest.Mock;
    channelCtor.mockImplementationOnce(() => {
      throw new Error('channel unavailable');
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div data-testid="child" />
      </SessionProvider>,
    );
    await act(async () => {});

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('ignores malformed messages from other senders on the channel', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    const handler = messageHandler();

    // Anything on the origin can post here; none of this may throw
    for (const data of [null, undefined, 'string', 42, {}, { type: 'other' }]) {
      expect(() => handler({ data } as MessageEvent)).not.toThrow();
    }

    // A well-formed message with a non-numeric timestamp is also ignored
    expect(() =>
      handler({
        data: { type: 'activity-update', timestamp: 'soon' },
      } as MessageEvent),
    ).not.toThrow();
  });

  it('clamps a future-dated activity timestamp to now', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    jest.useFakeTimers();

    try {
      render(
        <SessionProvider
          updateSessionTime={1}
          inactiveTimeLimit={3}
          expireWarningMinutes={1}
        >
          <div />
        </SessionProvider>,
      );
      await act(async () => {});

      // A tab claiming activity an hour into the future must not be able to hold
      // the inactivity clock open indefinitely.
      const handler = messageHandler();
      await act(async () => {
        handler({
          data: {
            type: 'activity-update',
            timestamp: Date.now() + 60 * 60 * 1000,
          },
        } as MessageEvent);
      });

      // Still logs out on schedule: warning at 2 minutes, logout at 3
      await act(async () => {
        jest.advanceTimersByTime(3 * 60 * 1000);
      });
      expect(mockOpenContextModal).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

// ===========================================================================
// SessionProvider – inactivity warning / logout
// ===========================================================================

describe('SessionProvider – inactivity warning', () => {
  const cookiesMock = jest.requireMock('cookies-next') as {
    hasCookie: jest.Mock;
  };

  /** innerProps of the most recent openContextModal call */
  const lastInnerProps = (): ExpiringModalInnerProps => {
    const calls = mockOpenContextModal.mock.calls;
    if (calls.length === 0) throw new Error('no modal was opened');
    return calls[calls.length - 1][0].innerProps;
  };

  beforeEach(() => {
    jest.useFakeTimers();
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    // Take the credentials-logout path so logout uses router.push instead of
    // assigning window.location.href, which jsdom cannot do.
    cookiesMock.hasCookie.mockReturnValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('widens the warning window so a coarse poll interval cannot skip it', async () => {
    // 10 minute poll, 20 minute limit, 5 minute warning: the raw 5 minute window
    // falls between ticks, so the lead is widened to one full poll.
    render(
      <SessionProvider
        updateSessionTime={10}
        inactiveTimeLimit={20}
        expireWarningMinutes={5}
      >
        <div />
      </SessionProvider>,
    );

    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(mockOpenContextModal).toHaveBeenCalledTimes(1);
    expect(lastInnerProps().minutesRemaining).toBe(10);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('skips the warning when the inactivity limit leaves no room for it', async () => {
    // Limit equals the poll interval: the first tick is already the logout tick,
    // so there is no window in which a warning could be shown.
    render(
      <SessionProvider
        updateSessionTime={5}
        inactiveTimeLimit={5}
        expireWarningMinutes={5}
      >
        <div />
      </SessionProvider>,
    );

    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(mockOpenContextModal).not.toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalled(); // logged out instead
  });

  it('renewing resets the inactivity clock instead of logging out anyway', async () => {
    // 1 minute poll, 3 minute limit, 1 minute warning -> warning at 2 minutes,
    // logout at 3 minutes.
    render(
      <SessionProvider
        updateSessionTime={1}
        inactiveTimeLimit={3}
        expireWarningMinutes={1}
      >
        <div />
      </SessionProvider>,
    );

    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });
    expect(mockOpenContextModal).toHaveBeenCalledTimes(1);

    // Renew closes the modal and restarts the inactivity clock
    await act(async () => {
      lastInnerProps().onRenew();
    });
    expect(mockCloseModal).toHaveBeenCalledWith('expiring-modal-id');

    // The tick that used to log the user out now sees a fresh clock
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(mockRouterPush).not.toHaveBeenCalled();

    // ...and the warning comes back only after another full window of inactivity
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(mockOpenContextModal).toHaveBeenCalledTimes(2);
  });

  it('closes the warning modal when the inactivity logout fires', async () => {
    render(
      <SessionProvider
        updateSessionTime={1}
        inactiveTimeLimit={3}
        expireWarningMinutes={1}
      >
        <div />
      </SessionProvider>,
    );

    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });
    expect(mockOpenContextModal).toHaveBeenCalledTimes(1);
    mockCloseModal.mockClear();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockCloseModal).toHaveBeenCalledWith('expiring-modal-id');
    expect(mockRouterPush).toHaveBeenCalled();
  });

  it('opens the warning so only its own buttons can dismiss it', async () => {
    render(
      <SessionProvider
        updateSessionTime={1}
        inactiveTimeLimit={3}
        expireWarningMinutes={1}
      >
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });

    // An Escape or click-outside dismissal leaves the provider holding an id for a
    // modal that is gone, which suppresses every later warning
    expect(mockOpenContextModal).toHaveBeenCalledWith(
      expect.objectContaining({
        withCloseButton: false,
        closeOnClickOutside: false,
        closeOnEscape: false,
        onClose: expect.any(Function),
      }),
    );
  });

  it('re-shows the warning if the modal is closed from outside the provider', async () => {
    // 1 minute poll, 4 minute limit, 2 minute warning -> two ticks inside the
    // warning window, so a re-open is observable before the logout tick.
    render(
      <SessionProvider
        updateSessionTime={1}
        inactiveTimeLimit={4}
        expireWarningMinutes={2}
      >
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(2 * 60 * 1000);
    });
    expect(mockOpenContextModal).toHaveBeenCalledTimes(1);
    expect(lastInnerProps().minutesRemaining).toBe(2);

    // Something else closed it (modals.closeAll, say). onClose has to release our
    // id or the user is logged out at the limit having seen no warning.
    await act(async () => {
      const { onClose } = mockOpenContextModal.mock.calls[0][0];
      onClose?.();
    });

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(mockOpenContextModal).toHaveBeenCalledTimes(2);
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('shows the timeout modal on a client-side logout redirect', async () => {
    const dispatch = jest.fn();
    coreMock.useCoreDispatch.mockReturnValue(dispatch);

    render(
      <SessionProvider
        updateSessionTime={1}
        inactiveTimeLimit={3}
        expireWarningMinutes={0}
      >
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(3 * 60 * 1000);
    });

    // The credentials redirect is client-side, so the modal survives it and is
    // what tells the user why they were logged out.
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SHOW_MODAL' }),
    );
    expect(mockRouterPush).toHaveBeenCalled();
  });

  it('does not show the timeout modal when the document is about to be replaced', async () => {
    const dispatch = jest.fn();
    coreMock.useCoreDispatch.mockReturnValue(dispatch);
    cookiesMock.hasCookie.mockReturnValue(false); // Fence logout

    render(
      <SessionProvider
        updateSessionTime={1}
        inactiveTimeLimit={3}
        expireWarningMinutes={0}
      >
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    await act(async () => {
      jest.advanceTimersByTime(3 * 60 * 1000);
    });

    // A full page load is coming, so the modal would only flash
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SHOW_MODAL' }),
    );
    expect(mockRedirectTo).toHaveBeenCalledWith(
      expect.stringContaining('fence.example.com/logout'),
    );
  });
});

// ===========================================================================
// SessionProvider – endSession
// ===========================================================================

describe('SessionProvider – endSession', () => {
  const cookiesMock = jest.requireMock('cookies-next') as {
    hasCookie: jest.Mock;
  };

  /** Renders the provider and hands back the context's endSession + its value */
  const renderWithCapture = async () => {
    const captured: {
      endSession?: () => Promise<void>;
      value?: Session;
    } = {};

    const Capture = () => {
      const session = useSession();
      React.useEffect(() => {
        captured.endSession = session.endSession;
        captured.value = session;
      }, [session]);
      return null;
    };

    const result = render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <Capture />
      </SessionProvider>,
    );

    await act(async () => {});
    return { ...result, captured };
  };

  it('resolves only after the logout redirect has been initiated', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    cookiesMock.hasCookie.mockReturnValue(true);

    const { captured } = await renderWithCapture();

    await act(async () => {
      const pending = captured.endSession?.();
      expect(mockRouterPush).not.toHaveBeenCalled();
      await pending;
      expect(mockRouterPush).toHaveBeenCalledWith('https://example.com');
    });
  });

  it('ignores a second logout while one is already under way', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    cookiesMock.hasCookie.mockReturnValue(true);

    const { captured } = await renderWithCapture();
    getUserDetails.mockClear();

    // Navigation is asynchronous, so the page stays live after logout starts and
    // the inactivity tick can re-enter
    await act(async () => {
      await Promise.all([captured.endSession?.(), captured.endSession?.()]);
    });

    expect(getUserDetails).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
  });

  it('accepts a later logout once the client-side redirect has landed', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    cookiesMock.hasCookie.mockReturnValue(true);

    const { captured } = await renderWithCapture();

    await act(async () => {
      await captured.endSession?.();
    });
    await act(async () => {
      await captured.endSession?.();
    });

    // The provider survives a client-side redirect, so the guard has to release
    expect(mockRouterPush).toHaveBeenCalledTimes(2);
  });

  it('settles the auth store before navigating away to Fence', async () => {
    const getUserDetails = setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    cookiesMock.hasCookie.mockReturnValue(false); // Fence logout

    // How many getUserDetails calls had landed when we navigated away
    let userDetailCallsAtRedirect = -1;
    mockRedirectTo.mockImplementation(() => {
      userDetailCallsAtRedirect = getUserDetails.mock.calls.length;
      return undefined;
    });

    const { captured } = await renderWithCapture();
    getUserDetails.mockClear();

    await act(async () => {
      await captured.endSession?.();
    });

    // Until getUserDetails lands, userStatus still reads authenticated and the
    // rest of the app behaves as though nothing happened
    expect(userDetailCallsAtRedirect).toBe(1);
    expect(mockRedirectTo).toHaveBeenCalledWith(
      'https://fence.example.com/logout?next=https://example.com',
    );
  });

  it('keeps the context value stable across navigations', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });

    const { captured, rerender } = await renderWithCapture();
    const firstValue = captured.value;

    // Every useRouter() call returns a new object, as the pages router does on a
    // route change. endSession must not churn with it, or every consumer of the
    // session context re-renders on every navigation.
    routerState.pathname = '/Workspace';
    rerender(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <div />
      </SessionProvider>,
    );
    await act(async () => {});

    expect(captured.value).toBe(firstValue);
  });
});
