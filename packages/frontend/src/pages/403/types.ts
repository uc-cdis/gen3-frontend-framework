import { type NavPageLayoutProps } from '../../features/Navigation';
import { TextContentProps } from '../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../lib/content/types';


export interface Config403Props extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

//& 403Props;
export interface Custom403PageProps extends NavPageLayoutProps {
  config403: Config403Props;
}
