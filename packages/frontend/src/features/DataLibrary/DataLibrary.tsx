import { DataLibrarySelectionProvider } from './selection/SelectionContext';
import DataLibraryPanel from './DataLibraryPanel';

const DataLibrary = () => {
  return (
    <DataLibrarySelectionProvider>
      <DataLibraryPanel />
    </DataLibrarySelectionProvider>
  );
};

export default DataLibrary;
