import React, { useEffect, useMemo } from 'react';
import { LoadingOverlay, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  buildNestedFilterForOperation,
  useGetRawDataAndTotalCountsQuery,
} from '@gen3/core';
import ErrorCard from '../../../../components/MessageCards/ErrorCard';
import { TableDetailsPanelProps } from './types';

import { JSONPath } from 'jsonpath-plus';
import { isArray } from 'lodash';
import { useStudyContext } from '../../../Study/StudyProvider';
import { SinglePageStudyDetailsPanel } from '../../../Study';

interface QueryResponse {
  data?: Record<string, Array<any>>;
}

function isQueryResponse(obj: any): obj is QueryResponse {
  // Considering that the data property can be optional
  return (
    typeof obj === 'object' &&
    (obj.data === undefined || typeof obj.data === 'object')
  );
}

const ExtractData = (
  data: QueryResponse,
  index: string,
  path?: string,
): Record<string, any> => {
  if (data === undefined || data === null) return {};
  if (data.data === undefined || data.data === null) return {};

  if (!isArray(data.data[index])) return {};

  let rowData = data.data[index][0];
  if (path) {
    const tmp = JSONPath({ path: path, json: data.data[index][0] });
    if (!isArray(tmp)) {
      return {};
    }
    if (tmp.length > 0) {
      rowData = tmp[0];
    }
  }

  return rowData;
};

export const QueryRowDetailsPanel = ({
  id,
  index,
  tableConfig,
  accessibility,
}: TableDetailsPanelProps) => {
  //const [queryGuppy, { data, isLoading, isError }] = useLazyGeneralGQLQuery();
  const idField = tableConfig.detailsConfig?.idField;
  const simpleDetailsView = tableConfig.detailsConfig?.simpleDetailsView;
  const { setStudyDetails } = useStudyContext();

  const { data, isError, isFetching } = useGetRawDataAndTotalCountsQuery(
    {
      type: index,
      fields: tableConfig.fields as string[],
      filters: {
        mode: 'and',
        root: {
          [idField as string]: buildNestedFilterForOperation(
            idField as string,
            {
              operator: '=',
              field: idField as string,
              operand: id as string,
            },
          ),
        },
      },
      offset: 0,
      size: 1,
      accessibility: accessibility,
    },
    {
      skip: !idField || !id, // if no ide do not send request
    },
  );

  const queryData = useMemo(
    () =>
      isQueryResponse(data)
        ? ExtractData(data, index, tableConfig?.detailsConfig?.dataPath)
        : {},
    [data, index, tableConfig?.detailsConfig?.dataPath],
  );

  useEffect(() => {
    setStudyDetails(queryData);
  }, [queryData, setStudyDetails]);

  if (!idField) {
    return (
      <ErrorCard message={'idField not configure in Tables Details Config'} />
    );
  }

  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }

  // Inital attempt at using Study Details component

  return (
    <Stack>
      <LoadingOverlay visible={isFetching} />
      {simpleDetailsView ? (
        <SinglePageStudyDetailsPanel
          data={queryData ?? {}}
          studyConfig={simpleDetailsView}
        />
      ) : (
        <div>Study Details Panel not configured</div>
      )}
    </Stack>
  );
};

export default QueryRowDetailsPanel;
