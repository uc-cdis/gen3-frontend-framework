import React, { useMemo } from 'react';
import { DataDownloadLinks, DownloadLinkFields } from '../types';
import { GEN3_FENCE_API, JSONObject } from '@gen3/core';
import { Accordion, Button, Group, Stack, Text } from '@mantine/core';
import { FiDownload as DownloadIcon } from 'react-icons/fi';

const extractFieldData = (
  data: JSONObject,
  fieldsMap: DownloadLinkFields,
): Record<string, string | undefined> => {
  const result: Record<string, string | undefined> = {};
  Object.keys(fieldsMap).forEach((key) => {
    const value = fieldsMap[key as keyof DownloadLinkFields];
    if (value in data && typeof data[value] === 'string') {
      result[key] = data[value] as string;
    } else {
      result[key] = undefined;
    }
  });
  return result;
};

interface DataDownloadLinksProps {
  readonly studyData: JSONObject;
  readonly downloadLinks?: DataDownloadLinks;
  readonly downloadLinkFields?: DownloadLinkFields;
}

const DownloadLinksPanel = ({
  studyData,
  downloadLinks,
  downloadLinkFields = {
    titleField: 'title',
    descriptionField: 'description',
    idField: 'guid',
  },
}: DataDownloadLinksProps) => {
  const downloadEntries = useMemo(() => {
    if (!downloadLinks || !studyData[downloadLinks.field]) return undefined;
    const studyDownloadLinks = studyData[downloadLinks.field] as JSONObject[];
    return studyDownloadLinks.map((data: JSONObject) =>
      extractFieldData(data, downloadLinkFields),
    );
  }, [studyData, downloadLinks, downloadLinkFields]);

  return (
    <Accordion>
      <Accordion.Item value="downloadLinks">
        <Accordion.Control>
          <Text>{downloadLinks?.name || 'Data Download Links'}</Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {downloadEntries &&
              downloadEntries.map(
                (entry: Record<string, string | undefined>) => {
                  // minimum required fields are title and id
                  if (
                    entry['titleField'] === undefined ||
                    entry['idField'] === undefined
                  ) {
                    return null;
                  }
                  const id = entry['idField'];
                  return (
                    <Group justify="space-between" key={id} gap="md">
                      <Text>{entry['titleField'] || ''}</Text>
                      <Button
                        component="a"
                        href={`${GEN3_FENCE_API}/data/${id}?expires_in=900&redirect`}
                        target="_blank"
                        rel="noreferrer"
                        type="text"
                        leftSection={<DownloadIcon />}
                        data-disabled={!id}
                      >
                        Download File
                      </Button>
                    </Group>
                  );
                },
              )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default DownloadLinksPanel;
