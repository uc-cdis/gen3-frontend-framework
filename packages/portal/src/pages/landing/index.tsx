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
// =======
//     try {
//         const file_data = fs.readFileSync('config/navigation.json', 'utf8')
//         const json_data = JSON.parse(file_data)
//         const footer_file_data = fs.readFileSync('config/footer.json', 'utf8')
//         const footer_json_data = JSON.parse(footer_file_data)

//         const landingPage_data = fs.readFileSync('config/landingPage.json', 'utf8');
//         const json_landingPage_data = JSON.parse(landingPage_data);
//         return {
//             props: {
//                 navigation: json_data['navigation'],
//                 top: json_data['topBar'],
//                 footer: footer_json_data,
//                 landingPage: json_landingPage_data
//             }
//         }
//     } catch (err) {
//         console.error(err)
//     }
//     return {
//         props: {
//             navigation: {},
//             top: {},
//             footer: {},
//             landingPage: {}
// >>>>>>> feat/landingPage
//         }
//     }
}

export default LandingPage;
