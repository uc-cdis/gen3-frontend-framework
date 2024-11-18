import React from 'react';
import { useRouter } from 'next/router';

import NavPageLayout, {
  NavPageLayoutProps,
} from '../../features/Navigation/NavPageLayout';

const NotebookLitePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  return (
    <NavPageLayout
      {...{ footerProps, headerProps }}
      headerData={{
        title: 'Gen3 Notebooks Lite Page',
        content: 'Notebooks Lite',
        key: 'gen3-notebooks-lite-page',
      }}
    >
      <div className="flex justify-items-center w-full">
        <iframe
          allow="cross-origin"
          src={`${router.basePath}/jupyter/index.html`}
          width="100%"
          height="100%"
          title="client notebook"
        ></iframe>
      </div>
    </NavPageLayout>
  );
};

export default NotebookLitePage;
