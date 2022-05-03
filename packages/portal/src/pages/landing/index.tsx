import { GetStaticProps } from "next";

// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPageContent, { LandingPageProps } from "../../components/Contents/LandingPageContent"
import { RoleContentEntry } from "../../components/Contents/RolesPageContent";
import { getNavPageLayoutPropsFromConfig } from "../../common/staticProps";
import ContentSource from "../../lib/content";
import NavPageLayout, { NavPageLayoutProps } from "../../components/Navigation/NavPageLayout";

interface Props extends NavPageLayoutProps {
    landingPage: LandingPageProps
}

const LandingPage = ({ headerProps, footerProps, landingPage }: Props) => {
    return (
        <NavPageLayout {...{footerProps, headerProps}}>
            <div className="flex flex-row justify-items-center">
                <LandingPageContent content={landingPage} />
            </div>
        </NavPageLayout>
    )
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps = async () => {
    const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
    const rolesPages = await ContentSource.get('config/rolesPages.json') as unknown as Record<string, RoleContentEntry>;
    const landingPage = await ContentSource.get('config/landingPage.json');
    return {
        props: {
            ...navPageLayoutProps,
            rolesPages,
            landingPage
        }
    }
}

export default LandingPage;
