import { GetStaticProps } from 'next';
import ConfigurableCrosswalk from '../components/Crosswalk/ConfigurableCrosswalk';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';

const CrosswalkConfig = {

  N3C : {
    title: 'MIDRC to N3C',
    guidField: 'n3c_crosswalk',
    fromTitle:'Enter your MIDRC Ids',
    toTitle:'Matching N3C IDs',
    fromField: 'midrc_id',
    toField: 'n3c_id'
  },
  Petal: {
    title: 'BDCat to MIDRC',
    guidField: 'petal_crosswalk',
    fromTitle:'Enter your BDCat Ids',
    toTitle:'Matching MIDRC IDs',
    fromField : 'bdcat_id',
    toField : 'midrc_id',
  },
};

const CrosswalkFullPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <div className='flex flex-col'>
      <NavPageLayout  {...{ headerProps, footerProps }} >
        <ConfigurableCrosswalk converters={CrosswalkConfig}
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

export default CrosswalkFullPage;
