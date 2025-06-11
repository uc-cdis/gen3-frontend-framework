import React from 'react';
import { Center, Text, Paper, Button } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { useLazyRequestQuery } from '@gen3/core';
import { GetServerSideProps } from 'next';

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const [
    submitRequest,
    { isLoading: apiIsLoading, data: aiResponse, error: aiError },
    // This is the destructured mutation result
  ] = useLazyRequestQuery();
  // from data portal heal https://github.com/uc-cdis/data-portal/blob/bbd58ef8d722d81db3b0cf2393d6206a1bd66b08/src/GenericAccessRequestForm/handleRegisterFormSubmission.ts#L8
  /**const getQueryBody = () => {
    let queryBody: QueryBody = {};

    if (specificFormInfo.name === 'WorkspaceAccessRequest') {
      queryBody = {
        policy_id: policyID,
      };
    } else {
      queryBody = {
        username: props.user.username,
        resource_id: studyUID,
        resource_paths: [studyRegistrationAuthZ, '/mds_gateway', '/cedar'],
        role_ids: ['study_registrant', 'mds_user', 'cedar_user'],
      };
    }
    return queryBody;
  };


     * {"username":"test@test.edu","resource_id":"HDP00007","resource_paths":["/study/9898687","/mds_gateway","/cedar"],"role_ids":["study_registrant","mds_user","cedar_user"]}
     * possable responce
        * 201
        {"resource_display_name":null,
         * "updated_time":"2025-05-13T15:10:37.745189",
         * "resource_id":"HDP00007",
         * "request_id":"50a78d51-bfed-426b-b43a-d395128e4874",
         * "username":"shawnoconnor@uchicago.edu",
         * "status":"DRAFT",
         * "revoke":false,
         * "policy_id":"study.9898687_mds_gateway_cedar_study_registrant_mds_user_cedar_user",
         * "created_time":"2025-05-13T15:10:37.745183"
         * }
         *
         * 403
         * {"detail":"Permission denied"}
         * */

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Requestor Test Page',
        content: 'Requestor Test',
        key: 'gen3-requestor-page',
      }}
    >
      <div className="w-full m-10">
        <Center>
          <Paper shadow="md" p="xl" withBorder>
            <Text>This is a example custom page in Gen3</Text>
            <Button loading={apiIsLoading} disabled={apiIsLoading}>
              Submit Request
            </Button>
          </Paper>
        </Center>
      </div>
    </NavPageLayout>
  );
};

// TODO: replace this with a custom getServerSideProps function
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
