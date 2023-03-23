// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
import { GetStaticProps } from "next";
import NavPageLayout, { NavPageLayoutProps } from "../../../components/src/Navigation/NavPageLayout";
import { getNavPageLayoutPropsFromConfig } from "../common/staticProps";
import { LandingPageProps } from "../components/Contents/LandingPageContent";
import { User } from "../../../components/src/Profile/User";

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const ProfilePage = ({ headerProps, footerProps }: Props) => {
  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <div className="flex flex-row justify-between">
          <User />
        </div>
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
