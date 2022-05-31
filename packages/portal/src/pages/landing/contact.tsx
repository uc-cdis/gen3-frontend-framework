import {GetStaticProps} from 'next';
import NavPageLayout, { NavPageLayoutProps } from '../../components/Navigation/NavPageLayout';
import { getNavPageLayoutPropsFromConfig } from '../../common/staticProps';
import Link from 'next/link';
import { Text } from '@mantine/core';
import {FaEnvelope, FaExternalLinkAlt} from 'react-icons/fa';

const ContactPage = ( {footerProps, headerProps}: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{footerProps, headerProps}}>
      <div className='flex flex-row justify-center'>
        <div className='flex flex-col justify-evenly pb-10 text-xl max-w-10'>
          <div className='pb-10 pt-10 text-sm'>
            <Link href={'/'}>Home&nbsp;</Link>
            {' > '}
            <span className='text-heal-primary'>&nbsp;Contact</span>
          </div>
          <h1 className='font-bold text-4xl text-gen3-coal font-montserrat pb-4'>Contact</h1>
          <Text className='prose text-black text-2xl p-8'>
                    For technical questions about the HEAL Platform, contact our Platform Team from CTDS-Gen3 at
            <a className='text-gen3-base_blue flex flex-row items-baseline no-underline font-bold' href='mailto:heal-support@datacommons.io'>
              <FaEnvelope className='pr-1 pt-2'/> heal-support@datacommons.io
            </a>
          </Text>
          <Text className='prose text-black text-2xl p-8'>
                        For data-related questions, contact the data stewards from RENCI/RTI via
            <a className='text-gen3-base_blue flex flex-row items-baseline no-underline font-bold' href='http://bit.ly/HEALStewardsConnect'>
              <FaExternalLinkAlt className='pr-1 pt-2'/> the HEAL Stewards contact form
            </a>
          </Text>
          <Text className='prose text-black text-2xl p-8'>
                        For general inquiries and questions about funding, contact the NIH-HEAL office at
            <a className='text-gen3-base_blue flex flex-row items-baseline no-underline font-bold' href='mailto:HEALquestion@od.nih.gov'>
              <FaEnvelope className='pr-1 pt-2'/>HEALquestion@od.nih.gov
            </a>
          </Text>
          <Text className='prose text-heal-primary text-3xl p-8 font-bold'>
                        Please allow 48 hours for a response.
          </Text>
        </div>
      </div>
    </NavPageLayout>
  );
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async ( ) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig())
    }
  };
};

export default ContactPage;
