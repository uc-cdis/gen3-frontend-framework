import React, { ReactElement} from 'react';
import { useGetProjectsQuery, useGetSubmissionGraphQLQuery, useGetProjectsDetailsQuery } from '@gen3/core';
import { Button } from '@mantine/core';


const buildQuery = (fields:string[]) => {
  return fields.map((field) => {
    return `${field}:${field}(project_id: $name)`;
  });
};


const SubmissionPanel = () : ReactElement  => {


  const mapping = {
    "_subject_count": "_subject_count",
    "_study_count": "_study_count",
    "_aliquot_count": "_aliquot_count"
  };

  const detailQuery = `
  query projectDetailQuery(
  $name: [String]
) {
  project(project_id: $name) {
    name: project_id
    code
    id
  }
  ${buildQuery(Object.keys(mapping)).join('\n')}
}`;

  const projectQuery = { query: 'query { project(first:0) {code, project_id, availability_type}}'};

  const { data } = useGetProjectsQuery(
      projectQuery
  );

  const { data: projectDetails } = useGetSubmissionGraphQLQuery({
    query: detailQuery,
    variables: {
      name: "Canine-PMed_trial"
    },
    mapping: mapping,
  });

  console.log("projectDetails", projectDetails);

  console.log("data", data);

  const { data: projectDetails2 } = useGetProjectsDetailsQuery({
     size: 1,
      projectQuery: projectQuery,
      projectDetailsQuery: detailQuery,
      mapping: mapping,
  });

  console.log("projectDetails2", projectDetails2);

  return (
    <div>
      <div>Submission Page</div>
      <Button>Get Projects</Button>
    </div>
  );
};

export default SubmissionPanel;
