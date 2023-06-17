import { GetServerSideProps } from 'next';
import { Header, HeaderProps, Footer } from '../components/Navigation';

const IndexPage = ({ top, navigation }: HeaderProps) => {
  return (
    <div className="flex flex-col">
      <Header top={top} navigation={navigation} />
      <div className="flex flex-row  justify-items-center">
        <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20"></div>
      </div>
      <Footer />
    </div>
  );
};

const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/landing',
      permanent: false,
    },
  };
};

export default IndexPage;
