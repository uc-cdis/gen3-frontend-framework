import React from 'react';
import VLMDSubmissionAccessRequestFormPage from '@gen3/frontend/pages/StudyForms/VLMDSubmissionAccessRequest';
import { VLMDSubmissionAccessRequestPageGetServerSideProps as getServerSideProps } from '@gen3/frontend/pages/StudyForms/VLMDSubmissionAccessRequest/data';

const VLMDSubmissionPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">
        VLMD Submission Page Placeholder
      </h1>
    </div>
  );
};

export default VLMDSubmissionPage;

export { getServerSideProps };
