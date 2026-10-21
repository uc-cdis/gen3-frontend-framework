import type { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import type { NavPageLayoutProps } from '../../features/Navigation';

export const FHIRQueryPageGetServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        headerProps: {
          topBar: {
            items: [],
          },
          navigation: {},
        },
        footerProps: {},
        headerMetadata: {
          title: 'Gen3 FHIR Query',
          content: 'FHIR Query',
          key: 'gen3-fhir-query-page',
        },
      },
    };
  }
};
