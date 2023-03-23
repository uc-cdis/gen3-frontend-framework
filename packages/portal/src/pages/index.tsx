import { GetServerSideProps } from 'next';
import Header, { HeaderProps } from '../../../components/src/Navigation/Header';
import Footer from '../../../components/src/Navigation/Footer';


const IndexPage = ({ top, navigation }: HeaderProps) => {
  return (
    <div className='flex flex-col'>
      <Header top={top} navigation={navigation} />
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
      destination: '/Discovery',
      permanent: false
    }
  };
};

export default IndexPage;
