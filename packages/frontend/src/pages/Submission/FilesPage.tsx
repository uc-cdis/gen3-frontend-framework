import React, { JSX } from 'react';
import { NavPageLayout } from '../../features/Navigation';
import { UploadedFiles } from '../../features/Submission';
import { SubmissionsPageLayoutProps } from './types';

const SubmissionPage = ({
  submissionConfig,
  headerProps,
  footerProps,
}: SubmissionsPageLayoutProps): JSX.Element => {
  return (
    <NavPageLayout
      footerProps={footerProps}
      headerProps={headerProps}
      headerMetadata={{
        title: 'Gen3 Submission Page',
        content: 'Submission page',
        key: 'gen3-submission-page',
      }}
    >
      <UploadedFiles config={submissionConfig} />
    </NavPageLayout>
  );
};

export default SubmissionPage;
