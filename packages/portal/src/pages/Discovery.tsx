import { GetServerSideProps } from "next";
import { getNavPageLayoutPropsFromConfig } from '../common/staticProps';
import ProtectedContent from '../components/Login/ProtectedContent';
import NavPageLayout, { NavPageLayoutProps } from '@gen3/components';
import { getAuthSession } from "@/lib/session/hooks";
import type { Session} from "@/lib/session/types";


interface DiscoveryPageProps extends NavPageLayoutProps {
  href: string;
  session?: Session | null;
}

const DiscoveryPage =({ headerProps, footerProps, href, session }: DiscoveryPageProps) => {

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
  const session = await getAuthSession(context.req);
  console.log("session", session);
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      href: context.resolvedUrl,
      session: session
    }
  };
}

export default DiscoveryPage;
