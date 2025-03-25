import React from 'react';
import QueryExpression from './QueryExpression';

interface CohortManagerProps {
  index: string;
}

const CohortManager = ({ index }: CohortManagerProps) => {
  return (
    <div className="mb-2">
      <QueryExpression index={index} />
    </div>
  );
};

export default CohortManager;
