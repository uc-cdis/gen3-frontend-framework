// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import { GetStaticProps } from "next";
import { getNavPageLayoutPropsFromConfig } from "../common/staticProps";
import { LandingPageProps } from "@/components/Content/LandingPageContent";
import { NavPageLayout, NavPageLayoutProps } from "@/components/Navigation";
import User from "@/components/Profile/User";
import ProtectedContent from "@/components/Protected/ProtectedContent";

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const ProfilePage = ({ headerProps, footerProps }: Props) => {
  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <ProtectedContent >
        <div className="flex flex-row justify-between">
          <User />
        </div>
          </ProtectedContent>
      </NavPageLayout>
    </div>
  );
};


export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default ProfilePage;
