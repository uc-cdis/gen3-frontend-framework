import React, { useContext, ReactNode } from 'react';
import { AnalysisToolConfiguration, AnalysisToolsProviderProps } from './types';

// Default context value for consistency and clarity
const defaultContextValue: AnalysisToolConfiguration = {
  useDataLibraryServiceAPI: false,
};

// Create Context
export const AnalysisToolContext =
  React.createContext<AnalysisToolConfiguration>(defaultContextValue);

// Custom Hook
export const useAnalysisTools = () => useContext(AnalysisToolContext);

// Extracted function to create context value
const createContextValue = (
  isDataLibraryServiceEnabled: boolean,
): AnalysisToolConfiguration => ({
  useDataLibraryServiceAPI: isDataLibraryServiceEnabled,
});

// Provider Component
export const AnalysisToolsProvider = ({
  useDataLibraryServiceAPI = false,
  children,
}: AnalysisToolsProviderProps) => {
  const contextValue = createContextValue(useDataLibraryServiceAPI);

  return (
    <AnalysisToolContext.Provider value={contextValue}>
      {children}
    </AnalysisToolContext.Provider>
  );
};
