import { type NavPageLayoutProps } from '../../features/Navigation';
import { TextContentProps } from '../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../lib/content/types';
import { type ButtonVariant } from '@mantine/core';


export interface Config403Props extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
  topIcon?: {
    src: string;
    alt: string;
  }
  button?: {
    href: string;
    variant?: ButtonVariant;
    text: string;
  }
}

//& 403Props;
export interface Custom403PageProps extends NavPageLayoutProps {
  config403: Config403Props;
}
