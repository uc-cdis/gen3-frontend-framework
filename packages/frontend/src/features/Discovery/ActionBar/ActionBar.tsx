import React from 'react';
import { ExportFromDiscoveryActions } from '../types';
import { ExportActionButtonProps } from './types';
import DownloadManifestButton from './DownloadManifestButton';
import DiscoveryDataLibrary from './AddToDataLibrary';

const createActionButton = ({
  buttonConfig,
  selectedResources,
  exportDataFields,
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
      <DiscoveryDataLibrary
        buttonConfig={buttonConfig}
        selectedResources={selectedResources}
        exportDataFields={exportDataFields}
        key={buttonConfig.type}
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
}) => {
  return (
    <div className="flex items-center justify-end py-1 px-2 mb-1 w-full gap-x-1.5 ">
      {buttons?.map((button) => {
        return createActionButton({
          buttonConfig: button,
          selectedResources,
          exportDataFields,
        });
      })}
    </div>
  );
};

export default ActionBar;
