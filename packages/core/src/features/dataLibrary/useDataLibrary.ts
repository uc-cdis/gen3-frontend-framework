import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import {
  DataLibrary,
  DataLibraryStoreMode,
  Datalist,
  DataListUpdate,
  DatasetOrCohort,
  LibraryListItemsGroupedByDataset,
} from './types';
import {
  convertDatasetOrCohortToLibraryListItemsAPI,
  flattenDataList,
} from './utils';
import { DataLibraryStorageService } from './storage/DataLibraryStorageService';
import { StorageOperationResults } from '../../types';

const EMPTY_LIST: Datalist = {
  items: {},
  version: 0,
  created_time: 'not_set',
  updated_time: 'not_set',
  name: '',
  id: '',
  authz: {
    version: -1,
    authz: [],
  },
};

interface UseDataLibraryOptions {
  storageMode: DataLibraryStoreMode;
}

interface UseDataLibraryResult {
  dataLibrary: DataLibrary; // the current contents of the DataLibrary
  isLoading: boolean; // Loading all lists
  isUpdating: string | null; // single list update will contain ListId if updating
  error: StorageOperationResults | null; // null if there is no error
  addListToDataLibrary: (
    items: DatasetOrCohort,
    name?: string,
  ) => Promise<StorageOperationResults>;
  updateListInDataLibrary: (
    payload: DataListUpdate,
  ) => Promise<StorageOperationResults>;
  deleteListFromDataLibrary: (id: string) => Promise<StorageOperationResults>;
  clearLibrary: () => Promise<StorageOperationResults>;
  setAllListsInDataLibrary: (
    data: Array<LibraryListItemsGroupedByDataset>,
  ) => Promise<StorageOperationResults>;
  setLoginState: (loggedIn: boolean) => void;
  getDatalist: (id: string) => Datalist;
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

  const handleErrorOrSetLists = useCallback(
    async (error: StorageOperationResults) => {
      if (error.isError) {
        setError(error);
      } else {
        const getListResults = await dataLibraryStoreAPI.getLists();
        if (getListResults.isError) {
          setError(getListResults);
        } else {
          setLists(getListResults.lists ?? {});
          setError(null);
        }
      }
    },
    [dataLibraryStoreAPI],
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
      } else setIsLoading(true);
      const operationResults = await operation();
      await handleErrorOrSetLists(operationResults);
      if (updateId) setIsUpdating(null);
      else setIsLoading(false);
      return operationResults;
    },
    [handleErrorOrSetLists],
  );

  // Lifecycle effects
  useEffect(() => {
    const initializeData = async () => {
      if (!initialLoadRef.current) {
        setError(null);
        setIsLoading(true);
        const results = await dataLibraryStoreAPI.getLists(); // get the initial lists
        if (results.isError) setError(results);
        else setLists(results.lists ?? {});
        setIsLoading(false);
        initialLoadRef.current = true;
      }
    };

    initializeData();
  }, [dataLibraryStoreAPI]);

  useEffect(() => {
    const handleLogin = async () => {
      // setIsLoading(true);
      // await dataLibraryStoreAPI.setUseAPI(options.requiresAPI && isLoggedIn);
      // setIsLoading(false);
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

      return await performLibraryOperation(() =>
        dataLibraryStoreAPI.addList(namedItems),
      );
    },
    [dataLibraryStoreAPI, generateUniqueName, performLibraryOperation],
  );

  const updateListInDataLibrary = useCallback(
    async (payload: DataListUpdate) => {
      const flattened = flattenDataList(payload);

      return await performLibraryOperation(
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
      return await performLibraryOperation(() =>
        dataLibraryStoreAPI.deleteList(id),
      );
    },
    [dataLibraryStoreAPI, performLibraryOperation],
  );

  const clearLibrary = useCallback(async () => {
    return await performLibraryOperation(() =>
      dataLibraryStoreAPI.clearLists(),
    );
  }, [dataLibraryStoreAPI, performLibraryOperation]);

  const setAllListsInDataLibrary = useCallback(
    async (data: Array<LibraryListItemsGroupedByDataset>) => {
      const flattenedLists = data.map((x) => flattenDataList(x));

      return await performLibraryOperation(() =>
        dataLibraryStoreAPI.setAllLists(flattenedLists),
      );
    },
    [dataLibraryStoreAPI, performLibraryOperation],
  );

  const getDatalist = useCallback(
    (id: string) => {
      if (id in lists) return lists[id];
      setError({
        isError: true,
        status: 404,
        message: `List not found. Returning empty list.`,
      });
      return EMPTY_LIST;
    },
    [lists],
  );

  const setLoginState = useCallback(
    (loggedIn: boolean) => setIsLoggedIn(loggedIn),
    [],
  );

  const results = useDeepCompareMemo(
    () => ({
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
    }),
    [
      addListToDataLibrary,
      clearLibrary,
      deleteListFromDataLibrary,
      error,
      getDatalist,
      isLoading,
      isUpdating,
      lists,
      setAllListsInDataLibrary,
      setLoginState,
      updateListInDataLibrary,
    ],
  );

  return results;
};

export default useDataLibrary;
