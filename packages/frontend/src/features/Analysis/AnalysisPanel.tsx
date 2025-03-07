import React from 'react';
import AnalysisCenter from './AnalysisCenter';
import { AnalysisCenterConfiguration } from './types';

const AnalysisPanel: React.FC<AnalysisCenterConfiguration> = ({ tools }) => {
  return <AnalysisCenter tools={tools} />;
};

export default AnalysisPanel;
