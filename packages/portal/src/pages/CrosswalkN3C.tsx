import { GetStaticProps } from 'next';
import Crosswalk from '../components/Crosswalk';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';

const CrosswalkPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <div className='flex flex-col'>
      <NavPageLayout  {...{ headerProps, footerProps }} >
        <Crosswalk
          fromTitle='Enter your MIDRC Ids'
          toTitle='Matching N3C IDs' guidField='petal_crosswalk'
          fromField='midrc_id' toField='rand_id'
        />
      </NavPageLayout>
    </div>
  );
};

export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async ( ) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig())
    }
  };
};

export default CrosswalkPage;
