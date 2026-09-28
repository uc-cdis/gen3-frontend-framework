import { createContext, useContext } from 'react';
import { WorkspaceTier } from '../types';

interface WorkspaceCenterContextValue {
  workspaceTier: WorkspaceTier;
  setWorkspaceTier: (tier: WorkspaceTier | null) => void;
}

const WorkspaceCenterContext =
  createContext<WorkspaceCenterContextValue | null>(null);

export const useWorkspaceCenterContext = (): WorkspaceCenterContextValue => {
  const ctx = useContext(WorkspaceCenterContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceLayout');
  return ctx;
};

export default WorkspaceCenterContext;
