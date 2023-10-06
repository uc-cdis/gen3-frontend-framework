import React from 'react';

interface QueryRepresentationLabelProps {
    readonly value: string | number;
}

const QueryRepresentationLabel: React.FC<QueryRepresentationLabelProps> = (
    { value} : QueryRepresentationLabelProps ) => {
  return <React.Fragment>{value}</React.Fragment>;
};

export default QueryRepresentationLabel;
