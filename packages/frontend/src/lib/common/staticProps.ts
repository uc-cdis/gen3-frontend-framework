import {
  type BannerProps,
  type HeaderMetadata,
  type HeaderProps,
  isHeaderMetadata,
  type NavigationProps,
  type NavPageLayoutProps,
} from '../../features/Navigation/types';

import { type TopBarProps } from '../../features/Navigation/TopBar/types';
import { type FooterProps } from '../../features/Navigation/Footer/types';

import ContentSource from '../content';
import { GEN3_COMMONS_NAME } from '@gen3/core/server';

/**
 * Retrieves navigation page layout properties from configuration.
 * Note: GEN3_COMMONS_NAME depends on siteConfig.json value in the data commons package
 * @returns A Promise resolving to an object containing header and footer props.
 */
export const getNavPageLayoutPropsFromConfig =
  async (): Promise<NavPageLayoutProps> => {
    const navigationConfigJSON = await ContentSource.getContentDatabase().get(
      `${GEN3_COMMONS_NAME}/navigation.json`,
    );

    const bannerConfigJSON: Array<BannerProps> = [];
    // TODO: enable later
    // try {
    //   bannerConfigJSON = await ContentSource.getContentDatabase().get(
    //     `${GEN3_COMMONS_NAME}/banner.json`,
    //   );
    // } catch (error: unknown) {
    //   console.warn(
    //     'No banner config found at: ',
    //     `${GEN3_COMMONS_NAME}/banner.json`,
    //   );
    // }
    const { topBar, navigation, type = 'original' } = navigationConfigJSON;

    let headerMetadata: HeaderMetadata = {
      title: 'Gen3 Frontend Framework Page',
      content: 'Gen3 Frontend Framework Page',
      key: 'gen3-common-page',
    };

    try {
      const loadedHeaderMetadata = await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/headerMetadata.json`,
      );

      if (isHeaderMetadata(loadedHeaderMetadata)) {
        headerMetadata = loadedHeaderMetadata;
      } else {
        console.warn('headerMetadata is not a valid HeaderMetadata object');
      }
    } catch (error: unknown) {
      console.warn(
        'No headerMetadata config found at: ',
        `${GEN3_COMMONS_NAME}/headerMetadata.json`,
      );
    }

    const headerProps: HeaderProps = {
      top: topBar as unknown as TopBarProps,
      navigation: navigation as unknown as NavigationProps,
      banners: bannerConfigJSON,
      type,
    };
    const footerProps: FooterProps =
      await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/footer.json`,
      );
    return {
      headerProps,
      footerProps,
      headerMetadata,
    };
  };
