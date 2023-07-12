import { GetServerSideProps } from 'next';
import { Header, HeaderProps, Footer } from '../components/Navigation';

const IndexPage = ({ top, navigation }: HeaderProps) => {
  return (
    <div className="flex flex-col">
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/landing',
      permanent: false,
    },
  };
};

export default IndexPage;
