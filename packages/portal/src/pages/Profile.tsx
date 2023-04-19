// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import { GetServerSideProps, GetStaticProps } from "next";
import { getNavPageLayoutPropsFromConfig } from "../common/staticProps";
import { LandingPageProps } from "@/components/Content/LandingPageContent";
import { NavPageLayout, NavPageLayoutProps } from "@/components/Navigation";
import User from "@/components/Profile/User";
import ProtectedContent from "@/components/Protected/ProtectedContent";
import Credentials from "@/components/Profile/Credentials";
import { Divider } from "@mantine/core";

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const ProfilePage = ({ headerProps, footerProps }: Props) => {
  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <ProtectedContent>
          <div className="flex flex-col">
          <div className="flex justify-between">
            <User />
            </div>
            <Divider label="Credentials"/>
            <Credentials />
          </div>
        </ProtectedContent>
      </NavPageLayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {

  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default ProfilePage;
