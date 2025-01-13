import React from 'react';
import { Center, Group, Loader, Stack, Tabs, Text } from '@mantine/core';
import { useGetMetadataByIdQuery } from '@gen3/core';
import { MetadataElement, MetadataPropertiesConfiguration } from './types';
import MetadataPropertiesTable from './MetadataPropertiesTable';
import { ErrorCard } from '../../../components/MessageCards';

interface MetadataSchema {
  url: string;
  version: string;
  date: string;
  elements: Array<MetadataElement>;
}

const isMetadataSchema = (
  obj: unknown,
  definitionsFieldName: string,
): obj is MetadataSchema => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  return (
    typeof record.url === 'string' &&
    typeof record.version === 'string' &&
    typeof record.date === 'string' &&
    definitionsFieldName in record &&
    typeof record[definitionsFieldName] === 'object'
  );
};

const MetadataSchemaPanel = ({
  label,
  schemaName,
  definitionsFieldName,
  fontSize = 'sm',
}: MetadataPropertiesConfiguration) => {
  const { data, isLoading, isError } = useGetMetadataByIdQuery(schemaName);

  if (isLoading) {
    return (
      <Center className="mt-10">
        <Loader></Loader>
      </Center>
    );
  }

  if (isError) {
    return (
      <ErrorCard message="There was a error getting the Metadata schema" />
    );
  }

  if (isMetadataSchema(data, definitionsFieldName)) {
    const elements = data[
      definitionsFieldName
    ] as unknown as Array<MetadataElement>;
    return (
      <div className="w-full m-2 bg-base-lightest">
        <Stack>
          <Group justify="space-between" className="px-4 mt-3">
            <Text fw={600} size={fontSize} c="base-contrast[0]">
              {label}
            </Text>
            <Group>
              <Group>
                <Text fw={600} size={fontSize} c="base-contrast[0]">
                  Version:
                </Text>
                <Text c="base-contrast[0]" size={fontSize}>
                  {data.version}
                </Text>
              </Group>
              <Group>
                <Text fw={600} size={fontSize} c="base-contrast[0]">
                  Date:
                </Text>
                <Text size={fontSize} c="base-contrast[0]">
                  {data.date}
                </Text>
              </Group>
            </Group>
          </Group>
          <MetadataPropertiesTable elements={elements} fontSize={fontSize} />
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
        definitionsFieldName={schemas[0].definitionsFieldName}
      />
    );
  }

  return (
    <Tabs
      defaultValue={schemas[0].schemaName}
      className="w-full"
      keepMounted={false}
    >
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
            definitionsFieldName={schema.definitionsFieldName}
            fontSize={schema.fontSize}
          />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default MetadataDictionary;
