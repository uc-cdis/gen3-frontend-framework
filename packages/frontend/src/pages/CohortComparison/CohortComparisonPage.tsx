import React, { useState } from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { Stack } from '@mantine/core';
import CohortManager from '../../features/CohortBuilder/CohortManager/CohortManager';
import QueryExpression from '../../features/CohortBuilder/QueryExpression';
import CountsPanel from '../../features/CountsPanel/CountsPanel';
import { CohortComparisonPageProps } from './types';
import CohortComparisonApp from '../../features/CohortComparison/CohortComparisonApp';
import { SelectionScreenContext } from '../../features/Analysis/context';

const CohortComparisonPage = ({
  headerProps,
  footerProps,
  configuration,
}: CohortComparisonPageProps) => {
  const [cohortSelectionOpen, setCohortSelectionOpen] = useState(true);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Cohort Comparison Page',
        content: 'Cohort Comparison Analysis',
        key: 'gen3-cohort-comparison-page',
      }}
    >
      <Stack classNames={{ root: 'w-full' }}>
        <div className="w-full flex-col flex gap-4 bg-white z-10">
          <CohortManager
            rightPanel={
              <CountsPanel
                index={configuration.index}
                unitTypename={configuration.dataTypename}
              />
            }
          />
          <QueryExpression index={configuration.index}></QueryExpression>
          <SelectionScreenContext.Provider
            value={{
              selectionScreenOpen: cohortSelectionOpen,
              setSelectionScreenOpen: setCohortSelectionOpen,
              setActiveApp: () => {},
            }}
          >
            <CohortComparisonApp {...configuration} />
          </SelectionScreenContext.Provider>
        </div>
      </Stack>
    </NavPageLayout>
  );
};

export default CohortComparisonPage;
