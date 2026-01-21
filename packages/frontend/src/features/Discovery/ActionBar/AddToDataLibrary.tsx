import React, { useMemo } from 'react';
import {
  buildListItemsGroupedByDataset,
  DataLibraryStoreMode,
  extractFileDatasetsInRecords,
} from '@gen3/core';
import { ExportActionProps } from './types';
import { StylingOverride } from '../../../types';
import { ActionButtonConfig } from '../../../components/Buttons/types';
import AddToDataLibraryComboButton from './AddToDataLibraryComboButton';

export interface AddToDataLibraryButtonProps<
  T extends Record<string, any> = Record<string, any>,
> extends ExportActionProps<T> {
  buttonConfig: ActionButtonConfig;
  classNames?: StylingOverride;
}

const AddToDataLibrary = <T extends Record<any, any>>({
  buttonConfig,
  selectedResources,
  exportDataFields,
  dataLibraryStoreMode = DataLibraryStoreMode.ApiOnly,
  classNames = {},
}: AddToDataLibraryButtonProps<T>) => {
  const items = useMemo(
    () =>
      buildListItemsGroupedByDataset(
        extractFileDatasetsInRecords(selectedResources, exportDataFields),
      ),
    [selectedResources, exportDataFields],
  );

  return (
    <AddToDataLibraryComboButton
      items={items}
      buttonConfig={buttonConfig}
      dataLibraryStoreMode={dataLibraryStoreMode}
      classNames={classNames}
    />
  );
};

export default AddToDataLibrary;
