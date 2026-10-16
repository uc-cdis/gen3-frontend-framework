import React, { type ReactElement } from 'react';
import { NavPageLayout } from '../../features/Navigation';
import type { NavPageLayoutProps } from '../../features/Navigation';
import { FhirQuery } from '../../features/FHIR';
import ProtectedContent from '../../components/Protected/ProtectedContent';

const FHIRQueryPage = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps): ReactElement => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 FHIR Query',
        content: 'FHIR Query',
        key: 'gen3-fhir-query-page',
      }}
    >
      <ProtectedContent>
        <div className="p-5 w-full">
          <FhirQuery />
        </div>
      </ProtectedContent>
    </NavPageLayout>
  );
};

export default FHIRQueryPage;
