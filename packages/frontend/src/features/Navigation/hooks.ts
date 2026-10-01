import { useEffect, useState } from 'react';
import { useGetAuthzResourcesQuery } from '@gen3/core';
import { useSession } from '../../lib/session/session';
import { useProtectedRoutesContext } from '../../components/AuthorizedRoutes/ProtectedRoutesProvider';

/**
 * Login and authz state used to compute each navigation link's access status.
 *
 * `pending` stays true until both the session has resolved and, for a logged-in
 * user, the authz resources have been re-fetched for that login. Without the
 * second condition, links are briefly judged against the resources fetched
 * before login (typically none) and flash as "unauthorized".
 */
export const useNavigationAuthState = () => {
  const { status, pending: sessionPending } = useSession(false); // no redirect side-effects here
  const loggedIn = status === 'issued';
  const routesConfig = useProtectedRoutesContext();
  const {
    data,
    isFetching: isAuthzResourcesFetching,
    refetch,
  } = useGetAuthzResourcesQuery();

  // The login state the current resources were fetched for.
  const [resourcesFetchedFor, setResourcesFetchedFor] = useState<
    boolean | undefined
  >();

  // Re-fetch once per login transition. Keying this on `isFetching` instead would
  // re-trigger itself every time a fetch completes.
  useEffect(() => {
    if (sessionPending) return;
    if (!loggedIn) {
      setResourcesFetchedFor(false);
      return;
    }
    let cancelled = false;
    // refetch() throws synchronously if the query hasn't started; the query
    // holds its own error state, so settle either way rather than stay pending.
    void Promise.resolve()
      .then(() => refetch())
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setResourcesFetchedFor(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn, sessionPending, refetch]);

  const pending =
    sessionPending ||
    (loggedIn && (isAuthzResourcesFetching || resourcesFetchedFor !== true));

  return {
    loggedIn,
    pending,
    resources: data?.resources ?? [],
    routesConfig,
  };
};
