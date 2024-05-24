import React from 'react';

export interface CollapsedStateReducerAction {
  type: "expand" | "collapse" | "clear" | "init" | "expandAll" | "collapseAll";
  cohortId: string;
  field?: string;
}

export const QueryExpressionsExpandedContext = React.createContext<
  [Record<string, boolean>, (action: CollapsedStateReducerAction) => void]
>([{}, () => null]);
