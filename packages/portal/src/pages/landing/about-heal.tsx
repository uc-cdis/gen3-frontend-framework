import { GetStaticProps } from "next";

import fs from 'fs';

import AboutHEALPageContent, { ImageEntry, DropdownEntry } from "../../components/Contents/AboutHEALPageContent"
import { getNavPageLayoutPropsFromConfig } from "../../common/staticProps";
import NavPageLayout, { NavPageLayoutProps } from "../../components/Navigation/NavPageLayout";

interface Props extends NavPageLayoutProps {
    topImages: ReadonlyArray<ImageEntry>
    leftDropdowns: ReadonlyArray<DropdownEntry>
    rightDropdowns: ReadonlyArray<DropdownEntry>
}

const PolicyPage = ({ headerProps, footerProps, topImages, leftDropdowns, rightDropdowns }: Props) => {
    return (
        <NavPageLayout {...{headerProps, footerProps}}>
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <AboutHEALPageContent topImages={topImages} leftDropdowns={leftDropdowns} rightDropdowns={rightDropdowns} />
                </div>
            </div>
        </NavPageLayout>
    )
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps = async () => {
    const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
    const about_data = fs.readFileSync('config/aboutHEAL.json', 'utf8')
    const {topImages, leftDropdowns, rightDropdowns} = JSON.parse(about_data) as {
        topImages: ReadonlyArray<ImageEntry>
        leftDropdowns: ReadonlyArray<DropdownEntry>
        rightDropdowns: ReadonlyArray<DropdownEntry>
    };

    return {
        props: {
            ...navPageLayoutProps,
            topImages, leftDropdowns, rightDropdowns
        }
    }
}

export default PolicyPage;
