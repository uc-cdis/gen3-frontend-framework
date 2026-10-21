import React, { useMemo } from 'react';
import { DataDownloadLinks, DownloadLinkFields } from '../../Study/types'
import { GEN3_FENCE_API, JSONObject } from '@gen3/core';
import { Button, Text, Tooltip, Table, Title } from '@mantine/core';
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
  readonly disabled?: boolean; // show the links but disable the download buttons
}

const DownloadLinksPanel = ({
  studyData,
  downloadLinks,
  downloadLinkFields = {
    titleField: 'title',
    descriptionField: 'description',
    idField: 'guid',
  },
  disabled = false,
}: DataDownloadLinksProps) => {
  const downloadEntries = useMemo(() => {
    if (!downloadLinks || !studyData[downloadLinks.field]) return undefined;
    const studyDownloadLinks = studyData[downloadLinks.field] as JSONObject[];
    return studyDownloadLinks.map((data: JSONObject) =>
      extractFieldData(data, downloadLinkFields),
    );
  }, [studyData, downloadLinks, downloadLinkFields]);

  if (!downloadEntries) {
    return;
  }

  const rows = downloadEntries.map(
      (entry: Record<string, string | undefined>) => {
        // the minimum required fields are title and id
        if (
          entry['titleField'] === undefined ||
          entry['idField'] === undefined
        ) {
          return null;
        }
        const id = entry['idField'];

        if (id === undefined) return null;
        return (
          <Table.Tr key={id}>
            <Table.Td>
              <Tooltip disabled={!entry['descriptionField']} label={entry['descriptionField']} withArrow position="top-start">
                <Text truncate="end">
                  {entry['titleField'] || ''}
                </Text>
              </Tooltip>
            </Table.Td>
            <Table.Td className='text-right'>
              <Button
                variant="outline"
                component="a"
                href={`${GEN3_FENCE_API}/data/download/${encodeURIComponent(id)}?expires_in=900&redirect`}
                download={entry['titleField'] || 'download_from_gen3'}
                leftSection={<DownloadIcon />}
                data-disabled={!id || disabled}
              >
                Download File
              </Button>
            </Table.Td>
          </Table.Tr>
        );
      },
    );
  return (
    <div> 
      <Title order={3} size={14} className='uppercase pt-8 pb-2'>{downloadLinks?.name ?? 'Data Download Links'}</Title>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr className='uppercase'>
              <Table.Th>File Name</Table.Th>
              <Table.Th className='text-right'>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default DownloadLinksPanel;
