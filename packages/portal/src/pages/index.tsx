import { GetStaticProps } from "next";

import fs from 'fs';
import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
// if we want to use MDX
// import LandingPageMDX from "../../content/landing.mdx"
import LandingPage from "./landing"
interface Props {
    navigation: Record<any, any>;
    top: Record<any, any>
}

const IndexPage = ({ top, navigation }: Props) => {
    return (
        <div className="flex flex-col">
            <Header top={top} nav={navigation} />
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <LandingPage />
                </div>
            </div>
            <Footer />
        </div>
    )
};

export const getStaticProps: GetStaticProps = async () => {

    try {
        const file_data = fs.readFileSync('config/navigation.json', 'utf8')
        const json_data = JSON.parse(file_data)
        return {
            props: {
                navigation: json_data['navigation'],
                top: json_data['topBar']
            }
        }
    } catch (err) {
        console.error(err)
    }
    return {
        props: {
            navigation: {},
            top: {}
        }
    }

}

export default IndexPage;
