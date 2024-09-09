import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { MetadataViewer } from '../../components/MetadataViewer';
import { MetadataViewerPageProps } from './types';

const MetadataPagePage = ({
  headerProps,
  footerProps,
}: MetadataViewerPageProps): JSX.Element => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 MetadataViewer Page',
        content: 'MetadataViewer Data',
        key: 'gen3-metadata-viewer-page',
      }}
    >
      <MetadataViewer />
    </NavPageLayout>
  );
};

export default MetadataPagePage;
