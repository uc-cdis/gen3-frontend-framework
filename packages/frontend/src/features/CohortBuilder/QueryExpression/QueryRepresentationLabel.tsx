import React, { useContext, useEffect, useState } from 'react';
import { QueryExpressionContext } from './QueryExpressionContext';

interface QueryRepresentationLabelProps {
  readonly value: string | number;
  readonly field: string;
}

const QueryRepresentationLabel = ({
  value,
  field,
}: QueryRepresentationLabelProps) => {
  const [formattedValue, setFormattedValue] = useState('...');
  const { useFormatFilters } = useContext(QueryExpressionContext);
  const formatFilter = useFormatFilters();

  useEffect(() => {
    void formatFilter(value.toLocaleString(), field).then((v: string) => {
      setFormattedValue(v);
    });
  });

  return <React.Fragment>{formattedValue}</React.Fragment>;
};

export default QueryRepresentationLabel;
