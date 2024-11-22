import { DataLibrarySelectionProvider } from './selection/SelectionContext';
import DataLibraryLists from './DataLibraryLists';
import { DataLibraryConfig } from './types';

const DataLibrary = (config: DataLibraryConfig) => {
  console.log('config', config);
  return (
    <DataLibrarySelectionProvider>
      <DataLibraryLists {...config} />;
    </DataLibrarySelectionProvider>
  );
};

export default DataLibrary;
