import { GetServerSideProps } from 'next';
import { getNavPageLayoutPropsFromConfig } from '../../lib/common/staticProps';
import ContentSource from '../../lib/content';
import { type ExplorerPageProps  } from './types';
import { CohortBuilderConfiguration } from "../../features/CohortBuilder";
import { GEN3_COMMONS_NAME } from "@gen3/core";

export const ExplorerPageGetServerSideProps: GetServerSideProps<
  ExplorerPageProps
> = async (_context) => {
  const cohortBuilderProps: CohortBuilderConfiguration = await ContentSource.get(
    `config/${GEN3_COMMONS_NAME}/explorer.json`,
  );

  console.log("cohortBuilderProps", cohortBuilderProps);
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
      ...cohortBuilderProps,
    },
  };
};
