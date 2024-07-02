import { GetServerSideProps } from 'next';
import type { NavPageLayoutProps } from '../../features/Navigation';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';

export const DataLibraryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
