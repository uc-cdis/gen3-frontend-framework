import React from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { CohortBuilder  } from '../../features/CohortBuilder';
import { ExplorerPageProps} from "./types";

const ExplorerPage = ({
  headerProps,
  footerProps,
                        explorerConfig,
}: ExplorerPageProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <CohortBuilder explorerConfig={explorerConfig}/>
    </NavPageLayout>
  );
};

export default ExplorerPage;
