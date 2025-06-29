import { GetServerSideProps } from 'next';
import type { NavPageLayoutProps } from '../../features/Navigation';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';

export const TabbedCohortBuilderPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
