import React from 'react';
import { NavPageLayout, NavPageLayoutProps } from "../../features/Navigation";
import { CohortBuilder } from '../../features/CohortBullder/CohortBuilder';


const CohortBuilderPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): JSX.Element => {

  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <CohortBuilder  />
    </NavPageLayout>
  );
};

export default CohortBuilderPage;
