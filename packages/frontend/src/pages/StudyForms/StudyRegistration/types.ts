import { SelectOptionItem } from '../../../components/Content/FormContent';

export interface StudyRegistrationFormItem {
  type?: string;
  variable?: string;
  label?: string;
  text?: string | string[];
  required?: boolean;
  initialValue?: unknown;
  placeholder?: string;
  className?: string;
  dropdownData?: SelectOptionItem[];
  [key: string]: unknown;
}

export interface StudyRegistrationStatusConfig {
  content?: StudyRegistrationFormItem[];
  button?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface StudyRegistrationFormConfig {
  mdsURL: string;
  cedarWrapperURL: string;
  clinicalTrialFields: string[];
  form: StudyRegistrationFormItem[];
  success: StudyRegistrationStatusConfig;
  error: StudyRegistrationStatusConfig;
  [key: string]: unknown;
}
