import React from "react";
import { Gen3User, LoginStatus } from "@gen3/core";


export type JWTSessionStatus =
  | "not present"
  | "issued"
  | "expired"
  | "invalid"
  | "error";

export interface AuthTokenData {
  issued?: number;
  expires?: number;
  status: JWTSessionStatus;
}

export interface Session extends Record<string, unknown>, AuthTokenData {
  userStatus: LoginStatus;
  user?: Gen3User;
}

export interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session;
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
   * `SessionProvider` automatically refetches the session when the user switches between windows.
   * This option activates this behaviour if set to `true` (default).
   */
  refetchOnWindowFocus?: boolean;

  /**
   * logout the user if the session is inactive for the specified time defined by 'inactiveTimeLimit'.
   */
  logoutInactiveUsers?: boolean;
}
