import React, { useState } from 'react';
import { Button, ComboboxItem, Group, Select } from '@mantine/core';
import { useDataLibrary } from '@gen3/core';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useIsAuthenticated } from '../../../lib/session/session';
import { ExportActionButtonProps } from './types';

const extractListNameAndId = (data: any): ComboboxItem[] =>
  Object.keys(data).map((id) => ({ value: id, label: data[id].name }));

const DiscoveryDataLibrary = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
}: ExportActionButtonProps) => {
  const [data, setData] = useState<ComboboxItem[]>([]);
  const [currentList, setCurrentList] = useState<ComboboxItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Record<string, any> | null>(null);

  const { isAuthenticated } = useIsAuthenticated();
  const {
    dataLibrary,
    updateListInDataLibrary,
    addListToDataLibrary,
    isLoading,
    isError,
    error: dataLibraryError,
  } = useDataLibrary(isAuthenticated);

  const saveToList = (
    listname: string,
    listId: string | undefined = undefined,
  ) => {
    if (selectedResources.length === 0) return;
    const items = selectedResources.reduce(
      (acc: Record<string, any>, resource: Record<string, any>) => {
        const dataObjects = resource[exportDataFields.dataObjectFieldName];
        const datasetId = resource[exportDataFields.datesetIdFieldName];

        const datafiles = dataObjects.reduce(
          (dataAcc: Record<string, any>, dataObject: any) => {
            const guid = dataObject[exportDataFields.dataObjectIdField];
            return {
              ...dataAcc,
              [guid]: {
                dataset_guid: datasetId,
                ...dataObject,
              },
            };
          },
          {},
        );
        return {
          ...acc,
          ...datafiles,
        };
      },
      {},
    );

    if (listId) {
      updateListInDataLibrary(listId, { ...dataLibrary[listId], items });
    } else {
      addListToDataLibrary(items);
    }
  };

  useDeepCompareEffect(() => {
    if (dataLibrary && !isError) {
      const listItems = extractListNameAndId(dataLibrary.lists);
      setData(listItems);
    }
    if (isError) {
      setError(dataLibraryError);
    }
  }, [dataLibrary, isError]);

  // fetch the list

  const notLoggedIn = false;

  return (
    <React.Fragment>
      <Group data-testid="add-to-data-library">
        <Select
          data={data}
          onChange={(value, option) => setCurrentList(option)}
          placeholder={
            notLoggedIn
              ? 'Login to save to a list'
              : 'Select/create a list to save to'
          }
          disabled={notLoggedIn}
          value={currentList?.value}
        />
        <Button
          loading={loading}
          disabled={
            error !== null ||
            loading ||
            data?.length === 0 ||
            currentList === undefined ||
            selectedResources.length === 0 ||
            notLoggedIn
          }
          onClick={() => {
            if (currentList) {
              saveToList(currentList.label, currentList.value);
            } else {
              saveToList('New List');
            }
          }}
        >
          {' '}
          {buttonConfig?.label ?? 'Save to List'}
        </Button>
      </Group>
    </React.Fragment>
  );
};

export default DiscoveryDataLibrary;
