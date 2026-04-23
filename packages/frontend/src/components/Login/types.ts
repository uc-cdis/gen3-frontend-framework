import { TextContentProps } from '../Content/TextContent';
import { Gen3AppConfigData } from '../../lib/content/types';

export interface Gen3LoginPanelConfig {
  title: string; // Main title for Login page
  subtitle: string; // a sub title
  text: string; // text string below the login buttons
  contact: string; // contact message
  email: string;
  image: string;
  className: string;
}

export interface LoginConfig
  extends Partial<Gen3LoginPanelConfig>,
    Gen3AppConfigData {
  topContent?: ReadonlyArray<TextContentProps>;
  loginProviderExtra?: {
    [key: string]: ReadonlyArray<TextContentProps>;
  }
  bottomContent?: ReadonlyArray<TextContentProps>;
  showCredentialsLogin?: boolean;
}

export interface LoginSelectedProps {
  readonly handleLoginSelected: (_url: string) => void;
  readonly loginProviderExtra?: LoginConfig["loginProviderExtra"];
}

export enum LoginButtonVisibility {
  Hidden = 'hide',
  Visible = 'visible',
  LogoutOnly = 'logoutOnly',
}
