import { GetStaticProps } from 'next';
import Crosswalk from '../components/Crosswalk';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import NavPageLayout, { NavPageLayoutProps } from '../../../components/src/Navigation/NavPageLayout';

const Petal = {
  guidField: 'petal_crosswalk',
  fromField : 'bdcat_id',
  toField: 'midrc_id'
};

const CrosswalkPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <div className='flex flex-col'>
      <NavPageLayout  {...{ headerProps, footerProps }} >
        <Crosswalk
          fromTitle='Enter your BDCat Ids'
          toTitle='Matching MIDRC IDs' guidField={Petal.guidField}
          fromField={Petal.fromField} toField={Petal.toField}
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
