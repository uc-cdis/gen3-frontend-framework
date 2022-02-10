import { PropsWithChildren } from "react";
import {GetStaticProps} from "next";
import fs from "fs";
import Header, { HeaderProps } from "./Navigation/Header";
import Footer from "./Navigation/Footer";


 const PageLayout = ({navigation, top, children } : PropsWithChildren<HeaderProps>) =>  {
    return (
        <div className="flex flex-col">
            <Header top={top} navigation={navigation} />
            { children }
            <Footer />
        </div>
    );
}

export default PageLayout;

export const getStaticProps:GetStaticProps = async () => {
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
