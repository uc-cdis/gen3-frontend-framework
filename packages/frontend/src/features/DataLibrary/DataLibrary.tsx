import { DataLibrarySelectionProvider } from './tables/SelectionContext';
import DataLibraryPanel from './DataLibraryPanel';

const DataLibrary = () => {
  return (
    <DataLibrarySelectionProvider>
      <DataLibraryPanel />
    </DataLibrarySelectionProvider>
  );
};

export default DataLibrary;
