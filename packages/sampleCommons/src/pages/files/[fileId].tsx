import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend/features/Navigation';
import { getNavPageLayoutPropsFromConfig } from '@gen3/frontend/lib/common/staticProps';
import { FileSummary } from '@gen3/frontend/features/FileSummary';

const FileSummaryPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  const file = router.asPath.split('/')[2]?.split('?')?.[0];
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Notebook Page',
        content: 'Jupyter Notebook',
        key: 'gen3-notebook-page',
      }}
    >
      <FileSummary guid={file} />
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

export default FileSummaryPage;
