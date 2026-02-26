import React from 'react';

const FieldNameOverrides: Record<string, string> = {
  gender: 'gex',
  Gender: 'Sex',
};

interface QueryRepresentationLabelProps {
  readonly value: string | number;
}

const QueryRepresentationLabel = ({ value }: QueryRepresentationLabelProps) => {
  return <React.Fragment>{FieldNameOverrides[value] ?? value}</React.Fragment>;
};

export default QueryRepresentationLabel;
