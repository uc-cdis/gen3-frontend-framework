import { DictionaryConfig } from '../../features/Dictionary';
import { NavPageLayoutProps } from '../../features/Navigation';
import { SubmissionConfig  } from '../../features/Submission/types';

export type SubmissionsPageLayoutProps = NavPageLayoutProps & {
  submissionConfig?: SubmissionConfig;
  dictionaryConfig?: DictionaryConfig;
};
