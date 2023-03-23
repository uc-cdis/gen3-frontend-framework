import { FooterProps } from '../../../components/src/Navigation/Footer';
import { HeaderProps } from '../../../components/src/Navigation/Header';
import { NavigationProps } from '../../../components/src/Navigation/NavigationBar';
import { NavPageLayoutProps } from '../../../components/src/Navigation/NavPageLayout';
import { TopBarProps } from '../../../components/src/Navigation/TopBar';
import ContentSource from '../lib/content';

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
