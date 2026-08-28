// useStudyRegistration.ts
import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { toString } from 'lodash';
import {
  getRemoteSupportServiceRegistry,
  isHttpStatusError,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useUserRequestQuery,
} from '@gen3/core';
import type { CoreState, HttpError } from '@gen3/core';
import { FormOutcome } from './types';
import type { GenericRegistrationAccessRequestFormConfig } from './types';
import type {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../../components/Content/Form';

export const useStudyRegistration = (
  config: GenericRegistrationAccessRequestFormConfig,
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

  const router = useRouter();
  const formBody = config.form;
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );

  const studyUID = useMemo(
    () => (router.isReady ? (router.query.studyUID as string) : null),
    [router.isReady, router.query.studyUID],
  );
  const studyName = useMemo(
    () => (router.isReady ? toString(router.query.studyName) || null : null),
    [router.isReady, router.query.studyName],
  );
  const studyProjectNumber = useMemo(
    () =>
      router.isReady ? (router.query.studyProjectNumber as string) : null,
    [router.isReady, router.query.studyProjectNumber],
  );
  const studyRegistrationAuthZ = useMemo(() => {
    if (!router.isReady || !router.query.studyRegistrationAuthZ) return null;
    try {
      return JSON.parse(router.query.studyRegistrationAuthZ as string) as string;
    } catch {
      return router.query.studyRegistrationAuthZ as string;
    }
  }, [router.isReady, router.query.studyRegistrationAuthZ]);

  // Validate existing requests and check for duplicates
  const { data, isLoading, isError } = useUserRequestQuery({});

  const loadError =
    !isLoading && isError
      ? 'Unable to load data from Requester, form may not submit correctly. Try refreshing this page'
      : undefined;

  const isDuplicate =
    !isLoading &&
    Boolean(
      data &&
        studyUID &&
        userInfo.username &&
        data.some(
          (item) =>
            item.resource_id === studyUID && item.username === userInfo.username,
        ),
    );

  const [requestQuery] = useCreateRequestMutation();

  // Handle Form Submission
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

      const printFormValuesArr = Object.entries(formValues).map(
        ([key, value]) => `${key}: ${value}`,
      );

      const zenDeskSubmission = {
        subject: `${config.remoteSupportService.submissionSubjectLine} ${studyUID} ${studyName}`,
        email: formValues.emailAddress,
        fullName: `${formValues.registrantFirstName} ${formValues.registrantLastName}`,
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
    formError: formError ?? loadError,
    formOutcome: isDuplicate ? FormOutcome.duplicateSubmission : formOutcome,
    studyUID,
    formBody: autoFillValues(formBody) as FormProps['body'],
    formOnSubmit,
    isLoading,
  };
};
