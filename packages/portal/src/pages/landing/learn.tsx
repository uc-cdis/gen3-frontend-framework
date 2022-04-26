import {GetStaticProps} from "next";
import ContentSource from "../../lib/content/";
import { useRouter } from 'next/router'

import NavPageLayout, { NavPageLayoutProps } from "../../components/Navigation/NavPageLayout";
import LearnPageContent, {LearnPageConfig} from "../../components/Contents/LearnPageContent"
import { getNavPageLayoutPropsFromConfig } from "../../common/staticProps";

interface PolicyPageProps extends NavPageLayoutProps {
    learnPageConfig: LearnPageConfig
}

const PolicyPage = ({headerProps, footerProps, learnPageConfig}: PolicyPageProps) => {
    const router = useRouter()
    const { roleId } = router.query
    return (
        <NavPageLayout {...{headerProps, footerProps}}>
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <LearnPageContent {...learnPageConfig}/>
                </div>
            </div>
        </NavPageLayout>
    )
};


// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<PolicyPageProps> = async ( ) => {
    const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
    const learnPageConfig = await ContentSource.get<LearnPageConfig>('config/learn.json');
    return {
        props: {
            ...navPageLayoutProps,
            learnPageConfig
        }
    }
}

export default PolicyPage;
