import { TextContentProps } from '../../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../../lib/content/types';
import { ButtonVariant } from '@mantine/core';

export interface ConfigGenericRegistrationAccessRequestFormProps extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

export interface genericRegistrationAccessRequestFormOutcomeProps extends Gen3AppConfigData {
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
  duplicateSubmission = 'duplicateSubmission',
}

export interface FormContentViewsConfig {
  [FormOutcome.success]: genericRegistrationAccessRequestFormOutcomeProps;
  [FormOutcome.duplicateSubmission]: genericRegistrationAccessRequestFormOutcomeProps;
}
