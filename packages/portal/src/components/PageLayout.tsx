import { PropsWithChildren } from "react";
import Link from 'next/link';
import {GetStaticProps} from "next";
import fs from "fs";
import Header from "./Navigation/Header";
import LandingPageMDX from "../../content/landing.mdx";
import Footer from "./Navigation/Footer";

interface Props {
    navigation: Record<any, any>;
    top: Record<any, any>
}

 const PageLayout = ({navigation, top, children } : PropsWithChildren<Props>) =>  {
    return (
        <div className="flex flex-col">
            <Header top={top} nav={navigation} />
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
