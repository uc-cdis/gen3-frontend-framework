import React, { useEffect, useState } from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import { Text, Box } from '@mantine/core';
import Form, {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../components/Content/Form';
import {
  CoreState,
  HttpError,
  isHttpStatusError,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useUserRequestQuery,
} from '@gen3/core';
import { useRouter } from 'next/router';

interface FormValues {
  studyName: string;
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  role: string;
}

interface StudyRegistrationAccessRequestFormProps extends NavPageLayoutProps {
  configStudyRegistrationRequestAccessForm: any;
  studyName: string;
}

const StudyRegistrationAccessRequestForm = ({
  headerProps,
  footerProps,
  configStudyRegistrationRequestAccessForm,
}: StudyRegistrationAccessRequestFormProps) => {
  const router = useRouter();
  const [autoFilledValues, setAutoFilledValues] = useState<string | null>(null);
  const [studyUID, setStudyUID] = useState<string | null>(null);
  const [studyName, setStudyName] = useState<string | null>(null);
  const [studyRegistrationAuthZ, setStudyRegistrationAuthZ] = useState<
    string | null
  >(null);

  const autoFillValues = (formBody: FormProps['body']) => {
    return formBody.map((item) => {
      // replace userEmail with users email
      if (item.initialValue === 'studyName') {
        return { ...item, initialValue: studyName };
      }
      return item;
    });
  };
  useEffect(() => {
    // Ensure the router is ready and query has data
    if (router.isReady && router.query) {
      const { studyUID, studyRegistrationAuthZ, studyName } = router.query;
      console.log('router.query', router.query);
      if (studyUID) setStudyUID(studyUID as string);
      if (studyName) setStudyName(studyName as string);

      if (studyRegistrationAuthZ) {
        try {
          setStudyRegistrationAuthZ(
            JSON.parse(studyRegistrationAuthZ as string),
          );
        } catch (e) {
          setStudyRegistrationAuthZ(studyRegistrationAuthZ as string);
        }
      }
    }
  }, [router.isReady, router.query]);

  const formBody = configStudyRegistrationRequestAccessForm.form;
  const [formError, setFormError] = useState<string>();

  // check requester to see if user has already submitted workspace request for access
  const { data, isLoading, isError } = useUserRequestQuery({
    policy_ids: ['workspace_accessor'],
  });

  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const [requestQuery] = useCreateRequestMutation();
  const formOnSubmit = (formValues: FormOnSubmitReturnProps) => {
    /* console.log('userInfo ', userInfo);
    console.log('data', data);
    console.log('isLoading', isLoading);
    console.log('isError', isError);
    console.log('JSON.stringify(formValues)', JSON.stringify(formValues)); */
    alert(JSON.stringify(formValues));
    return requestQuery({
      username: userInfo.username,
      resource_id: studyUID,
      resource_paths: [
        studyRegistrationAuthZ as string,
        '/mds_gateway',
        '/cedar',
      ],
      role_ids: ['study_registrant', 'mds_user', 'cedar_user'],
    })
      .unwrap()
      .then((request) => {
        console.log('ln 70', request);
      })
      .catch((error: unknown) => {
        if (isHttpStatusError(error)) {
          const httpError = error as HttpError;
          setFormError(
            `[${httpError.status}]: Error while submitting resource request`,
          );
        } else if (error instanceof Error) {
          setFormError(
            `Error while submitting resource request: ${error.message}`,
          );
        } else {
          setFormError('Unknown error while submitting resource request');
        }
      });
  };

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Theme Page',
        content: 'Theme page',
        key: 'gen3-theme-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <Box className="w-full bg-white rounded-md m-8 p-8 ">
          <div className="max-w-4xl mx-auto">
            <Form
              key={studyUID}
              className="*:mt-5 mb-5"
              body={autoFillValues(formBody)}
              showResetButton
              onSubmit={formOnSubmit}
              errorMessage={formError}
            />
          </div>

          <div className="mt-12 pt-4 border-t border-neutral-100 max-w-4xl mx-auto">
            <Text className="text-xs text-neutral-500 leading-relaxed">
              Information provided on this page will be used for correspondence
              regarding your request and may be shared with the NIH and/or the
              HEAL Data Stewards
            </Text>
          </div>
        </Box>
      </div>
    </NavPageLayout>
  );
};

export default StudyRegistrationAccessRequestForm;
