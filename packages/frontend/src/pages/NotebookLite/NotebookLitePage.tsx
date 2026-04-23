import React from 'react';
import { useRouter } from 'next/router';

import NavPageLayout from '../../features/Navigation/NavPageLayout';
import { NavPageLayoutProps } from '../../features/Navigation';

const NotebookLitePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  const { notebook } = router.query;
  const path =
    typeof notebook === 'string'
      ? notebook
      : typeof notebook === 'object'
        ? notebook[0]
        : undefined;
  const url = path
    ? `${router.basePath}/jupyter/index.html?path=${path}`
    : `${router.basePath}/jupyter/index.html`;

  return (
    <NavPageLayout
      {...{ footerProps, headerProps }}
      headerMetadata={{
        title: 'Gen3 Notebooks Lite Page',
        content: 'Notebooks Lite',
        key: 'gen3-notebooks-lite-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <iframe
          allow="cross-origin"
          src={url}
          width="100%"
          height="100%"
          title="client notebook"
          style={{ border: 'none' }}
        ></iframe>
      </div>
    </NavPageLayout>
  );
};

export default NotebookLitePage;
