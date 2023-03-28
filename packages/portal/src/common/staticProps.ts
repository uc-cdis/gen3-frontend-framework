import { FooterProps } from '../components/Navigation/Footer';
import { HeaderProps } from '../components/Navigation/Header';
import { NavigationProps } from '../components/Navigation/NavigationBar';
import { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';
import { TopBarProps } from '../components/Navigation/TopBar';
import ContentSource from '../lib/content';
import { JSONObject } from "@gen3/core";

export const getNavPageLayoutPropsFromConfig = async (): Promise<NavPageLayoutProps> => {
  const config = await ContentSource.get('config/siteConfig.json');
  const navigationConfigJSON = await ContentSource.get(`config/${config.commons}/navigation.json`);
  const {topBar, navigation} = navigationConfigJSON;
  const headerProps: HeaderProps = {
    top: topBar as unknown as TopBarProps,
    navigation: navigation as unknown as NavigationProps
  };
  const footerProps: FooterProps = await ContentSource.get(`config/${config.commons}/footer.json`);
  return { headerProps, footerProps };
};

export const getConfigAndContent = async (contentPath: string): Promise<JSONObject> => {
  const config = await ContentSource.get('config/siteConfig.json');

  const content = await ContentSource.get(contentPath);
  return { config, content };
}
