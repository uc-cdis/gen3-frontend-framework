import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import { type NavPageLayoutProps } from '../../features/Navigation';


export const DefaultGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
