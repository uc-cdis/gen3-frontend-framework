import {
  type BannerProps,
  type FooterProps,
  type HeaderMetadata,
  type HeaderProps,
  isHeaderMetadata,
  type NavigationProps,
  type NavPageLayoutProps,
  type TopBarProps,
} from '../../features/Navigation';
import ContentSource from '../content';
import { GEN3_COMMONS_NAME } from '@gen3/core';

/**
 * Retrieves navigation page layout properties from configuration.
 * Note: GEN3_COMMONS_NAME depends on siteConfig.json value in the data commons package
 * @returns A Promise resolving to an object containing header and footer props.
 */
export const getNavPageLayoutPropsFromConfig =
  async (): Promise<NavPageLayoutProps> => {
    let navigationConfigJSON: HeaderProps = {
      topBar: { items: [] },
      navigation: {
        items: [
          {
            name: 'Site navigation is not configured',
            icon: '',
            tooltip: '',
            href: ''
          },
        ],
      },
      type: 'original',
    };

    try {
      navigationConfigJSON = await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/navigation.json`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(
          `Error occurred while getting navigation configuration: ${GEN3_COMMONS_NAME}/navigation.json`,
        );
      }
    }

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
      topBar: topBar as unknown as TopBarProps,
      navigation: navigation as unknown as NavigationProps,
      banners: bannerConfigJSON,
      type,
    };

    let footerProps: FooterProps = {};
    try {
      footerProps = await ContentSource.getContentDatabase().get(
        `${GEN3_COMMONS_NAME}/footer.json`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(
          `Error occurred while getting footer configuration: ${GEN3_COMMONS_NAME}/footer.json`,
        );
      }
    }

    return {
      headerProps,
      footerProps,
      headerMetadata,
    };
  };
