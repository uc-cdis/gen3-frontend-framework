import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '../../../features/Navigation';
import SiteAdministration from '../../../features/admin/SiteAdministration';

const SiteAdminstrationPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerProps={headerProps}
      headerData={{
        title: 'Gen3 Site Administration Page',
        content: 'Administration Editor page',
        key: 'gen3-site-administration-page',
      }}
    >
      <SiteAdministration />
    </NavPageLayout>
  );
};

export default SiteAdminstrationPage;
