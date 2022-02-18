import { GetStaticProps } from "next";

import fs from 'fs';
import Header, { HeaderProps } from "../../components/Navigation/Header";
import FooterHEAL, { FooterHEALProps } from "../../components/Navigation/FooterHEAL";

import AboutHEALPageContent, { ImageEntry, DropdownEntry } from "../../components/Contents/AboutHEALPageContent"

interface Props extends HeaderProps {
    topImages: ReadonlyArray<ImageEntry>
    leftDropdowns: ReadonlyArray<DropdownEntry>
    rightDropdowns: ReadonlyArray<DropdownEntry>
    footer: FooterHEALProps
}

const PolicyPage = ({ top, navigation, topImages, leftDropdowns, rightDropdowns, footer }: Props) => {
    return (
        <div className="flex flex-col">
            <Header top={top} navigation={navigation} />
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <AboutHEALPageContent topImages={topImages} leftDropdowns={leftDropdowns} rightDropdowns={rightDropdowns} />
                </div>
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
        const about_data = fs.readFileSync('config/aboutHEAL.json', 'utf8')
        const json_about_data = JSON.parse(about_data)
        return {
            props: {
                navigation: json_data['navigation'],
                top: json_data['topBar'],
                topImages: json_about_data['topImages'],
                leftDropdowns: json_about_data['leftDropdowns'],
                rightDropdowns: json_about_data['rightDropdowns'],
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
            topImages: {},
            leftDropdowns: {},
            rightDropdowns: {},
            footer: {}
        }
    }
}

export default PolicyPage;
