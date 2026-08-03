import React from 'react';
import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

export default function Document() {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? '';
  return (
    <Html lang="en" {...mantineHtmlProps}>
      <Head>
        <link rel="shortcut icon" href={`${basePath}/icons/favicon.ico`} />
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
