import React from 'react';
import { Gen3User, LoginStatus, JWTSessionStatus } from '@gen3/core';

export interface AuthTokenData {
  issued?: number;
  expires?: number;
  status: JWTSessionStatus;
  userContext?: Record<string, string>;
}

export interface Session extends AuthTokenData {
  userStatus?: LoginStatus;
  user?: Gen3User;
  updateSession: () => void;
  endSession: () => void;
  pending: boolean;
}

export interface SessionConfiguration {
  /**
   * A time interval (in minutes) after which the session will be re-fetched.
   * If set to `0` (default), the session is not polled.
   */
  updateSessionTime?: number;

  /**
   * number of seconds after which the session will be considered inactive.
   */
  inactiveTimeLimit?: number;

  /**
   * number of seconds after which the session will be considered inactive if using a workspace.
   */
  workspaceInactivityTimeLimit?: number;
  /**
   * `SessionProvider` automatically fetches the session when the user switches between windows.
   * This option activates this behaviour if set to `true` (default).
   */
  refetchOnWindowFocus?: boolean;

  /**
   * logout the user if the session is inactive for the specified time defined by 'inactiveTimeLimit'.
   */
  logoutInactiveUsers?: boolean;
}

export interface SessionProviderProps extends SessionConfiguration {
  children: React.ReactNode;
  session?: Session;
}
