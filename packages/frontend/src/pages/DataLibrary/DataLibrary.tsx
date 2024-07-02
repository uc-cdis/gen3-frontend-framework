import React from 'react';
import { NavPageLayout, NavPageLayoutProps } from '../../features/Navigation';
import { DataLibraryPanel } from '../../features/DataLibrary';

const DataLibraryPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <DataLibraryPanel />
    </NavPageLayout>
  );
};

export default DataLibraryPage;
