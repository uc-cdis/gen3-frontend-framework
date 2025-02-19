import React from 'react';

export interface AnalysisToolConfiguration {
  useDataLibraryServiceAPI?: boolean;
}

export interface AnalysisToolsProviderProps extends AnalysisToolConfiguration {
  children: React.ReactNode;
}
