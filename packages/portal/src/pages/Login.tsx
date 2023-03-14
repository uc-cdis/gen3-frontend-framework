import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import NavPageLayout, {
  NavPageLayoutProps,
} from "../components/Navigation/NavPageLayout";
import { getNavPageLayoutPropsFromConfig } from "../common/staticProps";
import { LandingPageProps } from "../components/Contents/LandingPageContent";
import LoginProvidersPanel from "../components/Login/LoginProvidersPanel";
import { User } from "../components/Login/User";
import { TexturedSidePanel } from "../components/Login/TexturedSidePanel";

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const LoginPage = ({ headerProps, footerProps }: Props) => {
  const router = useRouter();

  const handleLoginSelected = async (url: string) => {
    router
      .push(url + "?redirect=https://localhost/Login")
      .catch((e) => alert(e));
  };

  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <div className="flex flex-row justify-between">
          <TexturedSidePanel />
          <div className="justify-center grow sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
            <LoginProvidersPanel
              referenceURL="/"
              handleLoginSelected={handleLoginSelected}
            />
          </div>
          <TexturedSidePanel />
        </div>
      </NavPageLayout>
    </div>
  );
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<NavPageLayoutProps> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default LoginPage;
