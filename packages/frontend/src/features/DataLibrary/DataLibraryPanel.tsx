import { Text } from '@mantine/core';
import { useGetDataLibraryListsQuery } from '@gen3/core';

const DataLibraryPanel = () => {
  const data = useGetDataLibraryListsQuery();
  return (
    <div>
      <Text size="lg">Coming Soon</Text>
    </div>
  );
};

export default DataLibraryPanel;
