import { NavPageLayoutProps } from '../../features/Navigation';


export interface SubmissionProps {
  showTitle?: boolean;
}

export interface SubmissionsPageLayoutProps extends NavPageLayoutProps {
  submissionProps: SubmissionProps;
}
