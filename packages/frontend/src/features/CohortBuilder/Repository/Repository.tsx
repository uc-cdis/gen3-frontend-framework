import { RepositoryConfiguration } from './types';
import React from 'react';
import RepositoryPanel from './RepositoryPanel';
import { validateObjectHasRequiredFields } from '../../../utils/validators';
import { ErrorCard, MessagePage } from '../../../components/MessageCards';

const Repository = ({
  filters,
  guppyConfig,
  table,
  buttons,
  loginForDownload,
  dropdowns,
  fileStatsConfiguration,
}: RepositoryConfiguration) => {
  console.log(buttons);
  if (
    !fileStatsConfiguration ||
    !validateObjectHasRequiredFields(
      fileStatsConfiguration,
      Object.keys(fileStatsConfiguration),
    )
  ) {
    return (
      <MessagePage>
        <ErrorCard message="Invalid file stats configuration" />
      </MessagePage>
    );
  }

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
