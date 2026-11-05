import React from 'react';

interface LogicalOperatorLabelProps {
  readonly operator: 'and' | 'or';
  readonly className?: string;
}

const LogicalOperatorLabel = ({
  operator,
  className = '',
}: LogicalOperatorLabelProps) => (
  <span
    className={`flex items-center justify-center px-1 text-xs font-bold uppercase text-base-darkest ${className}`}
    data-testid={`query-logical-operator-${operator}`}
  >
    {operator}
  </span>
);

export default LogicalOperatorLabel;
