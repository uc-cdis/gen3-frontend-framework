import { GetStaticProps } from 'next';
import ConfigurableCrosswalk from '../components/Crosswalk/ConfigurableCrosswalk';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';

const CrosswalkConfig = {

  // N3C : {
  //   title: 'MIDRC to N3C',
  //   guidField: 'n3c_crosswalk',
  //   fromTitle:'Enter your MIDRC IDs',
  //   toTitle:'Matching N3C IDs',
  //   fromField: 'midrc_id',
  //   toField: 'n3c_id'
  // },
  Petal: {
    title: 'BDCat to MIDRC',
    guidField: 'petal_crosswalk',
    fromTitle:'Enter your BDCat IDs',
    toTitle:'Matching MIDRC IDs',
    fromPath : ['crosswalk','subject','https://gen3.biodatacatalyst.nhlbi.nih.gov','subject.submitter_id','value'],
    toPath: ['crosswalk','subject','https://data.midrc.org','case.submitter_id','value'],
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
