import { LoadingOverlay, Stack, Table, Text } from '@mantine/core';
import {
  JSONObject,
  useGeneralGQLQuery,
  useLazyGeneralGQLQuery,
} from '@gen3/core';
import ErrorCard from '../../../../components/ErrorCard';
import { TableDetailsPanelProps } from './types';

export const TableDetailsPanel = ({
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

  if (!idField || idField === null) {
    return (
      <ErrorCard message={'idField not configure in Tables Details Config'} />
    );
  }

  if (isError) {
    return <ErrorCard message={'Error occurred while fetching data'} />;
  }
  console.log('data', data && (data as JSONObject)[index]);

  const rows = Object.entries(data?.[index] ?? {}).map(([field, value]) => (
    <tr key={field}>
      <td>
        <Text weight="bold">{field}</Text>
      </td>
      <td>
        <Text>{value ? (value as string) : ''}</Text>
      </td>
    </tr>
  ));
  return (
    <Stack>
      <LoadingOverlay visible={isLoading} />
      <Text color="primary.4">Results for {id}</Text>
      <Table>
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

export default TableDetailsPanel;
