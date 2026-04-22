import { type NavPageLayoutProps } from '../../features/Navigation';
import { TextContentProps } from '../../components/Content/TextContent';
import { Gen3AppConfigData } from '../../lib/content/types';


export interface Config404Props extends Gen3AppConfigData {
  content?: ReadonlyArray<TextContentProps>;
}

//& 404Props;
export interface Custom404PageProps extends NavPageLayoutProps {
  config404: Config404Props;
}
