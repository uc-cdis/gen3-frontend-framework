import { LoadingOverlay, Stack, Table, Text } from '@mantine/core';
import { useGeneralGQLQuery } from '@gen3/core';
import ErrorCard from '../../../../components/MessageCards/ErrorCard';
import { TableDetailsPanelProps } from './types';

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
): Record<string, any> => {
  if (data === undefined || data === null) return {};
  if (data.data === undefined || data.data === null) return {};

  return Array.isArray(data.data[index]) && data.data[index].length > 0
    ? data.data[index][0]
    : {};
};

export const QueryRowDetailsPanel = ({
  id,
  index,
  tableConfig,
}: TableDetailsPanelProps) => {
  //const [queryGuppy, { data, isLoading, isError }] = useLazyGeneralGQLQuery();
  const idField = tableConfig.detailsConfig?.idField;
  const { data, isLoading, isError } = useGeneralGQLQuery({
    query: `query ($filter: JSON) {
        ${index} (filter: $filter,  accessibility: all) {
        ${tableConfig.fields}
        }
      }`,
    variables: {
      filter: {
        AND: [
          {
            IN: {
              [idField ?? 0]: [id],
            },
          },
        ],
      },
    },
  });

  if (!idField) {
    return (
      <ErrorCard message={'idField not configure in Tables Details Config'} />
    );
  }

  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }

  const queryData = isQueryResponse(data) ? ExtractData(data, index) : {};

  const rows = Object.entries(queryData).map(([field, value]) => (
    <tr key={field}>
      <td>
        <Text fw="bold">{field}</Text>
      </td>
      <td>
        <Text>{value ? (value as string) : ''}</Text>
      </td>
    </tr>
  ));
  return (
    <Stack>
      <LoadingOverlay visible={isLoading} />
      <Text c="primary.4">Results for {id}</Text>
      <Table withTableBorder withColumnBorders>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </Stack>
  );
};

export default QueryRowDetailsPanel;
