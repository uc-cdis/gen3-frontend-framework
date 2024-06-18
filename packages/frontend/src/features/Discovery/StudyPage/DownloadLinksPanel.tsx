import React, { useMemo } from 'react';
import { DataDownloadLinks, DownloadLinkFields } from '../types';
import { JSONObject } from '@gen3/core';
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
                  const id = entry[downloadLinkFields.idField];
                  return (
                    <Group key={id} position="apart">
                      <Text>{entry['titleField'] || ''}</Text>
                      <Button leftIcon={<DownloadIcon />} disabled={!id}>
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
