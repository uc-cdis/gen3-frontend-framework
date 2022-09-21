import { GetStaticProps } from 'next';
import Crosswalk from '../components/Crosswalk';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';


const N3C = {
  guidField: 'n3c_crosswalk',
  fromFields : [ { field: 'midrc_id', label: 'MIDRC' } ],
  toFields : [{ field: 'n3c_id', label: 'N3C' } ]
};

const CrosswalkPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <div className='flex flex-col'>
      <NavPageLayout  {...{ headerProps, footerProps }} >
        <Crosswalk
          fromTitle='Enter your MIDRC Ids'
          toTitle='Matching N3C IDs' guidField={N3C.guidField}
          fromFields={N3C.fromFields} toFields={N3C.toFields}
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
