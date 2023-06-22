import {FooterProps, HeaderProps, NavigationProps, NavPageLayoutProps, TopBarProps} from '../../components/Navigation';
import ContentSource from '../content';
import {JSONObject} from "@gen3/core";

export const getNavPageLayoutPropsFromConfig = async (): Promise<NavPageLayoutProps> => {
  const config = await ContentSource.get('config/siteConfig.json');
  console.log("getNavPageLayoutPropsFromConfig config", config);  // DEBUG
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
