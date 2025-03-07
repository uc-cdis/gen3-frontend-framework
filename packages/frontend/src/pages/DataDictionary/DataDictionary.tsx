import React from 'react';
import { DictionaryWithContext } from '../../features/Dictionary';
import { NavPageLayout } from '../../features/Navigation';
import { DictionaryPageProps } from './types';

const DictionaryPage = ({
  headerProps,
  footerProps,
  config,
}: DictionaryPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps, mainProps: { fixed: true } }}
      headerData={{
        title: 'Gen3 DataDictionary Page',
        content: 'Data Dictionary',
        key: 'gen3-data-dictionary-page',
      }}
    >
      <DictionaryWithContext config={config} />
    </NavPageLayout>
  );
};

export default DictionaryPage;
