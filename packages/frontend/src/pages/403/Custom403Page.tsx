import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavPageLayout } from '../../features/Navigation';
import { Custom403PageProps, Config403Props } from './types';
import { requestAccessFormProps } from '../../features/Workspace/types';
import TextContent from '../../components/Content/TextContent';
import Form, { FormProps } from '../../components/Content/Form';
import Image from 'next/image';
import { Button, Title, Loader } from '@mantine/core';
import {
  type CoreState,
  selectUserDetails,
  useCoreSelector,
  getRemoteSupportServiceRegistry,
  type HttpError,
  isHttpStatusError,
} from '@gen3/core';

const Custom403Page = ({
  headerProps,
  footerProps,
  config403,
  form403,
}: Custom403PageProps) => {
  // custom 403 page for workspace request access 
  const onWorkspace = usePathname() === '/Workspace';
  const REQUESTEDACCESSTOWORKSPACEKEY = 'Requested-access-to-Workspace';
  const requestedAccessToWorkspace = localStorage.getItem(REQUESTEDACCESSTOWORKSPACEKEY);
  console.log('requestAccessToWorkspace', requestedAccessToWorkspace);

  const userInfo = useCoreSelector((state: CoreState) =>
    selectUserDetails(state),
  );
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState(!!requestedAccessToWorkspace);

  const formOnSubmit = (formValues: any) => {
    if (!form403) {
      setFormError('No form setup found');
      return;
    }
    setFormError(undefined);

    const zendeskRequestAction =
      getRemoteSupportServiceRegistry().getSupportService(
        form403.remoteSupportService.service,
      );

    return zendeskRequestAction(
      {
        subject: 'Request access to Workspace',
        fullName: `${userInfo?.email}`,
        email: `${formValues.email}`,
        contents:
          `Requestor: ${formValues.email}` +
          '\n\nResources: Workspace' +
          `\n\nRequestor ID: ${userInfo?.username || 'unknown'}` +
          `\n\nReason: ${formValues?.reason}`,
      },
      form403.remoteSupportService.configuration,
    ).then(() => {
      localStorage.setItem(REQUESTEDACCESSTOWORKSPACEKEY, true);
      setFormSuccess(true);
    })
    .catch((error: unknown) => {
      if (isHttpStatusError(error)) {
        const httpError = error as HttpError;
        setFormError(`[${httpError.status}]: Error while submitting resource request`);
      } else if (error instanceof Error) {
        setFormError(`Error while submitting resource request: ${error.message}`);
      } else {
        setFormError('Unknown error while submitting resource request');
      }
    });
  }

  const main403Template = (config: Config403Props) => {
    return (
      <div className="w-full max-w-[500px] m-auto text-center">
        {config?.topIcon && (
          <div className="bg-white rounded-lg inline-block p-3">
            <Image src={config.topIcon.src} alt={config.topIcon.alt} width={36} height={36}/>
          </div>
        )}
        {config?.content?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
        {config?.button && (
          <Button
            component="a"
            variant={config.button.variant}
            href={config.button.href}
            target="_blank"
            className="mt-3"
          >{config.button.text}</Button>
        )}
      </div>
    );
  }

  const autoFillValues = (body: FormProps['body']) => {
    return body.map((item)=> {
      // replace userEmail with users email
      if (item.initialValue === 'userEmail') {
        return {...item, initialValue: userInfo?.email};
      }
      return item;
    });
  }
  const workspaceRequestForm = (formConfig: requestAccessFormProps)=> {
    if (formSuccess) {
      return main403Template(formConfig.success);
    } 
    const autoFillValuesStatic = autoFillValues(formConfig.form);
    return (
      <div className="mx-20 sm:mt-8 2xl:mt-10 w-full bg-base-max">
        <Title size="h2" className="mb-5 pb-2 text-primary m_8a5d1357 mantine-Title-root">{formConfig.label}</Title>
        {userInfo?.email ? ( 
          <Form
            className="*:mt-5 mb-5"
            body={autoFillValuesStatic}
            submitButtonText={formConfig.submitButtonText}
            errorMessage={formError}
            onSubmit={formOnSubmit}
            />
          ): (
            <Loader />
          )
        }
      </div>);
  }
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: '403: Not Authorized',
        content: '403',
        key: 'gen3-not-authorized',
        ...(config403?.headerMetadata ? config403.headerMetadata : {}),
      }}
    >
      {form403?.enabled && userInfo?.email && onWorkspace ? 
        workspaceRequestForm(form403)
      : main403Template(config403)
      }
    </NavPageLayout>
  );
};

export default Custom403Page;
