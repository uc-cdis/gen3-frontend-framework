import React, { JSX } from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { UploadedFiles } from '../../features/Submission';
import { SubmissionsPageLayoutProps } from './types';

const FilesPage = ({
  submissionConfig,
  headerProps,
  footerProps,
}: SubmissionsPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      footerProps={footerProps}
      headerProps={headerProps}
      headerMetadata={{
        title: 'Gen3 Submission Files Page',
        content: 'Submission Files page',
        key: 'gen3-submission-files-page',
      }}
    >
      <UploadedFiles config={submissionConfig} />
    </NavPageLayout>
  );
};

export default FilesPage;
