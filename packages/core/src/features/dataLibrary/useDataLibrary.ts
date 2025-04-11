import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DataLibrary,
  DataLibraryStoreMode,
  DataListUpdate,
  DatasetOrCohort,
  LibraryListItemsGroupedByDataset,
} from './types';
import {
  convertDatasetOrCohortToLibraryListItemsAPI,
  flattenDataList,
} from './utils';
import { StorageOperationResults } from './storage/types';
import { DataLibraryStorageService } from './storage/DataLibraryStorageService';

interface UseDataLibraryOptions {
  storageMode: DataLibraryStoreMode;
}

interface UseDataLibraryResult {
  dataLibrary: DataLibrary;
  isLoading: boolean;
  isUpdating: string | null;
  error: StorageOperationResults | null;
  addListToDataLibrary: (
    items: DatasetOrCohort,
    name?: string,
  ) => Promise<void>;
  updateListInDataLibrary: (payload: DataListUpdate) => Promise<void>;
  deleteListFromDataLibrary: (id: string) => Promise<void>;
  clearLibrary: () => Promise<void>;
  setAllListsInDataLibrary: (
    data: Array<LibraryListItemsGroupedByDataset>,
  ) => Promise<void>;
  setLoginState: (loggedIn: boolean) => void;
  getDatalist: (id: string) => any;
}

const DEFAULT_LIST_NAME = 'List';

const useDataLibrary = (
  options: UseDataLibraryOptions = {
    storageMode: DataLibraryStoreMode.ApiOnly,
  },
): UseDataLibraryResult => {
  // State management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<StorageOperationResults | null>(null);
  const [lists, setLists] = useState<DataLibrary>({});

  // Refs
  const initialLoadRef = useRef(false);

  // Services
  const dataLibraryStoreAPI = useRef(
    new DataLibraryStorageService(options.storageMode),
  ).current;

  // Helper functions
  const loadLists = useCallback(async () => {
    const error = await dataLibraryStoreAPI.getLists();
    if (error?.isError) {
      setError(error);
      return false;
    } else {
      setLists(lists ?? {});
      setError(null);
      return true;
    }
  }, [dataLibraryStoreAPI, lists]);

  const handleErrorOrSetLists = useCallback(
    async (error: StorageOperationResults) => {
      if (error?.isError) {
        setError(error);
      } else {
        await loadLists();
      }
    },
    [loadLists],
  );

  const generateUniqueName = useCallback(
    (baseName: string = DEFAULT_LIST_NAME) => {
      let uniqueName = baseName;
      let counter = 1;
      const existingNames = Object.values(lists).map((x) => x.name);

      while (existingNames.includes(uniqueName)) {
        uniqueName = `${baseName} ${counter}`;
        counter++;
      }

      return uniqueName;
    },
    [lists],
  );

  const performLibraryOperation = useCallback(
    async (
      operation: () => Promise<StorageOperationResults>,
      updateId?: string,
    ) => {
      setError(null);

      if (updateId) {
        setIsUpdating(updateId);
      } else {
        setIsLoading(true);
      }

      const operationError = await operation();
      await handleErrorOrSetLists(operationError);

      if (updateId) {
        setIsUpdating(null);
      } else {
        setIsLoading(false);
      }
    },
    [handleErrorOrSetLists],
  );

  // Lifecycle effects
  useEffect(() => {
    const initializeData = async () => {
      if (!initialLoadRef.current) {
        setError(null);
        setIsLoading(true);
        await loadLists();
        setIsLoading(false);
        initialLoadRef.current = true;
      }
    };

    initializeData();
  }, [loadLists]);

  useEffect(() => {
    const handleLogin = async () => {
      setIsLoading(true);
      // await dataLibraryStoreAPI.setUseAPI(options.requiresAPI && isLoggedIn);
      setIsLoading(false);
    };

    handleLogin();
  }, [dataLibraryStoreAPI, isLoggedIn]);

  // CRUD operations
  const addListToDataLibrary = useCallback(
    async (items: DatasetOrCohort, name?: string) => {
      const apiItems = convertDatasetOrCohortToLibraryListItemsAPI(items);
      const namedItems = {
        items: apiItems,
        name: generateUniqueName(name ?? DEFAULT_LIST_NAME),
      };

      await performLibraryOperation(() =>
        dataLibraryStoreAPI.addList(namedItems),
      );
    },
    [dataLibraryStoreAPI, generateUniqueName, performLibraryOperation],
  );

  const updateListInDataLibrary = useCallback(
    async (payload: DataListUpdate) => {
      const flattened = flattenDataList(payload);

      await performLibraryOperation(
        () =>
          dataLibraryStoreAPI.updateList(payload.id, {
            name: payload.name,
            items: flattened.items,
          }),
        payload.id,
      );
    },
    [dataLibraryStoreAPI, performLibraryOperation],
  );

  const deleteListFromDataLibrary = useCallback(
    async (id: string) => {
      await performLibraryOperation(() => dataLibraryStoreAPI.deleteList(id));
    },
    [dataLibraryStoreAPI, performLibraryOperation],
  );

  const clearLibrary = useCallback(async () => {
    await performLibraryOperation(() => dataLibraryStoreAPI.clearLists());
  }, [dataLibraryStoreAPI, performLibraryOperation]);

  const setAllListsInDataLibrary = useCallback(
    async (data: Array<LibraryListItemsGroupedByDataset>) => {
      const flattenedLists = data.map((x) => flattenDataList(x));

      await performLibraryOperation(() =>
        dataLibraryStoreAPI.setAllLists(flattenedLists),
      );
    },
    [dataLibraryStoreAPI, performLibraryOperation],
  );

  const getDatalist = useCallback((id: string) => lists[id], [lists]);

  const setLoginState = useCallback(
    (loggedIn: boolean) => setIsLoggedIn(loggedIn),
    [],
  );

  return {
    dataLibrary: lists,
    isLoading,
    isUpdating,
    error,
    addListToDataLibrary,
    updateListInDataLibrary,
    deleteListFromDataLibrary,
    clearLibrary,
    setAllListsInDataLibrary,
    setLoginState,
    getDatalist,
  };
};

export default useDataLibrary;
