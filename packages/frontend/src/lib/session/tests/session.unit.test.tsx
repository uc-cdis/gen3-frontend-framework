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
import type { Session } from '../types';

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

// Capture the imperative modal calls so the expiry-warning behaviour can be
// asserted without a real <ModalsProvider />
interface ExpiringModalInnerProps {
  minutesRemaining: number;
  onRenew: () => void;
  onLogout: () => void;
}

const mockOpenContextModal = jest.fn(
  (_args: { innerProps: ExpiringModalInnerProps }) => 'expiring-modal-id',
);
const mockCloseModal = jest.fn((_id: string) => undefined);
jest.mock('@mantine/modals', () => ({
  modals: {
    openContextModal: (args: { innerProps: ExpiringModalInnerProps }) =>
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
    await logoutSessionFresh();

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

    // A failed read must not leave the session unscheduled: the first retry is
    // due 30s later.
    await act(async () => {
      jest.advanceTimersByTime(30000);
    });
    expect(getUserDetails).toHaveBeenCalled();

    // ...and it keeps retrying, backing off to 60s for the second attempt.
    getUserDetails.mockClear();
    await act(async () => {
      jest.advanceTimersByTime(45000);
    });
    expect(getUserDetails).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(20000);
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
});

// ===========================================================================
// SessionProvider – endSession
// ===========================================================================

describe('SessionProvider – endSession', () => {
  const cookiesMock = jest.requireMock('cookies-next') as {
    hasCookie: jest.Mock;
  };

  it('resolves only after the logout redirect has been initiated', async () => {
    setupDefaultCoreMocks();
    hooksMock.useManageSession.mockReturnValue({
      status: 'issued',
      pending: false,
    });
    cookiesMock.hasCookie.mockReturnValue(true);

    const captured: { endSession?: () => Promise<void> } = {};
    const Capture = () => {
      const { endSession } = useSession();
      React.useEffect(() => {
        captured.endSession = endSession;
      }, [endSession]);
      return null;
    };

    render(
      <SessionProvider updateSessionTime={1} logoutInactiveUsers={false}>
        <Capture />
      </SessionProvider>,
    );

    await act(async () => {});

    await act(async () => {
      const pending = captured.endSession?.();
      expect(mockRouterPush).not.toHaveBeenCalled();
      await pending;
      expect(mockRouterPush).toHaveBeenCalledWith('https://example.com');
    });
  });
});
