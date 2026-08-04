import React from 'react';
import { type JWTSessionStatus, type LoginStatus } from '@gen3/core';

export interface AuthTokenData {
  issued?: number;
  expires?: number;
  status: JWTSessionStatus;
  userContext?: Record<string, string>;
}

export interface Session extends AuthTokenData {
  userStatus?: LoginStatus;
  updateSession: () => void;
  /** Resolves once logout has completed and the redirect has been initiated. */
  endSession: () => Promise<void>;
  pending: boolean;
}

export interface SessionConfiguration {
  /**
   * How often (in minutes) the inactivity check runs. Defaults to `5` minutes.
   *
   * This is the resolution of every inactivity decision: a user is logged out
   * somewhere between `inactiveTimeLimit` and `inactiveTimeLimit` plus this
   * interval. Setting it to `0` turns off activity tracking and inactivity
   * logout entirely, whatever `logoutInactiveUsers` says.
   */
  updateSessionTime?: number;

  /**
   * Number of minutes of inactivity after which the user is logged out.
   * `0` disables inactivity logout on non-workspace pages.
   */
  inactiveTimeLimit?: number;

  /**
   * Number of minutes of inactivity after which the user is logged out while on
   * a workspace page. Defaults to `0`, which means idle workspace sessions are
   * never ended — set it explicitly if that is not what you want.
   */
  workspaceInactivityTimeLimit?: number;
  /**
   * logout the user if the session is inactive for the specified time defined by 'inactiveTimeLimit'.
   */
  logoutInactiveUsers?: boolean; // deprecated

  /**
   *  should workspaces be monitored?
   */
  monitorWorkspace?: boolean;

  /**
   *  should payments be monitored?
   */
  monitorPayment?: boolean;

  /**
   * How many minutes before the *inactivity* logout to show the session expiring
   * warning. Defaults to 5.
   *
   * The effective lead is widened to at least one `updateSessionTime` interval,
   * since a window narrower than the poll can fall between ticks and never be
   * shown, and it is capped so at least one interval of the inactivity window
   * remains ahead of it, since a warning that starts at zero elapsed time fires
   * immediately after login. Where the inactivity limit is too short to satisfy
   * both, no warning is shown. The modal reports the effective lead, not this
   * value.
   */
  expireWarningMinutes?: number;
}

export interface SessionProviderProps extends SessionConfiguration {
  children: React.ReactNode;
}
