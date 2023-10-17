import { type NavPageLayoutProps } from '../../features/Navigation';
import { type LoginConfig } from '../../components/Login';

export interface LoginPageLayoutProps extends NavPageLayoutProps {
  loginConfig: LoginConfig;
}
