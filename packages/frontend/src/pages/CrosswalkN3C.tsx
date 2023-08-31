import { GetStaticProps } from 'next';
import Crosswalk from '../features/Crosswalk';
import { getNavPageLayoutPropsFromConfig } from '../lib/common/staticProps';
import { NavPageLayout, NavPageLayoutProps } from '../features/Navigation';

const N3C = {
  guidField: 'n3c_crosswalk',
  fromField: 'midrc_id',
  toField: 'n3c_id',
};

const CrosswalkPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <Crosswalk
          fromTitle="Enter your MIDRC Ids"
          toTitle="Matching N3C IDs"
          guidField={N3C.guidField}
          fromField={N3C.fromField}
          toField={N3C.toField}
        />
      </NavPageLayout>
    </div>
  );
};

export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default CrosswalkPage;
