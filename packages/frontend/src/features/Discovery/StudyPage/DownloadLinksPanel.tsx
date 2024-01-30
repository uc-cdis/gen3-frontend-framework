import React, { useMemo } from 'react';
import { DataDownloadLinks, DownloadLinkFields } from '../types';
import { JSONObject } from '@gen3/core';
import { Accordion, Button, Group, Text } from '@mantine/core';

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
  readonly studyData: JSONObject
  readonly downloadLinks: DataDownloadLinks;
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
  const downloadEntries = useMemo(
    () => {
      const studyDownloadLinks = studyData[downloadLinks.field] as JSONObject[];
      return studyDownloadLinks.map((data : JSONObject) => extractFieldData(data , downloadLinkFields));
    },
        [studyData, downloadLinks, downloadLinkFields],
      );


  if (
    downloadEntries === undefined ||
    downloadLinks === undefined ||
    downloadLinks.field === undefined ||
    studyData[downloadLinks.field]
  ) {
    return false;
  }


  return (
    <Accordion>
      <Accordion.Item value="downloadLinks">
        <Accordion.Control>
          Customization
          <Text>{downloadLinks?.name || 'Data Download Links'}</Text>
        </Accordion.Control>

        {downloadEntries && downloadEntries.map((entry: Record<string, string | undefined>) => {
          // minimum required fields are title and id
          if (
            entry[downloadLinkFields.titleField] === undefined ||
            entry[downloadLinkFields.idField] === undefined
          ) {
            return null;
          }
          const id = entry[downloadLinkFields.idField];
          return (
            <Group key={id}>
              <Button>
                {id}
              </Button>
              );
              <Text>{entry[downloadLinkFields.titleField] || ''}</Text>
              <Text>{entry[downloadLinkFields?.descriptionField] || ''}</Text>
            </Group>
          );
        })}
      </Accordion.Item>
    </Accordion>
  );
};

export default DownloadLinksPanel;
