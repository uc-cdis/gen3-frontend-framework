import { TextContentProps } from '../Content/TextContent';

export interface Gen3LoginPanelConfig {
  title: string;
  subtitle: string;
  text: string;
  contact: string;
  email: string;
  image: string;
}

export interface LoginConfig extends Partial<Gen3LoginPanelConfig> {
  topContent?: ReadonlyArray<TextContentProps>;
  bottomContent?: ReadonlyArray<TextContentProps>;
}
