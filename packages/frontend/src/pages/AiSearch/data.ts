import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import type { NavPageLayoutProps } from '../../features/Navigation';

export const AISearchPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        headerProps: {
          top: {
            items: [],
          },
          navigation: {},
        },
        footerProps: {},
        headerData: {
          title: 'Gen3 AI Search Page',
          content: 'AI Search',
          key: 'gen3-ai-search-page',
        },
      },
    };
  }
};
