import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import {
  CoreState,
  isHttpStatusError,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useUserRequestQuery,
  HttpError,
  getRemoteSupportServiceRegistry,
} from '@gen3/core';
import { FormOutcome } from './types';
import {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../components/Content/Form';

export const useStudyRegistrationForm = (
  config: any,
): {
  formError: string | undefined;
  formOutcome: FormOutcome;
  formBody: FormProps['body'];
  formOnSubmit: (formValues: FormOnSubmitReturnProps) => Promise<void>;
  isLoading: boolean;
} => {
  const [formError, setFormError] = useState<string>();
  const [formOutcome, setFormOutcome] = useState(FormOutcome.pending);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [studyName, setStudyName] = useState<string | null>(null);
  const router = useRouter();
  const formBody = config.form;
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  useEffect(() => {
    if (router.isReady && router.query) {
      const { query } = router;
      if (query.studyName) setStudyName(toString(query.studyName));
    }
  }, [router.isReady, router.query]);

  /*   // Validate existing requests and check for duplicates
  const { data, isLoading, isError } = useUserRequestQuery({});
  useEffect(() => {
    if (!isLoading && isError) {
      setFormError(
        'Unable to load data from Requester, form may not submit correctly. Try refreshing this page',
      );
    }
    // Check for study already in requester with same UID and userName
    if ('OK' == 'Duplicate Submission Usecase') {
      setFormOutcome(FormOutcome.duplicateSubmission);
    }
  }, [isLoading, isError, data, userInfo?.username]); */

  const [regRequestPending, setRegRequestPending] = useState(false);
  /*   const getClinicalTrialMetadata = async (ctID: string): Promise<object> => {
    const errMsg = 'Unable to fetch study metadata from ClinicalTrials.gov';
    const clinicalTrialFieldsToFetch =
      studyRegistrationConfig.clinicalTrialFields || [];
    // get metadata from the clinicaltrials.gov API
    const resp = await fetch(
      `https://clinicaltrials.gov/api/v2/studies/${ctID}?fields=${clinicalTrialFieldsToFetch.join('|')}`,
    );
    if (!resp || resp.status !== 200) {
      return Promise.reject('Unable to verify ClinicalTrials.gov ID');
    }
    try {
      const respJson = await resp.json();
      return respJson;
    } catch {
      throw errMsg;
    }
  }; */

  // Handle Form Submission
  const [requestQuery] = useCreateRequestMutation();
  const formOnSubmit = async (formValues: FormOnSubmitReturnProps) => {
    console.log('line 83!!!' + Math.random());
    alert('here');
    const hostname = window.location.hostname;
    try {
      const request = await requestQuery({
        username: userInfo.username,
        resource_id: '123',
        resource_paths: ['4356', '/mds_gateway', '/cedar'],
        role_ids: ['study_registrant', 'mds_user', 'cedar_user'],
      }).unwrap();

      const printFormValuesArr = Object.entries(formValues).map(
        ([key, value]) => `${key}: ${value}`,
      );

      const zenDeskSubmission = {
        subject: `Study registration access request for  ${studyName}`,
        fullName: `${userInfo?.email}`,
        email: `${userInfo?.email}`,
        contents: `Request ID: ${request.request_id}\nGrant Number: TEST\nStudy Name: ${studyName}\nEnvironment: ${hostname}\nForm Values: ${printFormValuesArr.join('\n\n')}`,
      };

      const zendeskRequestAction =
        getRemoteSupportServiceRegistry().getSupportService(
          config.remoteSupportService.service,
        );
      await zendeskRequestAction(
        zenDeskSubmission,
        config.remoteSupportService.configuration,
      );

      setFormOutcome(FormOutcome.success);
    } catch (error) {
      if (isHttpStatusError(error)) {
        setFormError(
          `[${(error as HttpError).status}]: Error while submitting resource request`,
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

  const autoFillValues = (body: FormProps['body']) => {
    return body.map((item) =>
      item.initialValue === 'studyName'
        ? { ...item, initialValue: studyName }
        : item,
    );
  };

  return {
    formError,
    formOutcome,
    formBody: autoFillValues(formBody) as FormProps['body'],
    formOnSubmit,
    isLoading,
  };
};
