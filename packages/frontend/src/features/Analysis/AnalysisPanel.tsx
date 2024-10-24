import { useEffect } from 'react';
import AnalysisCenter from './AnalysisCenter';
import { AnalysisCenterConfiguration } from './types';

const AnalysisPanel: React.FC<AnalysisCenterConfiguration> = ({ analysis }) => {
  return <AnalysisCenter analysis={analysis} />;
};

export default AnalysisPanel;
