import { useCallback, useEffect, useState, useMemo } from 'react';
import { DataLibrary, Datalist, LoadAllListData } from '../types';
import { IDataLibraryAdapter } from '../adapters/types';
import { APIDataLibraryAdapter } from '../adapters/apiAdapter';
import { IndexDBDataLibraryAdapter } from '../adapters/indexdbAdapter';

export const useDataLibrary = (useApi: boolean) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [library, setLibrary] = useState<DataLibrary>({});

  // Create adapter based on mode
  const adapter = useMemo<IDataLibraryAdapter>(() => {
    return useApi
      ? new APIDataLibraryAdapter()
      : new IndexDBDataLibraryAdapter();
  }, [useApi]);

  // Utility function for error handling
  const handleOperation = async <T>(
    operation: () => Promise<T>,
  ): Promise<T | void> => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Unknown error occurred'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    handleOperation(async () => {
      const data = await adapter.getLists();
      setLibrary(data);
    });
  }, [adapter]);

  const generateUniqueName = useCallback(
    (baseName: string = 'List'): string => {
      let uniqueName = baseName;
      let counter = 1;
      const existingNames = Object.values(library).map((x) => x.name);

      while (existingNames.includes(uniqueName)) {
        uniqueName = `${baseName} ${counter}`;
        counter++;
      }
      return uniqueName;
    },
    [library],
  );

  return {
    dataLibrary: library,
    isError: !!error,
    error,
    isLoading,

    addListToDataLibrary: async (item?: Partial<Datalist>) => {
      const adjustedData = {
        ...(item ?? {}),
        name: generateUniqueName(item?.name ?? 'List'),
      };
      await handleOperation(async () => {
        await adapter.addList(adjustedData);
        const newLibrary = await adapter.getLists();
        setLibrary(newLibrary);
      });
    },

    deleteListFromDataLibrary: async (id: string) => {
      await handleOperation(async () => {
        await adapter.deleteList(id);
        const newLibrary = await adapter.getLists();
        setLibrary(newLibrary);
      });
    },

    updateListInDataLibrary: async (id: string, data: Datalist) => {
      await handleOperation(async () => {
        await adapter.updateList(id, data);
        const newLibrary = await adapter.getLists();
        setLibrary(newLibrary);
      });
    },

    setAllListsInDataLibrary: async (data: LoadAllListData) => {
      await handleOperation(async () => {
        await adapter.setAllLists(data);
        const newLibrary = await adapter.getLists();
        setLibrary(newLibrary);
      });
    },

    clearLibrary: async () => {
      await handleOperation(async () => {
        await adapter.deleteAll();
        const newLibrary = await adapter.getLists();
        setLibrary(newLibrary);
      });
    },
  };
};

export default useDataLibrary;
