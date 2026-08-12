import type { TextContentProps } from '../../../components/Content/TextContent';
import type { Gen3AppConfigData } from '../../../lib/content/types';
import type { ButtonVariant } from '@mantine/core';

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

export interface StudyRegistrationServiceResponse extends Record<
  string,
  unknown
> {
  error?: string;
  [key: string]: unknown;
}
