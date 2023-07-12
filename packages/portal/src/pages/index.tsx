import { GetServerSideProps } from 'next';

const IndexPage = () => {
  return <div className="flex flex-col"></div>;
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
