import { GetStaticProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import ProtectedContent from '../components/Login/ProtectedContent';

import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';
import { useSession } from "../lib/session/session";
import { useSessionToken } from "../lib/session/hooks";


const DiscoveryPage =({ headerProps, footerProps }: NavPageLayoutProps) => {

  const { user, userStatus } = useSession( { required: true} );
  // const tokenStatus = useSessionToken();
  console.log("DiscoveryPage user", userStatus)
  return (

    <NavPageLayout  {...{ headerProps, footerProps }} >
      {  userStatus === "authenticated" ? (
      <div className='flex flex-row justify-items-center'>

        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
          Coming Soon
        </div>

      </div>)
       : (
        <div className='flex flex-row justify-items-center'>
            Private
        </div>)
      }
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

export default DiscoveryPage;
