import React, { ReactElement} from 'react';
import { SubmissionConfig } from './types';
import ProjectTable from './Tables/ProjectTable';
import  MessagePanel from '../../components/MessagePanel';



const SubmissionPanel = ( { config }:  { config?: SubmissionConfig}) : ReactElement  => {

  if (!config) {
    return ( <MessagePanel message="Submission config is not defined. Page disabled" />);
  }

  return (
    <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
      <div className="flex w-full bg-base-max p-4 rounded-lg">
      <ProjectTable columns={ config.projectTable.columns } />
      </div>
    </div>
  );
};

export default SubmissionPanel;
