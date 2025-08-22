import 'server-only';

import {
  ContentSource,
  getNavPageLayoutPropsFromConfig,
  type QueryPageLayoutProps,
  type QueryProps,
} from '@gen3/frontend/server';
import { GEN3_COMMONS_NAME } from '@gen3/core/server';

export const getData = async (): Promise<QueryPageLayoutProps> => {
  const queryProps: QueryProps = await ContentSource.getContentDatabase().get(
    `${GEN3_COMMONS_NAME}/query.json`,
  );

  return {
    ...(await getNavPageLayoutPropsFromConfig()),
    queryProps: queryProps,
  };
};
