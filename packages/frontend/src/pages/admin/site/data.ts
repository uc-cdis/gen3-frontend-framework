import { getNavPageLayoutPropsFromConfig } from '../../../lib/common/staticProps';

export const SiteAdminPageGetServerSideProps = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};
