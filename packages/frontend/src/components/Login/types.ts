import { TextContentProps } from '../Content/TextContent';

export interface Gen3LoginPanelConfig {
  title: string;
  subtitle: string;
  text: string;
  contact: string;
  email: string;
  image: string;
  className: string;
}

export interface LoginConfig extends Partial<Gen3LoginPanelConfig> {
  topContent?: ReadonlyArray<TextImageContentProps>;
  bottomContent?: ReadonlyArray<TextImageContentProps>;
  showCredentialsLogin?: boolean;
}

export interface LoginSelectedProps {
  readonly handleLoginSelected: (_url: string) => void;
}
