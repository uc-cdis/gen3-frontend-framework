import type { JSX} from 'react';
import React, { useEffect, useState } from 'react';
import type { requestAccessFormProps } from '../../features/Workspace/types';
import TextContent from '../../components/Content/TextContent';
import type {
  FormOnSubmitReturnProps,
  FormProps,
} from '../../components/Content/Form';
import Form from '../../components/Content/Form';
import Image from 'next/image';
import { Button, Loader, Title, Text } from '@mantine/core';
import {
  type CoreState,
  getRemoteSupportServiceRegistry,
  type HttpError,
  isHttpStatusError,
  selectUserDetails,
  useCoreSelector,
  useCreateRequestMutation,
  useUserRequestQuery,
} from '@gen3/core';
import { useRouter } from 'next/router';
import { withBasePath } from '../../utils/strings';

const WorkspaceRequestForm = ({requestAccessForm}: {requestAccessForm: requestAccessFormProps}) => {
  const { basePath } = useRouter();
    // check requester to see if user has already submitted workspace request for access
  const { data, isLoading, isError } = useUserRequestQuery({
    policy_ids: ['workspace_accessor'],
  });
  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState(false);
  useEffect(() => {
    if (!isLoading && isError) {
      setFormError(
        'Unable to load data from Requester, form may not submit correctly. Try refreshing this page',
      );
    }
    if (data && data.length > 0) {
      setFormSuccess(true);
    }
  }, [isLoading, isError]);

  const [requestQuery] = useCreateRequestMutation();

  const formOnSubmit = (formValues: FormOnSubmitReturnProps) => {
    if (!requestAccessForm) {
      setFormError('No form setup found');
      return;
    }
    setFormError(undefined);

    const printFormValuesArr: string[] = [];
    for (const [key, value] of Object.entries(formValues)) {
      printFormValuesArr.push(`${key}: ${value}`);
    }

    const zendeskRequestAction =
      getRemoteSupportServiceRegistry().getSupportService(
        requestAccessForm.remoteSupportService.service,
      );

    return requestQuery({
      resource_paths: ['/workspace'],
    })
      .unwrap()
      .then((request) => {
        return zendeskRequestAction(
          {
            subject: `Workspace Access Request for Workspace in ${window.location.href}`,
            fullName: `${userInfo?.email}`,
            email: `${userInfo?.email}`,
            contents:
              'Workspace Access Request for Workspace in:\n\n' +
              `\n\nRequestor: ${userInfo?.display_name} (${userInfo?.email})` +
              '\n\nResources: "/workspace"' +
              `\n\nRequestor ID: ${userInfo?.username || 'unknown'}` +
              `\n\nRequest ID: ${request.request_id}` +
              `\n\nRequest URL: ${window.location.href}` +
              `\n\nRequestor Email: ${userInfo?.email}` +
              `\n\nRequestor Name: ${userInfo?.username}` +
              '\n\nForm Values:\n\n' +
              printFormValuesArr.join('\n\n'),
          },
          requestAccessForm.remoteSupportService.configuration,
        );
      })
      .then(() => {
        setFormSuccess(true);
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
  const autoFillValues = (body: FormProps['body']) => {
    return body.map((item) => {
      // replace userEmail with users email
      if (item.initialValue === 'userEmail') {
        return { ...item, initialValue: userInfo?.email };
      }
      return item;
    });
  };
  const workspaceRequestSuccess = () => {
    return (
      <div className="w-full max-w-[500px] m-auto text-center">
        {requestAccessForm.success?.topIcon && (
          <div className="bg-white rounded-lg inline-block p-3">
            <Image
              src={withBasePath(basePath, requestAccessForm.success.topIcon.src)}
              alt={requestAccessForm.success.topIcon.alt}
              width={36}
              height={36}
            />
          </div>
        )}
        {requestAccessForm.success?.content?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
        {requestAccessForm.success?.button && (
          <Button
            component="a"
            variant={requestAccessForm.success.button.variant}
            href={requestAccessForm.success.button.href}
            target="_blank"
            className="mt-3"
          >
            {requestAccessForm.success.button.text}
          </Button>
        )}
      </div>
    );
  }

  const workspaceRequestForm = () => {
    
    const formContainer = (children: JSX.Element) => {
      return (
        <div className="mx-20 sm:mt-8 2xl:mt-10 w-full bg-base-max">
          <Title
            size="h2"
            className="mb-5 pb-2 text-primary m_8a5d1357 mantine-Title-root"
          >
            {requestAccessForm.label}
          </Title>
          {children}
        </div>
      );
    }
    if (isLoading) {
      return formContainer(<Loader />);
    }
    if (!userInfo?.email) {
      return formContainer(<Text c="red">Something went wrong, user must be logged in with email to access this form</Text>);
    }
    const autoFillValuesStatic = autoFillValues(requestAccessForm.form);
    return formContainer(
      <Form
        className="*:mt-5 mb-5"
        body={autoFillValuesStatic}
        submitButtonText={requestAccessForm.submitButtonText}
        errorMessage={formError}
        onSubmit={formOnSubmit}
      />
    );
  };

  return formSuccess ? workspaceRequestSuccess(): workspaceRequestForm();
};

export default WorkspaceRequestForm;
