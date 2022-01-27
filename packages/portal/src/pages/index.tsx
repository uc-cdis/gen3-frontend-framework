import { GetStaticProps } from "next";

import fs from 'fs';
import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
import { tabScrollButtonClasses } from "@mui/material";
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
                </div>
            </div>
            <Footer />
        </div>
    )
};

// should move this thing into _app.tsx and make a dedicated layout component after https://github.com/vercel/next.js/discussions/10949 is addressed
export const getStaticProps: GetStaticProps = async () => {
    return {
        redirect: {
            destination: '/landing',
            permanent: true
          }
    }
}

export default IndexPage;
