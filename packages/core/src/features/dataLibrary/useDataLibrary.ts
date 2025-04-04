import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DataLibrary,
  DataLibraryStoreMode,
  DataListUpdate,
  DatasetOrCohort,
  GroupedDataItems,
} from './types';
import { flattenDataList } from './utils';
import { CachedAPIService } from './storage/dataLibraryCachedAPI';
import { StorageError } from './storage/types';

interface UseDataLibraryOptions {
  requiresAPI: boolean;
  storageMode: DataLibraryStoreMode;
}

const useDataLibrary = (
  options: UseDataLibraryOptions = {
    requiresAPI: false,
    storageMode: DataLibraryStoreMode.ApiAndLocal,
  },
) => {
  // Track login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<StorageError | null>(null);
  const [lists, setLists] = useState<DataLibrary>({});

  // Ref to track if initial load has happened
  const initialLoadRef = useRef(false);

  // Create storage services (we'll need both for syncing)

  const dataLibraryStoreAPI = useRef(new CachedAPIService()).current;

  dataLibraryStoreAPI.setUseAPI(options.requiresAPI);

  const generateUniqueName = useCallback(
    (baseName: string = 'List') => {
      let uniqueName = baseName;
      let counter = 1;

      const existingNames = lists
        ? Object.values(lists).map((x) => x.name)
        : [];

      while (existingNames.includes(uniqueName)) {
        uniqueName = `${baseName} ${counter}`;
        counter++;
      }

      return uniqueName;
    },
    [lists],
  );

  const handleErrorOrSetLists = useCallback(
    async (isError?: boolean, status?: string) => {
      if (isError) {
        setError({ isError, status });
      } else {
        const {
          lists,
          isError: isCacheError,
          status: cacheStatus,
        } = await dataLibraryStoreAPI.getLists();
        // Set initial data from localStorage
        if (isCacheError) {
          setError({ isError: isCacheError, status: cacheStatus });
        } else {
          setLists(lists ?? {});
          setError(null);
        }
      }
    },
    [dataLibraryStoreAPI],
  );

  // Get the appropriate storage service based on current status;

  // Initialize data from storage on first load
  useEffect(() => {
    const loadData = async () => {
      if (!initialLoadRef.current) {
        setIsLoading(true);

        // Always start by loading from localStorage
        const { lists, isError, status } = await dataLibraryStoreAPI.getLists();

        if (isError) {
          setError({ isError, status });
        } else {
          // Set initial data from localStorage
          setLists(lists ?? {});
          setError(null);
        }
        setIsLoading(false);
      }
    };

    loadData();
  }, [dataLibraryStoreAPI]);

  // Sync logic when using API and logged in
  useEffect(() => {
    const handleLogin = async () => {
      setIsLoading(true);
      await dataLibraryStoreAPI.setUseAPI(options.requiresAPI && isLoggedIn);
      setIsLoading(false);
    };
    handleLogin();
  }, [dataLibraryStoreAPI, isLoggedIn, options.requiresAPI]);

  // CRUD operations
  const addListToDataLibrary = useCallback(
    async (items: DatasetOrCohort, name?: string) => {
      const namedItems = {
        items: items,
        name: generateUniqueName(name ?? 'List'),
      };

      console.log('addListToDataLibrary', namedItems);

      setIsLoading(true);
      const { isError, status } = await dataLibraryStoreAPI.addList(namedItems);
      await handleErrorOrSetLists(isError, status);
      setIsLoading(false);
    },
    [dataLibraryStoreAPI, generateUniqueName, handleErrorOrSetLists],
  );

  const updateListInDataLibrary = useCallback(
    async (payload: DataListUpdate) => {
      const flattend = flattenDataList(payload);

      setIsLoading(true);
      const { isError, status } = await dataLibraryStoreAPI.updateList({
        id: payload.id,
        name: payload.name,
        items: flattend.items,
      });
      await handleErrorOrSetLists(isError, status);
      setIsLoading(false);
    },
    [dataLibraryStoreAPI, handleErrorOrSetLists],
  );

  const deleteListFromDataLibrary = useCallback(
    async (id: string) => {
      setIsLoading(true);
      const { isError, status } = await dataLibraryStoreAPI.deleteList(id);
      await handleErrorOrSetLists(isError, status);
      setIsLoading(false);
    },
    [dataLibraryStoreAPI, handleErrorOrSetLists],
  );

  const clearLibrary = useCallback(async () => {
    setIsLoading(true);
    const { isError, status } = await dataLibraryStoreAPI.clearLists();
    await handleErrorOrSetLists(isError, status);
    setIsLoading(false);
  }, []);

  // Handle setting all lists at once (like when loading sample data)
  const setAllListsInDataLibrary = useCallback(
    async (data: Array<GroupedDataItems>) => {
      setIsLoading(true);
      const { isError, status } = await dataLibraryStoreAPI.setAllLists(data);
      await handleErrorOrSetLists(isError, status);
      setIsLoading(false);
    },
    [dataLibraryStoreAPI, handleErrorOrSetLists],
  );

  const setLoginState = useCallback((loggedIn: boolean) => {
    setIsLoggedIn(loggedIn);
  }, []);

  return {
    dataLibrary: lists,
    isLoading,
    error,
    addListToDataLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
    clearLibrary,
    setAllListsInDataLibrary,
    setLoginState,
    isLoggedIn,
  };
};

export default useDataLibrary;
