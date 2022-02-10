import { GetStaticProps } from "next";

import fs from 'fs';
import Header, { HeaderProps } from "../../components/Navigation/Header";
import Footer from "../../components/Navigation/Footer";
import RolesPageContent, {RoleContentEntry} from "../../components/Contents/RolesPageContent"

interface Props extends HeaderProps {
    rolesPages: Record<string, RoleContentEntry>
}

const TreatmentPage = ({ top, navigation, rolesPages }: Props) => {
    return (
        <div className="flex flex-col">
            <Header top={top} navigation={navigation} />
            <div className="flex flex-row  justify-items-center">
                <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20">
                    <RolesPageContent rolesPages={rolesPages} rolePageKey={'Treatment'} />
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
        const roles_file_data = fs.readFileSync('config/rolesPages.json', 'utf8')
        const roles_json_data = JSON.parse(roles_file_data)
        return {
            props: {
                navigation: json_data['navigation'],
                top: json_data['topBar'],
                rolesPages: roles_json_data
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

export default TreatmentPage;
