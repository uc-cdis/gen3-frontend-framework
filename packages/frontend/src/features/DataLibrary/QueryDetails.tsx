import React from 'react';
import { CohortItem, FilterSet } from '@gen3/core';
import { Group, Stack, Text } from '@mantine/core';
import ErrorCard from '../../components/ErrorCard';
import QueryExpressionSection from '../CohortBuilder/QueryExpressionSection';
import { isFilterSet } from '@gen3/core';

interface LabeledTextProps {
  label: string;
  text: string;
}

const LabeledText: React.FC<LabeledTextProps> = ({ label, text }) => {
  return (
    <div className="flex p-1 space-x-2">
      <Text fw={600}>{label}:</Text>
      <Text fw={400}> {text}</Text>
    </div>
  );
};

const QueryDetails: React.FC<CohortItem> = ({
  name,
  schemaVersion,
  index,
  data,
  id,
}) => {
  if (!data) {
    return <ErrorCard message="No cohort query" />;
  }

  return (
    <div className="flex flex-col">
      <Group
        classNames={{
          root: 'p-2 bg-base-lighter rounded-t-lg border-2 border-b-0 border-base-light',
        }}
      >
        <Text fw={700}>{name}</Text>
        <LabeledText label="Index:" text={index} />
        <LabeledText label="Schema Version:" text={schemaVersion} />
        <LabeledText label="ID:" text={id} />
      </Group>
      <div className="p-2 overflow-scroll w-full bg-base-lighter rounded-b-lg border-2 border-t-0 border-base-light">
        {isFilterSet(data) ? (
          <QueryExpressionSection
            currentCohortId={id}
            index={index}
            currentCohortName={name}
            filters={data}
            displayOnly={true}
            showTitle={false}
          ></QueryExpressionSection>
        ) : (
          <Text fw={400}>{JSON.stringify(data, null, 2)}</Text>
        )}
      </div>
    </div>
  );
};

export default QueryDetails;
