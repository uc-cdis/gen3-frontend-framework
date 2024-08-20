import React from 'react';

import NavPageLayout, {
  NavPageLayoutProps,
} from '../../features/Navigation/NavPageLayout';

const NotebookLitePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{ footerProps, headerProps }}>
      <div className="flex justify-items-center w-full">
        <iframe
          allow="cross-origin"
          src="https://localhost:3010/jupyter/index.html"
          width="100%"
          height="100%"
          title="client notebook"
        ></iframe>
      </div>
    </NavPageLayout>
  );
};

export default NotebookLitePage;
