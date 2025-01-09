import React from 'react';
import { ExportToDataLibrary } from '../types';
import { FiDownload as DownloadIcon } from 'react-icons/fi';
import DataLibraryActionButton from './DataLibraryActionButton';
import AddToDataLibrary from './AddToDataLibrary';

interface ActionBarProps {
  config: ExportToDataLibrary;
}

const ActionBar = ({ config }: ActionBarProps) => {
  const { buttons } = config;

  return (
    <div className="flex items-center justify-end py-1 px-2 mb-1 w-full gap-x-1.5 ">
      {buttons?.map((button, index) => {
        if (button.type === 'add-to-data-library') {
          return <AddToDataLibrary key={button.type} />;
        } else {
          return (
            <DataLibraryActionButton
              label={button.label}
              icon={<DownloadIcon />}
              toolTip={button.tooltip}
              loginRequired={config?.loginRequireForAllButtons ?? true}
              onClick={() => {
                console.log('Download $[button.label]');
              }}
              key={`action-button-${index}`}
            />
          );
        }
      })}
    </div>
  );
};

export default ActionBar;
