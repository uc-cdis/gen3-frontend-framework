import { NavPageLayoutProps } from '../../features/Navigation';
import { SubmissionProps } from '../../features/Submission/SubmissionPanel';

export type SubmissionsPageLayoutProps = NavPageLayoutProps & {
  submissionConfig?: SubmissionProps
};
