import { GetStaticProps } from "next";

import fs from 'fs';
import Header from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import AboutHEALPageContent from "../../components/Contents/AboutHEALPageContent"

interface Props {
    navigation: Record<any, any>;
    top: Record<any, any>;
    topImages: Record<any, any>;
    leftDropdowns: Record<any, any>;
    rightDropdowns: Record<any, any>;
}

const PolicyPage = ({ top, navigation, topImages, leftDropdowns, rightDropdowns }: Props) => {
    return (
        <div className="flex flex-col">
            <Header top={top} nav={navigation} />
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <AboutHEALPageContent topImages={topImages} leftDropdowns={leftDropdowns} rightDropdowns={rightDropdowns} />
                </div>
            </div>
            <Footer />
        </div>
    )
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps = async () => {
    try {
        const file_data = fs.readFileSync('config/navigation.json', 'utf8')
        const json_data = JSON.parse(file_data)
        const about_data = fs.readFileSync('config/aboutHEAL.json', 'utf8')
        const json_about_data = JSON.parse(about_data)
        return {
            props: {
                navigation: json_data['navigation'],
                top: json_data['topBar'],
                topImages: json_about_data['topImages'],
                leftDropdowns: json_about_data['leftDropdowns'],
                rightDropdowns: json_about_data['rightDropdowns'],
            }
        }
    } catch (err) {
        console.error(err)
    }
    return {
        props: {
            navigation: {},
            top: {},
            rolesPages: {}
        }
    }
}

export default PolicyPage;
