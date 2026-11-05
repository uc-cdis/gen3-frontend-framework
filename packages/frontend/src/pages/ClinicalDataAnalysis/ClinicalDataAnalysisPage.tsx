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
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Clinical Data Analysis Page',
        content: ' Clinical Data Analysis',
        key: 'gen3-clinical-data-analysis-page',
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
                unitTypename={configuration.dataTypename}
              />
            }
          />
          <QueryExpression index={configuration.index} />
          <ClinicalDataAnalysis
            index={configuration.index}
            indexPrefix={configuration.index}
            tabs={configuration.tabs}
            initialFields={configuration.initialFields}
            uniqueIdField={configuration.uniqueIdField}
            dataTypename={configuration.dataTypename}
          />
        </div>
      </Stack>
    </NavPageLayout>
  );
};

export default ClinicalDataAnalysisPage;
