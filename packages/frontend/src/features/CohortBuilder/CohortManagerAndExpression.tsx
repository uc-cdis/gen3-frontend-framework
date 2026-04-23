import React from 'react';
import QueryExpression from './QueryExpression';
import { type QueryExpressionProps } from './QueryExpression/QueryExpression';

const CohortManagerAndExpression = (props: QueryExpressionProps) => {
  return (
    <div className="flex flex-col mb-2">
      <QueryExpression {...props} />
    </div>
  );
};

export default CohortManagerAndExpression;
