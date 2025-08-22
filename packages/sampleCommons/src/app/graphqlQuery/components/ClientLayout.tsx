'use client';

import React from 'react';
import type { QueryPageLayoutProps } from '@gen3/frontend';
import { NavPageLayout } from '@gen3/frontend';
import { QueryProvider } from '../components/queryProvider';

type Props = QueryPageLayoutProps & { children: React.ReactNode };

export default function ClientLayout({
  headerProps,
  footerProps,
  headerMetadata,
  queryProps,
  children,
}: Props) {
  return (
    <QueryProvider configuration={queryProps}>
      <NavPageLayout
        headerProps={headerProps}
        footerProps={footerProps}
        headerMetadata={headerMetadata}
      >
        {children}
      </NavPageLayout>
    </QueryProvider>
  );
}
