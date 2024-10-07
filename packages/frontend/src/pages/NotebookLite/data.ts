// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import { GetStaticProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';

export const NotebookLitePageGetStaticProps: GetStaticProps = async () => {
  const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
  return {
    props: {
      ...navPageLayoutProps,
    },
  };
};
