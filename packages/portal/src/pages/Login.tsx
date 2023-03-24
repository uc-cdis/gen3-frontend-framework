import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { showNotification } from "@mantine/notifications";
import {
  NavPageLayout,
  NavPageLayoutProps,
  TexturedSidePanel,
  LoginProvidersPanel,
} from "@gen3/components";
import { getNavPageLayoutPropsFromConfig } from "../common/staticProps";
import { LandingPageProps } from "@/components/Contents/LandingPageContent";

interface Props extends NavPageLayoutProps {
  landingPage: LandingPageProps;
}

const LoginPage = ({ headerProps, footerProps }: Props) => {
  const router = useRouter();

  const {
    query: { redirect },
  } = router;

  const handleLoginSelected = async (url: string, redirect?: string) => {
    console.log("redirect", redirect);
    router
      .push(
        url +
          (redirect ? `?redirect=${redirect}` : "?redirect=https://localhost/"),
      )
      .catch((e) => {
        showNotification({
          title: "Login Error",
          message: `error logging in ${e.message}`,
        });
      });
  };

  return (
    <div className="flex flex-col">
      <NavPageLayout {...{ headerProps, footerProps }}>
        <div className="flex flex-row justify-between">
          <TexturedSidePanel />
          <div className="justify-center grow sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
            <LoginProvidersPanel
              handleLoginSelected={handleLoginSelected}
              redirectURL={redirect as string | undefined}
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
