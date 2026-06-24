import { type NavPageLayoutProps } from '../../../features/Navigation';
import { TextContentProps } from '../../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../../lib/content/types';
import { type ButtonVariant } from '@mantine/core';
import { WorkspaceConfig } from '../../../features/Workspace';

export interface ConfigStudyRegistrationAccessRequestFormProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

//& 403Props;
export interface Custom403PageProps extends NavPageLayoutProps {
  ConfigStudyRegistrationAccessRequestFormProps: ConfigStudyRegistrationAccessRequestFormProps;
  form403: WorkspaceConfig['requestAccessForm'];
}
