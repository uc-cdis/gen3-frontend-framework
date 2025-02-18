import React from 'react';
import { ExportFromDiscoveryActions } from '../types';
import { Icon } from '@iconify/react';
import DataLibraryActionButton from './DataLibraryActionButton';

interface ActionBarProps {
  config: ExportFromDiscoveryActions;
  handler: () => void;
}

const ActionBar = ({ config, handler }: ActionBarProps) => {
  const { buttons } = config;

  return (
    <div className="flex items-center justify-end py-1 px-2 mb-1 w-full gap-x-1.5 ">
      {buttons?.map((button, index) => {
        return (
          <DataLibraryActionButton
            label={button.label}
            icon={<Icon icon={button.icon ?? 'gen3:download'} />}
            toolTip={button.tooltip}
            loginRequired={config?.loginRequireForAllButtons ?? true}
            onClick={() => {
              handler();
            }}
            key={`action-button-${index}`}
          />
        );
      })}
    </div>
  );
};

export default ActionBar;
