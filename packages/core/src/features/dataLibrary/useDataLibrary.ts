import { useCallback, useEffect, useRef, useState } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import type {
  DataLibrary,
  Datalist,
  DataListUpdate,
  DatasetOrCohort,
  LibraryListItemsGroupedByDataset,
} from './types';
import { DataLibraryStoreMode } from './types';
import {
  convertDatasetOrCohortToLibraryListItemsAPI,
  flattenDataList,
} from './utils';
import { DataLibraryStorageService } from './storage/DataLibraryStorageService';
import type { StorageOperationResults } from '../../types';

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
  /**
   * When false, the lists are not fetched. Use it to wait for the user session to
   * resolve so an early request doesn't 401 before the session is established.
   * The lists are fetched once it becomes true. Defaults to true.
   */
  enabled?: boolean;
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
  getDatalist: (id: string) => Datalist;
}

const DEFAULT_LIST_NAME = 'List';

const useDataLibrary = (
  options: UseDataLibraryOptions = {
    storageMode: DataLibraryStoreMode.ApiOnly,
  },
): UseDataLibraryResult => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<StorageOperationResults | null>(null);
  const [lists, setLists] = useState<DataLibrary>({});
  const [hasFetched, setHasFetched] = useState(false);

  // Refs
  const hasInitializedRef = useRef(false);

  // Services
  const storage = useRef(
    new DataLibraryStorageService(options.storageMode),
  ).current;

  const refreshLists = useCallback(async () => {
    const results = await storage.getLists();
    if (results.isError) {
      setError(results);
      return results;
    }

    setLists(results.lists ?? {});
    setError(null);
    return results;
  }, [storage]);

  const applyOperationResult = useCallback(
    async (result: StorageOperationResults) => {
      if (result.isError) {
        setError(result);
        return;
      }
      await refreshLists();
    },
    [refreshLists],
  );

  const runOperation = useCallback(
    async (
      operation: () => Promise<StorageOperationResults>,
      updatingId?: string,
    ) => {
      setError(null);

      if (updatingId) setIsUpdating(updatingId);
      else setIsLoading(true);

      const result = await operation();
      await applyOperationResult(result);

      if (updatingId) setIsUpdating(null);
      else setIsLoading(false);

      return result;
    },
    [applyOperationResult],
  );

  const createUniqueListName = useCallback(
    (preferredName: string = DEFAULT_LIST_NAME) => {
      const existingNames = new Set(Object.values(lists).map((x) => x.name));

      if (!existingNames.has(preferredName)) return preferredName;

      let counter = 1;
      let candidate = `${preferredName} ${counter}`;
      while (existingNames.has(candidate)) {
        counter += 1;
        candidate = `${preferredName} ${counter}`;
      }
      return candidate;
    },
    [lists],
  );

  const enabled = options.enabled ?? true;
  // Report loading from the moment fetching is enabled, not only once the effect
  // below has run, so callers never render an empty library before the first fetch.
  const isLoadingLists = isLoading || (enabled && !hasFetched);

  // Lifecycle effects
  useEffect(() => {
    const initialize = async () => {
      if (!enabled || hasInitializedRef.current) return;

      setError(null);
      setIsLoading(true);

      await refreshLists();

      setIsLoading(false);
      setHasFetched(true);
      hasInitializedRef.current = true;
    };

    void initialize();
  }, [enabled, refreshLists]);

  // CRUD operations
  const addListToDataLibrary = useCallback(
    async (items: DatasetOrCohort, name?: string) => {
      const apiItems = convertDatasetOrCohortToLibraryListItemsAPI(items);
      const payload = {
        items: apiItems,
        name: createUniqueListName(name ?? DEFAULT_LIST_NAME),
      };

      return runOperation(() => storage.addList(payload));
    },
    [createUniqueListName, runOperation, storage],
  );

  const updateListInDataLibrary = useCallback(
    async (payload: DataListUpdate) => {
      const flattened = flattenDataList(payload);

      return runOperation(
        () =>
          storage.updateList(payload.id, {
            name: payload.name,
            items: flattened.items,
          }),
        payload.id,
      );
    },
    [runOperation, storage],
  );

  const deleteListFromDataLibrary = useCallback(
    async (id: string) => runOperation(() => storage.deleteList(id)),
    [runOperation, storage],
  );

  const clearLibrary = useCallback(
    async () => runOperation(() => storage.clearLists()),
    [runOperation, storage],
  );

  const setAllListsInDataLibrary = useCallback(
    async (data: Array<LibraryListItemsGroupedByDataset>) => {
      const flattenedLists = data.map(flattenDataList);
      return runOperation(() => storage.setAllLists(flattenedLists));
    },
    [runOperation, storage],
  );

  const getDatalist = useCallback(
    (id: string) => {
      const list = lists[id];
      if (list) return list;

      setError({
        isError: true,
        status: 404,
        message: 'List not found. Returning empty list.',
      });
      return EMPTY_LIST;
    },
    [lists],
  );

  const results = useDeepCompareMemo(
    () => ({
      dataLibrary: lists,
      isLoading: isLoadingLists,
      isUpdating,
      error,
      addListToDataLibrary,
      updateListInDataLibrary,
      deleteListFromDataLibrary,
      clearLibrary,
      setAllListsInDataLibrary,
      getDatalist,
    }),
    [
      addListToDataLibrary,
      clearLibrary,
      deleteListFromDataLibrary,
      error,
      getDatalist,
      isLoadingLists,
      isUpdating,
      lists,
      setAllListsInDataLibrary,
      updateListInDataLibrary,
    ],
  );

  return results;
};

export default useDataLibrary;
