import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import ClinicalDataAnalysis from '../../features/ClinicalDataAnalysis/ClinicalDataAnalysis';
import { ClinicalDataAnalysisPageProps } from './types';
import { Stack } from '@mantine/core';
import CohortManager from '../../features/CohortBuilder/CohortManager/CohortManager';
import QueryExpression from '../../features/CohortBuilder/QueryExpression';
import CountsPanel from '../../features/CountsPanel/CountsPanel';

const ClinicalDataAnalysisPage = ({
  headerProps,
  footerProps,
  configuration,
}: ClinicalDataAnalysisPageProps) => {
  console.log('ClinicalDataAnalysisPage configuration:', configuration);
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Crosswalk Page',
        content: 'Crosswalk Data',
        key: 'gen3-crosswalk-page',
        ...(configuration?.headerMetadata ? configuration.headerMetadata : {}),
      }}
    >
      <Stack classNames={{ root: 'w-full' }}>
        <div className="w-full flex-col flex gap-4 bg-white z-10">
          <CohortManager
            rightPanel={
              <CountsPanel
                index={configuration.index}
                indexPrefix={configuration?.indexPrefix}
              />
            }
          />
          <QueryExpression index={configuration.index}></QueryExpression>
          <ClinicalDataAnalysis
            index={configuration.index}
            indexPrefix={configuration.index}
            tabs={configuration.tabs}
            initialFields={configuration.initialFields}
            objectIdField={configuration.objectIdField}
            objectTypename={configuration.objectTypename}
          />
        </div>
      </Stack>
    </NavPageLayout>
  );
};

export default ClinicalDataAnalysisPage;
