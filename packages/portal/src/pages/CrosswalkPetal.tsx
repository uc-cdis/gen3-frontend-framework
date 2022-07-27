import { GetStaticProps } from 'next';
import Crosswalk from '../components/Crosswalk';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';

const CrosswalkPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <div className='flex flex-col'>
      <NavPageLayout  {...{ headerProps, footerProps }} >
        <Crosswalk
          fromTitle='Enter your BDCat Ids'
          toTitle='Matching MIDRC IDs' guidField='petal_crosswalk'
          fromField='bdcat_id' toField='midrc_id'
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
