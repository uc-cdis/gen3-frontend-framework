import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import { Gen3Authz, type Authz } from '../../../features/Authz';

interface Props extends NavPageLayoutProps {
  authz: Authz;
}

const AuthzPage = ({ headerProps, footerProps, authz }: Props) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerProps={headerProps}
      headerData={{
        title: 'Gen3 Authz Editor Page',
        content: 'Authz Editor page',
        key: 'gen3-authz-editor-page',
      }}
    >
      <Gen3Authz authz={authz} />
    </NavPageLayout>
  );
};

export default AuthzPage;
