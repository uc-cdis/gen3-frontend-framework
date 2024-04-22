import React from 'react';
import { NavPageLayout } from '../../features/Navigation';
import  SubmissionPanel  from '../../features/Submission/SubmissionPanel';
import { SubmissionsPageLayoutProps } from './types';

const SubmissionPage = (
  {
    headerProps,
    footerProps,
    submissionProps,
  }: SubmissionsPageLayoutProps
): JSX.Element => {
  return (
    <NavPageLayout footerProps={footerProps} headerProps={headerProps}>
      <SubmissionPanel />
    </NavPageLayout>
  );
}

export default SubmissionPage;
