# Token Revocation Handling in SessionProvider

## Problem

The `SessionProvider` handles token **expiry** well (exp-driven scheduler, heartbeat, catch-up on
visibility change), but **revocation** — where Fence invalidates a token server-side before its
`exp` — has several gaps.

### What happens today when a token is revoked

1. The browser still holds a valid-looking `access_token` cookie (future `exp`)
2. `authTokenData.status` stays `'issued'`; the RTK Query cache still says `'authenticated'`
3. `sessionInfo.status` stays `'issued'`; the UI treats the user as logged in
4. Every API call 401s silently in individual components — no centralized reaction
5. Detection only happens at the **next scheduled refresh** (fires at `exp`, potentially 20–30 min away)

---

## Fixes Applied

### Fix 1 — Force a live `/user` check on activity

**File:** `packages/frontend/src/lib/session/session.tsx` — `isSessionActive`

The `preferCacheValue` argument was removed from the `getUserDetails()` call. Previously `true` was
passed, which told RTK Query to return the cached result instead of hitting the network, meaning
activity-driven checks never detected revocation.

```tsx
// before
void getUserDetails(undefined, true)
// after
void getUserDetails()
```

### Fix 2 — Redirect to login on detected revocation

**File:** `packages/frontend/src/lib/session/session.tsx` — `isSessionActive`

When `isSessionActive` detects the user is no longer authenticated, it now calls `endSession()`
(which posts the server-side logout and redirects to `GEN3_REDIRECT_URL`) in addition to showing
the session expired modal — matching the behavior of the inactivity logout path.

```tsx
if (obj.data?.loginStatus !== 'authenticated' && userStatus === 'authenticated') {
  coreDispatch(showModal({ modal: Modals.SessionExpireModal }));
  void endSession();
}
```

---

## Remaining Suggestions

### Suggestion 1 — RTK Query middleware for 401s *(highest impact)*

Add a Redux middleware in `@gen3/core` that listens for rejected query results with `status === 401`
and dispatches an action the session subscribes to. This turns detection from "at next refresh
cycle" into "on the next API call after revocation."

```ts
const rtkQueryUnauthorizedMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action) && action.payload?.status === 401) {
    store.dispatch(markTokenRevoked());
  }
  return next(action);
};
```

The `SessionProvider` watches a `tokenRevoked` selector and calls `resettleLoginState()` immediately.

### Suggestion 2 — Broadcast revocation to other tabs

The existing `BroadcastChannel` carries `'activity-update'` messages only. If tab A detects
revocation, tabs B and C continue acting authenticated.

Add a `'token-revoked'` message type. When any tab detects revocation, post it:

```ts
broadcastChannelRef.current.postMessage({ type: 'token-revoked' });
```

In the channel's `message` handler, react to it by calling `resettleLoginState()` immediately.

### Suggestion 3 — Periodic forced `/user` heartbeat

The current heartbeat (`REFRESH_HEARTBEAT_INTERVAL_MILLISECONDS = 30s`) only supervises the refresh
timer — it does not make network calls. Add a separate, lower-frequency interval (e.g., every 3–5
minutes) that calls `getUserDetails()` unconditionally, bypassing cache. This caps the revocation
detection window for idle users who are not triggering activity events.

### Suggestion 4 — Distinguish revocation vs expiry in the UX

When `sessionInfo.status` transitions off `'issued'` while `authTokenData.status` is still
`'issued'` (i.e., the token's local `exp` has not passed), that is evidence of revocation rather
than natural expiry. A `revokedBeforeExpiry` flag on the context value would let consumers show an
appropriate message:

> *"Your access has been revoked. Contact your administrator."*

instead of the generic session-expired message.
