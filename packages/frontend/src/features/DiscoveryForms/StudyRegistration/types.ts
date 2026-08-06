import { type NavPageLayoutProps } from '../../Navigation';
import { TextContentProps } from '../../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../../lib/content/types';
import { WorkspaceConfig } from '../../Workspace';
import { ButtonVariant } from '@mantine/core';

export interface ConfigStudyRegistrationAccessRequestFormProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

export interface studyRegistrationAccessRequestFormOutcomeProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
  button?: {
    href: string;
    variant?: ButtonVariant;
    text: string;
  };
}

export enum FormOutcome {
  pending = 'pending',
  success = 'success',
  error = 'error',
  userNotLoggedIn = 'userNotLoggedIn',
}
