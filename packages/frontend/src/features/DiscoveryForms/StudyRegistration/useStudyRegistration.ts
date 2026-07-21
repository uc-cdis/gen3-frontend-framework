// useStudyRegistration.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import {
  CoreState,
  getRemoteSupportServiceRegistry,
  isHttpStatusError,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useUserRequestQuery,
  HttpError,
} from '@gen3/core';
import { FormOutcome } from './types';
import {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../components/Content/Form';

export const useStudyRegistration = (
  config: any,
): {
  formError: string | undefined;
  formOutcome: FormOutcome;
  studyUID: string | null;
  formBody: FormProps['body'];
  formOnSubmit: (formValues: FormOnSubmitReturnProps) => Promise<void>;
  isLoading: boolean;
} => {
  const [formError, setFormError] = useState<string>();
  const [formOutcome, setFormOutcome] = useState(FormOutcome.pending);
  const [studyUID, setStudyUID] = useState<string | null>(null);
  const [studyName, setStudyName] = useState<string | null>(null);
  const [studyProjectNumber, setStudyProjectNumber] = useState<string | null>(
    null,
  );
  const [studyRegistrationAuthZ, setStudyRegistrationAuthZ] = useState<
    string | null
  >(null);
  console.log('config', config);
  const router = useRouter();
  const formBody = config.form;
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  useEffect(() => {
    if (router.isReady && router.query) {
      const { query } = router;
      if (query.studyUID) setStudyUID(query.studyUID as string);
      if (query.studyName) setStudyName(toString(query.studyName));
      if (query.studyProjectNumber)
        setStudyProjectNumber(query.studyProjectNumber as string);
      if (query.studyRegistrationAuthZ) {
        try {
          setStudyRegistrationAuthZ(
            JSON.parse(query.studyRegistrationAuthZ as string),
          );
        } catch (e) {
          setStudyRegistrationAuthZ(query.studyRegistrationAuthZ as string);
        }
      }
    }
  }, [router.isReady, router.query]);

  // Validate existing requests and check for duplicates
  const { data, isLoading, isError } = useUserRequestQuery({});
  useEffect(() => {
    if (!isLoading && isError) {
      setFormError(
        'Unable to load data from Requester, form may not submit correctly. Try refreshing this page',
      );
    }
    // Check for study already in requester with same UID and userName
    if (
      data &&
      studyUID &&
      userInfo?.username &&
      data.some(
        (item) =>
          item.resource_id === studyUID && item.username === userInfo.username,
      )
    ) {
      setFormOutcome(FormOutcome.duplicateSubmission);
    }
  }, [isLoading, isError, data, studyUID, userInfo?.username]);

  //
  const getClinicalTrialMetadata = async (ctID: string): Promise<object> => {
    const errMsg = 'Unable to fetch study metadata from ClinicalTrials.gov';
    const clinicalTrialFieldsToFetch = config.clinicalTrialFields || [];
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
  };

  // Handle Form Submission
  const formOnSubmit = async (formValues: FormOnSubmitReturnProps) => {
    alert('here');
    alert('formValues' + JSON.stringify(formValues));
    const hostname = window.location.hostname;

    const cedarUserUUID = formValues.cedar_uuid;
    const studyID = formValues.study_id;
    const ctgovID = formValues.clinicalTrialsGovID; // example: NCT00000419
    const valuesToUpdate = {
      repository: formValues.repository || '',
      repository_study_ids:
        !formValues.repository_study_ids ||
        (formValues.repository_study_ids.length === 1 &&
          formValues.repository_study_ids[0] === '')
          ? []
          : formValues.repository_study_ids,
      clinical_trials_id: ctgovID || '',
      clinicaltrials_gov: ctgovID
        ? await getClinicalTrialMetadata(ctgovID)
        : undefined,
    };
    alert('ctgovID ' + ctgovID);
    alert(JSON.stringify(valuesToUpdate));
    /*     try {
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

      const printFormValuesArr = Object.entries(formValues).map(
        ([key, value]) => `${key}: ${value}`,
      );

      const zenDeskSubmission = {
        subject: `Study registration access request for ${studyUID} ${studyName}`,
        fullName: `${userInfo?.email}`,
        email: `${userInfo?.email}`,
        contents: `Request ID: ${request.request_id}\nGrant Number: ${studyProjectNumber}\nStudy Name: ${studyName}\nEnvironment: ${hostname}\nForm Values: ${printFormValuesArr.join('\n\n')}`,
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
    } */
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
    studyUID,
    formBody: autoFillValues(formBody) as FormProps['body'],
    formOnSubmit,
    isLoading,
  };
};
