import { GetServerSideProps } from "next";

import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";
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

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        redirect: {
            destination: '/landing',
            permanent: false
          }
    }
}

export default IndexPage;
