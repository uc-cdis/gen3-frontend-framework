// app/layout.tsx
import React from 'react';
import 'graphiql/style.css';
import '@graphiql/react/font/roboto.css';
import '@graphiql/react/font/fira-code.css'; // optional defaults :contentReference[oaicite:3]{index=3}// GraphiQL core styles (v5) :contentReference[oaicite:2]{index=2}
import './globals.css';
import ClientLayout from './components/ClientLayout';
import { getData } from './data';

export const dynamic = 'force-static';

export default async function Gen3QueryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { headerProps, footerProps, headerMetadata, queryProps } =
    await getData();
  return (
    <ClientLayout
      headerProps={headerProps}
      footerProps={footerProps}
      queryProps={queryProps}
      headerMetadata={{
        title: 'Gen3 Query Page',
        content: 'Query page',
        key: 'gen3-query-page',
        ...(headerMetadata ? headerMetadata : {}),
      }}
    >
      {children}
    </ClientLayout>
  );
}
