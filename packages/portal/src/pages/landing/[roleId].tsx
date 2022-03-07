import {GetStaticProps} from "next";
import ContentSource from "../../lib/content/";
import { useRouter } from 'next/router'

import {HeaderProps} from "../../components/Navigation/Header";
import FooterHEAL, {FooterHEALProps, FooterLinksProp} from "../../components/Navigation/FooterHEAL";
import NavPageLayout from "../../components/Navigation/NavPageLayout";
import RolesPageContent, {RoleContentEntry} from "../../components/Contents/RolesPageContent"

interface Props extends HeaderProps {
    rolesPages: Record<string, RoleContentEntry>
    links: ReadonlyArray<FooterLinksProp>;
}

const PolicyPage = ({top, navigation, rolesPages, links}: Props) => {
    const router = useRouter()
    const { roleId } = router.query
    return (
        <NavPageLayout top={top}
                       navigation={navigation}
                       footer={<FooterHEAL links={links}/>}>
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
export const getStaticProps: GetStaticProps = async ( { params } ) => {
    try {
        const json_data = await ContentSource.get("config/navigation.json")
        const footer_json_data = await ContentSource.get('config/footer.json')
        const roles_json_data = await ContentSource.get('config/rolesPages.json')
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

export default PolicyPage;
