import { RepositoryConfiguration } from './types';
import { CohortPanel } from '../CohortPanel';
import React from 'react';
import RepositoryPanel from './RepositoryPanel';

const Repository = ({
  filters,
  guppyConfig,
  table,
  buttons,
  loginForDownload,
  dropdowns,
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
    />
  );
};

export default Repository;
