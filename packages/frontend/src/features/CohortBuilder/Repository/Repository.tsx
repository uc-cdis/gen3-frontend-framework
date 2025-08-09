import { RepositoryConfiguration } from './types';
import React from 'react';
import RepositoryPanel from './RepositoryPanel';

const Repository = ({
  filters,
  guppyConfig,
  table,
  buttons,
  loginForDownload,
  dropdowns,
  fileStatsConfiguration,
}: RepositoryConfiguration) => {
  return (
    <RepositoryPanel
      guppyConfig={guppyConfig}
      key="Repository-Panel"
      filters={filters}
      table={table}
      dropdowns={dropdowns}
      buttons={buttons}
      loginForDownload={loginForDownload}
      fileStatsConfiguration={fileStatsConfiguration}
    />
  );
};

export default Repository;
