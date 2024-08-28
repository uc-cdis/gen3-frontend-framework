import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import SubmissionPanel from '../../features/Submission/SubmissionPanel';
import { SubmissionsPageLayoutProps } from './types';

const SubmissionPage = ({
  submissionConfig,
  headerProps,
  footerProps,
}: SubmissionsPageLayoutProps): JSX.Element => {

  return (
    <NavPageLayout footerProps={footerProps} headerProps={headerProps}
                   headerData={
                     { title: "Gen3 Submission Page", content: 'Submission page', key: 'gen3-submission-page' }
                   }>

    >
      <SubmissionPanel config={submissionConfig} />
    </NavPageLayout>
  );
};

export default SubmissionPage;
