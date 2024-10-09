import { Button } from '@mantine/core';
import { useDataLibrary } from '@gen3/core';
import { data1 } from './utils';
import DataLibraryLists from './DataLibraryLists';

const DataLibraryPanel = () => {
  const { clearLibrary, setAllListsInDataLibrary } = useDataLibrary(false);
  return (
    <div className="flex flex-col w-full ml-2">
      <DataLibraryLists />
      <div className="flex space-x-4 m-2">
        <Button
          onClick={() => {
            setAllListsInDataLibrary(data1 as any);
          }}
        >
          Load Sample List
        </Button>
        <Button
          onClick={() => {
            clearLibrary();
          }}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default DataLibraryPanel;
