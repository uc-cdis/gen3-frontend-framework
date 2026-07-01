import { type NavPageLayoutProps } from '../../../features/Navigation';
import { TextContentProps } from '../../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../../lib/content/types';
import { WorkspaceConfig } from '../../../features/Workspace';
import { ButtonVariant } from '@mantine/core';

export interface ConfigStudyRegistrationAccessRequestFormProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

export interface studyRegistrationAccessRequestFormSuccessProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
  button?: {
    href: string;
    variant?: ButtonVariant;
    text: string;
  };
}
