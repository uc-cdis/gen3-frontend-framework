import React, { ReactElement } from 'react';
import { SubmissionConfig } from './types';
import ProjectTable from './Tables/ProjectTable';
import MessagePanel from '../../components/MessagePanel';
import SubmissionsTable from './Tables/SubmissionsTable';
import SectionCollapse from './SectionCollapse';
import DataSubmissionCard from './DataSubmissionCard';

const SubmissionPanel = ({
  config,
}: {
  config?: SubmissionConfig;
}): ReactElement => {
  return (
    <>
      {config ? (
        <div className="flex flex-col items-center p-4 w-full bg-base-lightest">
          <SectionCollapse text="Data Submission">
            <div className="flex basis-1/2 gap-4">
              {(config?.dataSubmissionCards || []).map((card) => (
                <DataSubmissionCard key={card.title} {...card} />
              ))}
            </div>
          </SectionCollapse>
          <SectionCollapse text="List of Projects">
            <ProjectTable columns={config.projectTable.columns} />
          </SectionCollapse>
          <SectionCollapse text="Recent Submissions">
            <SubmissionsTable />
          </SectionCollapse>
        </div>
      ) : (
        <MessagePanel message="Submission config is not defined. Page disabled" />
      )}
    </>
  );
};

export default SubmissionPanel;
