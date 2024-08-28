import {
  FooterProps,
  HeaderProps,
  NavigationProps,
  NavPageLayoutProps,
  TopBarProps,
} from '../../features/Navigation';
import ContentSource from '../content';
import { JSONObject, GEN3_COMMONS_NAME } from '@gen3/core';

/**
 * Retrieves navigation page layout properties from configuration.
 * Note: GEN3_COMMONS_NAME depends on siteConfig.json value in the data commons package
 * @returns A Promise resolving to an object containing header and footer props.
 */
export const getNavPageLayoutPropsFromConfig =
  async (): Promise<NavPageLayoutProps> => {
    const navigationConfigJSON = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/navigation.json`,
    );
    const { topBar, navigation, type = 'original' } = navigationConfigJSON;

    const headerProps: HeaderProps = {
      top: topBar as unknown as TopBarProps,
      navigation: navigation as unknown as NavigationProps,
      type,
    };
    const footerProps: FooterProps = await ContentSource.get(
      `config/${GEN3_COMMONS_NAME}/footer.json`,
    );
    return {
      headerProps,
      footerProps,
      headerData: {
        title: 'Gen3 Frontend Framework Page',
        content: 'Gen3 Frontend Framework Page',
        key: 'gen3-common-page',
      },
    };
  };
