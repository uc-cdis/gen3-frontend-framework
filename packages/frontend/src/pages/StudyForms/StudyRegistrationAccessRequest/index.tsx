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
  getRemoteSupportServiceRegistry,
  HttpError,
  isHttpStatusError,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useUserRequestQuery,
} from '@gen3/core';
import { useRouter } from 'next/router';
import StudyRegistrationAccessRequestSuccess from './StudyRegistrationAccessRequestSuccess';
import { toString } from 'lodash';

interface StudyRegistrationAccessRequestFormProps extends NavPageLayoutProps {
  configStudyRegistrationRequestAccessForm: any;
  studyName: string;
}

const StudyRegistrationAccessRequestForm = ({
  headerProps,
  footerProps,
  configStudyRegistrationRequestAccessForm,
}: StudyRegistrationAccessRequestFormProps) => {
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState(false);
  const formBody = configStudyRegistrationRequestAccessForm.form;
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const [studyUID, setStudyUID] = useState<string | null>(null);
  const [studyName, setStudyName] = useState<string | null>(null);
  const [studyRegistrationAuthZ, setStudyRegistrationAuthZ] = useState<
    string | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query) {
      const { studyUID, studyRegistrationAuthZ, studyName } = router.query;
      if (studyUID) setStudyUID(studyUID as string);
      if (studyName) setStudyName(toString(studyName));
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

  // check requester to see if user has already submitted workspace request for access
  const { data, isLoading, isError } = useUserRequestQuery({
    policy_ids: ['workspace_accessor'], // <- IS THIS CORRECT?!
  });
  useEffect(() => {
    if (!isLoading && isError) {
      setFormError(
        'Unable to load data from Requester, form may not submit correctly. Try refreshing this page',
      );
    }
    //We need to check the data and see if the users request already exists in the data
    if (
      data &&
      data.some(
        (item) =>
          item.resource_id === studyUID && item.username === userInfo.username,
      )
    ) {
      setFormError(
        'Unable to load data from Requester, form may not submit correctly. Try refreshing this page',
      );
    }
  }, [isLoading, isError]);

  const [requestQuery] = useCreateRequestMutation();

  const formOnSubmit = async (formValues: FormOnSubmitReturnProps) => {
    const hostname = window.location.hostname;
    try {
      const request = await requestQuery({
        username: userInfo.username,
        resource_id: studyUID as string,
        resource_paths: [
          studyRegistrationAuthZ as string,
          '/mds_gateway',
          '/cedar',
        ],
        role_ids: ['study_registrant', 'mds_user', 'cedar_user'],
      }).unwrap();
      const printFormValuesArr: string[] = [];
      for (const [key, value] of Object.entries(formValues)) {
        printFormValuesArr.push(`${key}: ${value}`);
      }
      const zenDeskSubmission = {
        subject: `Study registration access request for ${studyUID} ${studyName}`,
        fullName: `${userInfo?.email}`,
        email: `${userInfo?.email}`,
        contents: `Request ID: ${request.request_id}\n
          Grant Number: ${studyUID}\n
          Study Name: ${studyName}\n
          Environment: ${hostname}
          Form Values: ${printFormValuesArr.join('\n\n')}`,
      };
      const zendeskRequestAction =
        getRemoteSupportServiceRegistry().getSupportService(
          configStudyRegistrationRequestAccessForm.remoteSupportService.service,
        );
      await zendeskRequestAction(
        zenDeskSubmission,
        configStudyRegistrationRequestAccessForm.remoteSupportService
          .configuration,
      );
      setFormSuccess(true);
    } catch (error) {
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
    }
  };

  const autoFillValues = (formBody: FormProps['body']) => {
    return formBody.map((item) => {
      // replace studyName with studyName from router
      if (item.initialValue === 'studyName') {
        return { ...item, initialValue: studyName };
      }
      return item;
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
            {formSuccess ? (
              <StudyRegistrationAccessRequestSuccess
                config={configStudyRegistrationRequestAccessForm.success}
              />
            ) : (
              <Form
                key={studyUID}
                className="*:mt-5 mb-5"
                body={autoFillValues(formBody) as FormProps['body']}
                showResetButton
                onSubmit={formOnSubmit}
                errorMessage={formError}
              />
            )}
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
