import { DataLibrarySelectionProvider } from './selection/SelectionContext';
import DataLibraryLists from './DataLibraryLists';

const DataLibrary = () => {
  return (
    <DataLibrarySelectionProvider>
      <DataLibraryLists />;
    </DataLibrarySelectionProvider>
  );
};

export default DataLibrary;
