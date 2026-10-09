// StudyRegistration — page with NavPageLayout
export { default as StudyRegistrationPage } from './StudyRegistration';
export { RequestAccessFormPageGetServerSideProps as StudyRegistrationPageGetServerSideProps } from './StudyRegistration/data';
export type { StudyRegistrationFormConfig } from './StudyRegistration/types';

// StudyRegistrationAccessRequest — page with NavPageLayout
export { default as StudyRegistrationAccessRequestPage } from './StudyRegistrationAccessRequest';
export { RequestAccessFormPageGetServerSideProps as StudyRegistrationAccessRequestPageGetServerSideProps } from './StudyRegistrationAccessRequest/data';

// StudyRegistration raw form — without NavPageLayout, for embedding in other layouts
export { default as StudyRegistrationForm } from '../../features/DiscoveryForms/StudyRegistration';

// GenericRegistrationAccessRequest raw form — without NavPageLayout
export { default as GenericRegistrationAccessRequestForm } from '../../features/DiscoveryForms/GenericRegistrationAccessRequest';
export type { GenericRegistrationAccessRequestFormConfig } from '../../features/DiscoveryForms/GenericRegistrationAccessRequest/types';

// VLMDSubmissionAccessRequest — page with NavPageLayout
export { default as VLMDSubmissionAccessRequestPage } from './VLMDSubmissionAccessRequest';
export { VLMDSubmissionAccessRequestPageGetServerSideProps } from './VLMDSubmissionAccessRequest/data';

// VLMDSubmission — page with NavPageLayout
export { default as VLMDSubmissionPage } from './VLMDSubmission';
export { VLMDSubmissionPageGetServerSideProps } from './VLMDSubmission/data';

// VLMDSubmission raw form — without NavPageLayout, for embedding in other layouts
export { default as VLMDSubmissionTabbedPanel } from '../../features/DiscoveryForms/VLMDSubmission';
export type {
  VLMDSubmissionConfig,
  VLMDSubmissionProps,
} from '../../features/DiscoveryForms/VLMDSubmission/types';
