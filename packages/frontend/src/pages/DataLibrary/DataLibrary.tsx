import React from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import {
  DataLibrary,
  type DataLibraryConfig,
} from '../../features/DataLibrary';

interface DataLibraryPageProps extends NavPageLayoutProps {
  config: DataLibraryConfig;
}

const DataLibraryPage = ({
  headerProps,
  footerProps,
  config,
}: DataLibraryPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 DataLibrary Page',
        content: 'DataLibrary Data',
        key: 'gen3-data-library-page',
      }}
    >
      <DataLibrary {...config} />
    </NavPageLayout>
  );
};

export default DataLibraryPage;
