import React, { ReactElement} from 'react';
import { SubmissionConfig } from './types';
import ProjectTable from './Tables/ProjectTable';
import { MessagePanel } from '../../components/MessagePanel';

export interface SubmissionProps {
  submissionConfig?: SubmissionConfig
}

const SubmissionPanel = ({ submissionConfig } : SubmissionProps) : ReactElement  => {

  if (!submissionConfig) {
    return ( <MessagePanel message="Submission config is not defined. Page disabled" />);
  }

  return (
    <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
      <div className="w-full"></div>
      <ProjectTable columns={ submissionConfig.projectTable.columns } />
    </div>
  );
};

export default SubmissionPanel;
