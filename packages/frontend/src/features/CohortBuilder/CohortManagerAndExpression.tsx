import React from 'react';
import QueryExpression from './QueryExpression';
import { CohortManager, type CohortHooks } from './CohortManager';

interface CohortManagerProps {
  index: string;
}

const CohortManagerAndExpression = ({ index }: CohortManagerProps) => {
  // need to setup hooks

  return (
    <div className="flex flex-col mb-2">
      <QueryExpression index={index} />
    </div>
  );
};

export default CohortManagerAndExpression;
