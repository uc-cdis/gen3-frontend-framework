import React from 'react';
import { GetServerSideProps } from 'next';
import { Footer, Header, HeaderProps } from '../features/Navigation';

const IndexPage = ({ topBar, navigation }: HeaderProps) => {
  return (
    <div className="flex flex-col">
      <Header topBar={topBar} navigation={navigation} />
      <div className="flex flex-row  justify-items-center">
        <div className="sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-20"></div>
      </div>
      <Footer />
    </div>
  );
};

// todo

const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/landing',
      permanent: false,
    },
  };
};

export default IndexPage;
