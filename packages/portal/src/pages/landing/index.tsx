import { GetStaticProps } from "next";

import fs from 'fs';
import Header, { HeaderProps } from "../../components/Navigation/Header";
import FooterHEAL, { FooterHEALProps } from "../../components/Navigation/FooterHEAL";
// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPageContent, { LandingPageProps } from "../../components/Contents/LandingPageContent"

interface Props extends HeaderProps {
    footer: FooterHEALProps,
    landingPage: LandingPageProps
}

const LandingPage = ({ top, navigation, footer, landingPage }: Props) => {
    return (
        <div className="flex flex-col">
            <Header top={top} navigation={navigation} />
            <div className="flex flex-row justify-items-center">
                <LandingPageContent content={landingPage} />
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

        const landingPage_data = fs.readFileSync('config/landingPage.json', 'utf8');
        const json_landingPage_data = JSON.parse(landingPage_data);
        return {
            props: {
                navigation: json_data['navigation'],
                top: json_data['topBar'],
                footer: footer_json_data,
                landingPage: json_landingPage_data
            }
        }
    } catch (err) {
        console.error(err)
    }
    return {
        props: {
            navigation: {},
            top: {},
            footer: {},
            landingPage: {}
        }
    }
}

export default LandingPage;
