import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

const Custom404Page: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Page Not Found</title>
        <meta
          property="og:title"
          content="Gen3 Portal Page Not Found"
          key="gen3-page-not-found"
        />
      </Head>
      <div className="flex flex-col justify-center items-center h-full p-8 gap-2">
        <h1 className="text-2xl">Page Not Found</h1>
        <span>Sorry, we couldn&apos;t find the page you were looking for.</span>
        <Link href="/" className="text-primary underline">
          Click here to go to the Portal&apos;s home page.
        </Link>
      </div>
    </React.Fragment>
  );
};

export default Custom404Page;
