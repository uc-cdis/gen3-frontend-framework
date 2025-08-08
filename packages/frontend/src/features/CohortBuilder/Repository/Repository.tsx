import { RepositoryConfiguration } from './types';
import { CohortPanel } from '../CohortPanel';
import React from 'react';

const Repository = ({
  filters,
  guppyConfig,
  table,
  buttons,
  loginForDownload,
  dropdowns,
}: RepositoryConfiguration) => {
  return (
    <CohortPanel
      guppyConfig={guppyConfig}
      key="Repository-Panel"
      filters={filters}
      table={table}
      tabTitle="Files"
      dropdowns={dropdowns}
      buttons={buttons}
      loginForDownload={loginForDownload}
    />
  );
};

export default Repository;
