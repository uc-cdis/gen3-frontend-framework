import { NavPageLayout } from '../../features/Navigation';
import type { NavPageLayoutProps } from '../../features/Navigation';
import AiSearch from '../../features/Discovery/Search/AiSearch';
import React from 'react';

const AiSearchPage = ({
                         headerProps,
                         footerProps,
                       }: NavPageLayoutProps): JSX.Element => {


  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <AiSearch />
    </NavPageLayout>
  );
};

export default AiSearchPage;
