import { Text } from '@mantine/core';
import { useGetDataLibraryListsQuery } from '@gen3/core';

const DataLibraryPanel = () => {
  const data = useGetDataLibraryListsQuery();
  console.log('data', data);
  return (
    <div>
      <Text size="lg">Coming Soon</Text>
    </div>
  );
};

export default DataLibraryPanel;
