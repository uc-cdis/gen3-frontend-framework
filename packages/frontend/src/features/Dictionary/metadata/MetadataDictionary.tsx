import React from 'react';
import { Group, Loader, Stack, Tabs, Text } from '@mantine/core';
import { type JSONObject, useGetMetadataByIdQuery } from '@gen3/core';
import { MetadataElement, MetadataPropertiesConfiguration } from './types';
import MetadataPropertiesTable from './MetadataPropertiesTable';
import { ErrorCard } from '../../../components/MessageCards';

interface MetadataSchema {
  url: string;
  version: string;
  date: string;
  subject_metadata_elements: Array<MetadataElement>;
}

const isMetadataSchema = (obj: unknown): obj is MetadataSchema => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  return (
    typeof record.url === 'string' &&
    typeof record.version === 'string' &&
    typeof record.date === 'string' &&
    record.subject_metadata_elements !== null &&
    typeof record.subject_metadata_elements === 'object'
  );
};

const MetadataSchemaPanel = ({
  label,
  schemaName,
}: MetadataPropertiesConfiguration) => {
  const { data, isLoading, isError } = useGetMetadataByIdQuery(schemaName);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <ErrorCard message="There was a error getting the Metadata schema" />
    );
  }

  if (isMetadataSchema(data)) {
    return (
      <div className="w-full m-2">
        <Stack>
          <Group>
            <Text>{label}</Text>
            <Group>
              <Text>Version:</Text>
              <Text>{data.version}</Text>
            </Group>
            <Group>
              <Text>Date:</Text>
              <Text>{data.date}</Text>
            </Group>
          </Group>
          <MetadataPropertiesTable elements={data.subject_metadata_elements} />
        </Stack>
      </div>
    );
  }
};

export interface MetadataDictionaryProps {
  schemas: Array<MetadataPropertiesConfiguration>;
}
const MetadataDictionary = ({ schemas }: MetadataDictionaryProps) => {
  if (schemas.length === 1) {
    return (
      <MetadataSchemaPanel
        label={schemas[0].label}
        schemaName={schemas[0].schemaName}
      />
    );
  }

  return (
    <Tabs>
      <Tabs.List>
        {schemas.map((schema) => (
          <Tabs.Tab value={schema.schemaName} key={schema.schemaName}>
            {schema.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {schemas.map((schema) => (
        <Tabs.Panel value={schema.schemaName} key={schema.schemaName}>
          <MetadataSchemaPanel
            label={schema.label}
            schemaName={schema.schemaName}
          />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default MetadataDictionary;
