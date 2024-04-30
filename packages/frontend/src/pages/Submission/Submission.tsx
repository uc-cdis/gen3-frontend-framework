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
    <NavPageLayout footerProps={footerProps} headerProps={headerProps}>
      <SubmissionPanel config={submissionConfig} />
    </NavPageLayout>
  );
};

export default SubmissionPage;
