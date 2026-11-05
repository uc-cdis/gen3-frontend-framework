export interface SowerJobExpirationConfig {
  /**
   * Minutes since a job was last updated before it is removed from the job list.
   * Running jobs are never expired. `0` disables expiration. Defaults to 7 days.
   */
  jobExpirationMinutes?: number;
  /**
   * How often, in minutes, to check for expired jobs while the app is open.
   * Expired jobs are also removed on mount. Defaults to 60 minutes.
   */
  jobExpirationCheckMinutes?: number;
}

export type SowerConfiguration = SowerJobExpirationConfig;
