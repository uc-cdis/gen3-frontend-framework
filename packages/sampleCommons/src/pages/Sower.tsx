import React from 'react';
import { GetServerSideProps } from 'next';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend/features/Navigation';
import SowerJobListWrapper from '@gen3/frontend/features/Sower/SowerJobsWrapper';
import { getNavPageLayoutPropsFromConfig } from '@gen3/frontend/lib/common/staticProps';

const SowerPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Sower Page',
        content: 'Sower',
        key: 'gen3-sower-page',
      }}
    >
      <SowerJobListWrapper />
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SowerPage;
