import React, { ReactElement } from 'react';
import { SubmissionConfig } from './types';
import ProjectTable from './Tables/ProjectTable';
import MessagePanel from '../../components/MessagePanel';
import SubmissionsTable from './Tables/SubmissionsTable';

const SubmissionPanel = ({
  config,
}: {
  config?: SubmissionConfig;
}): ReactElement => {
  return (
    <>
      {config ? (
        <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
          <ProjectTable columns={config.projectTable.columns} />
          <SubmissionsTable />
        </div>
      ) : (
        <MessagePanel message="Submission config is not defined. Page disabled" />
      )}
    </>
  );
};

export default SubmissionPanel;
