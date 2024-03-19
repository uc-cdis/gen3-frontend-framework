import React from 'react';
import { ExportToDataLibrary } from '../types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import DataLibraryActionButton from './DataLibraryActionButton';

interface ActionBarProps {
  config: ExportToDataLibrary;
}

const ActionBar = ({ config }: ActionBarProps) => {
  const { buttons } = config;

  return (
    <div className="flex items-center justify-end py-1 px-2 mb-1 w-full gap-x-1.5 ">
      {buttons?.map((button, index) => {
        return (
          <DataLibraryActionButton
            label={button.label}
            icon={DownloadIcon}
            toolTip={button.tooltip}
            loginRequired={config?.loginRequireForAllButtons ?? true}
            onClick={() => {
              console.log('Download $[button.label]');
            }}
            key={`action-button-${index}`}
          />
        );
        // }
      })}
    </div>
  );
};

export default ActionBar;
