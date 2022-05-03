import {GetStaticProps} from "next";
import ContentSource from "../../lib/content/";
import { useRouter } from 'next/router'

import NavPageLayout, { NavPageLayoutProps } from "../../components/Navigation/NavPageLayout";
import RolesPageContent, {RoleContentEntry} from "../../components/Contents/RolesPageContent"
import { getNavPageLayoutPropsFromConfig } from "../../common/staticProps";

interface PolicyPageProps extends NavPageLayoutProps {
    rolesPages: Record<string, RoleContentEntry>
}

const PolicyPage = ({headerProps, footerProps, rolesPages}: PolicyPageProps) => {
    const router = useRouter()
    const { roleId } = router.query
    return (
        <NavPageLayout {...{headerProps, footerProps}}>
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <RolesPageContent rolesPages={rolesPages} rolePageKey={roleId as string}/>
                </div>
            </div>
        </NavPageLayout>
    )
};


export const  getStaticPaths = async ( )  => {
    const roles_json_data = await ContentSource.get('config/rolesPages.json')
    const paths = Object.keys(roles_json_data).map((x) => ({
        params: { roleId: x }
    }));
    return {
        paths,
        fallback: false
    }
}

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps<PolicyPageProps> = async ( ) => {
    const navPageLayoutProps = await getNavPageLayoutPropsFromConfig();
    const rolesPages = await ContentSource.get<RoleContentEntry>('config/rolesPages.json') as unknown as Record<string, RoleContentEntry>;
    return {
        props: {
            ...navPageLayoutProps,
            rolesPages
        }
    }
}

export default PolicyPage;
