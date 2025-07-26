import React from 'react';
import QueryExpression from './QueryExpression';
import CohortManager from './CohortManager/CohortManager';

interface CohortManagerProps {
  index: string;
}

const CohortManagerAndExpression = ({ index }: CohortManagerProps) => {
  return (
    <div className="flex flex-col mb-2">
      <CohortManager />
      <QueryExpression index={index} />
    </div>
  );
};

export default CohortManagerAndExpression;
