import { WorkspaceStatus } from '@gen3/core';

export interface JEGWorkspaceContextValue {
  /** Current lifecycle status of the JEG workspace. */
  status: WorkspaceStatus;
  /** The workspace ID being monitored, or null if not set. */
  workspaceId: string | null;
}

export interface MicroContainerReduxContextValue {
  /** Current lifecycle status of the micro container pod. */
  status: WorkspaceStatus;
  /** The Hatchery container hash/id matching the identifierTag (used for launch/terminate). */
  containerHash: string | null;
  /** Launch the micro container. No-op if already launching or running. */
  launch: () => Promise<void>;
  /** Terminate the micro container. */
  terminate: () => Promise<void>;
}
