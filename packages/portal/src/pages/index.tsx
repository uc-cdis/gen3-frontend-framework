import { GetServerSideProps } from 'next';

import Header, { HeaderProps } from '../components/Navigation/Header';
import Footer from '../components/Navigation/Footer';


const IndexPage = ({ top, navigation, banners }: HeaderProps) => {
  return (
    <div className='flex flex-col'>
      <Header top={top} navigation={navigation}  banners={banners} />
      <div className='flex flex-row  justify-items-center'>
        <div className='sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20'>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/landing',
      permanent: false
    }
  };
};

export default IndexPage;
