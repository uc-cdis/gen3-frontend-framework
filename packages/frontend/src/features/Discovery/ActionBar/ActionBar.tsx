import React from 'react';
import { ExportFromDiscoveryActions } from '../types';
import { ExportActionButtonProps } from './types';
import DownloadManifestButton from './DownloadManifestButton';
import AddToDataLibrary from './AddToDataLibrary';
import { DataLibraryStoreMode } from '@gen3/core';

const createActionButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
  verifyExternalLogins,
  dataLibraryStoreMode,
}: ExportActionButtonProps) => {
  return {
    manifest: (
      <DownloadManifestButton
        buttonConfig={buttonConfig}
        selectedResources={selectedResources}
        exportDataFields={exportDataFields}
        key={buttonConfig.type}
      />
    ),
    addToDataLibrary: (
      <AddToDataLibrary
        buttonConfig={buttonConfig}
        selectedResources={selectedResources}
        exportDataFields={exportDataFields}
        key={buttonConfig.type}
        verifyExternalLogins={verifyExternalLogins}
        dataLibraryStoreMode={dataLibraryStoreMode}
      />
    ),
  }[buttonConfig.type as string];
};

interface ActionBarProps extends ExportFromDiscoveryActions {
  selectedResources: any[];
}

const ActionBar: React.FC<ActionBarProps> = ({
  buttons,
  selectedResources,
  exportDataFields,
  verifyExternalLogins,
  dataLibraryStoreMode = DataLibraryStoreMode.ApiOnly,
}) => {
  return (
    <div className="flex items-center justify-end py-1 px-2 mb-1 w-full gap-x-1.5 ">
      {buttons?.map((button) => {
        return createActionButton({
          buttonConfig: button,
          selectedResources,
          exportDataFields,
          verifyExternalLogins,
          dataLibraryStoreMode,
        });
      })}
    </div>
  );
};

export default ActionBar;
