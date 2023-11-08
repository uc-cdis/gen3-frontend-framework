import {
  FooterProps,
  HeaderProps,
  NavigationProps,
  NavPageLayoutProps,
  TopBarProps,
} from '../../features/Navigation';
import ContentSource from '../content';
import { JSONObject, GEN3_COMMONS_NAME } from '@gen3/core';

export const getNavPageLayoutPropsFromConfig =
  async (): Promise<NavPageLayoutProps> => {
    const navigationConfigJSON = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/navigation.json`,
    );
    const { topBar, navigation } = navigationConfigJSON;
    const headerProps: HeaderProps = {
      top: topBar as unknown as TopBarProps,
      navigation: navigation as unknown as NavigationProps,
    };
    const footerProps: FooterProps = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/footer.json`,
    );
    return { headerProps, footerProps };
  };

export const getConfigAndContent = async (
  contentPath: string,
): Promise<JSONObject> => {
  const config = await ContentSource.get('config/siteConfig.json');

  const content = await ContentSource.get(contentPath);
  return { config, content };
};
