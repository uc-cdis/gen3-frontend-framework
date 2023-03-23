import { GetServerSideProps } from "next";
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import ProtectedContent from '../components/Login/ProtectedContent';
import NavPageLayout, { NavPageLayoutProps } from '../components/Navigation/NavPageLayout';
import { getAuthSession } from "../lib/session/hooks";
import type { Session} from "../lib/session/types";


interface DiscoveryPageProps extends NavPageLayoutProps {
  href: string;
  session?: Session | null;
}

const DiscoveryPage =({ headerProps, footerProps, href, session }: DiscoveryPageProps) => {

  console.log("DiscoveryPage", session) ;
  return (
    <NavPageLayout  {...{ headerProps, footerProps }} >
      <ProtectedContent referer={href}>
        <div className="flex flex-row justify-between">
          Coming soon
        </div>
      </ProtectedContent>
    </NavPageLayout>
  );
};


// change to app NextJS app rounting once fence is out of beta

export const getServerSideProps: GetServerSideProps<NavPageLayoutProps> = async (context) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      href: context.resolvedUrl,
      session: await getAuthSession(context.req)
    }
  };
}

export default DiscoveryPage;
