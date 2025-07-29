import React from 'react';
import QueryExpression from './QueryExpression';

interface CohortManagerProps {
  index: string;
}

const CohortManagerAndExpression = ({ index }: CohortManagerProps) => {
  return (
    <div className="flex flex-col mb-2">
      <QueryExpression index={index} />
    </div>
  );
};

export default CohortManagerAndExpression;
