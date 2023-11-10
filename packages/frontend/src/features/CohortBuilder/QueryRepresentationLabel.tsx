import React from 'react';

interface QueryRepresentationLabelProps {
    readonly value: string | number;
}

const QueryRepresentationLabel = (
    { value} : QueryRepresentationLabelProps ) => {
  return <React.Fragment>{value}</React.Fragment>;
};

export default QueryRepresentationLabel;
