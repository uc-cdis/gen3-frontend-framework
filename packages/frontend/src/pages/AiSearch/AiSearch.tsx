import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import type { NavPageLayoutProps } from '../../features/Navigation';
import AiSearch from '../../features/Discovery/Search/AiSearch';

const AISearchPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 AI Search Page',
        content: 'AI Search',
        key: 'gen3-ai-search-page',
      }}
    >
      <div className="p-5 w-full">
        <AiSearch />
      </div>
    </NavPageLayout>
  );
};

export default AISearchPage;
