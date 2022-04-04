import { GetStaticProps } from "next";

import fs from 'fs';
import Header, { HeaderProps } from "../../components/Navigation/Header";
import FooterHEAL, { FooterHEALProps } from "../../components/Navigation/FooterHEAL";
// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPageContent from "../../components/Contents/LandingPageContent"
import { RoleContentEntry } from "../../components/Contents/RolesPageContent";

interface Props extends HeaderProps {
    rolesPages: Record<string, RoleContentEntry>
    footer: FooterHEALProps
}

const LandingPage = ({ top, navigation, rolesPages, footer }: Props) => {
    return (
        <div className="flex flex-col">
            <Header top={top} navigation={navigation} />
            <div className="flex flex-row justify-items-center">
                <LandingPageContent rolesPages={rolesPages} />
            </div>
            <FooterHEAL links={footer.links} />
        </div>
    )
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps = async () => {
    try {
        const file_data = fs.readFileSync('config/navigation.json', 'utf8')
        const json_data = JSON.parse(file_data)
        const footer_file_data = fs.readFileSync('config/footer.json', 'utf8')
        const footer_json_data = JSON.parse(footer_file_data)
        const roles_file_data = fs.readFileSync('config/rolesPages.json', 'utf8')
        const roles_json_data = JSON.parse(roles_file_data)
        return {
            props: {
                navigation: json_data['navigation'],
                top: json_data['topBar'],
                rolesPages: roles_json_data,
                footer: footer_json_data
            }
        }
    } catch (err) {
        console.error(err)
    }
    return {
        props: {
            navigation: {},
            top: {},
            rolesPages: {},
            footer: {}
        }
    }
}

export default LandingPage;
