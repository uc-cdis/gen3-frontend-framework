import { useEffect, useState } from 'react';
import {
  useGetDataLibraryListsQuery,
  useAddDataLibraryListMutation,
  useDeleteDataLibraryListMutation,
  useAddAllDataLibraryListsMutation,
  useUpdateDataLibraryListMutation,
  useDeleteAllDataLibraryMutation,
} from './dataLibraryApi';

import {
  getDataLibraryListIndexDB,
  addListToDataLibraryIndexDB,
  deleteListIndexDB,
  addAllListIndexDB,
  updateListIndexDB,
  deleteAll,
} from './dataLibraryIndexDB';
import { DataLibrary, Datalist, LoadAllListData } from './types';
import { flattenDataList } from './utils';

const generateUniqueName = (
  baseName: string = 'List',
  dataLibrary: DataLibrary,
) => {
  let uniqueName = baseName;
  let counter = 1;

  const existingNames = dataLibrary
    ? Object.values(dataLibrary).map((x) => x.name)
    : [];

  while (existingNames.includes(uniqueName)) {
    uniqueName = `${baseName} ${counter}`;
    counter++;
  }

  return uniqueName;
};

export const useDataLibrary = (useApi: boolean) => {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [library, setLibrary] = useState<DataLibrary>({});

  const handleAPIMutation = async <T>(
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

  const {
    data: apiLibrary,
    refetch: refetchLibraryFromApi,
    error: errorGetDatalistAPI,
    isError: isErrorGetDatalistAPI,
    isFetching: isFetchingDataListFromAPI,
  } = useGetDataLibraryListsQuery(undefined, { skip: !useApi });

  const [addItemToLibraryApi] = useAddDataLibraryListMutation();
  const [addAllItemsToLibraryApi] = useAddAllDataLibraryListsMutation();
  const [
    deleteItemInLibraryApi,
    { isLoading: isLoadingDeleteListAPI, isError: isErrorDeleteListAPI },
  ] = useDeleteDataLibraryListMutation();
  const [
    updateItemInLibraryApi,
    { isLoading: isLoadingUpdateItemAPI, isError: isErrorUpdateItemAPI },
  ] = useUpdateDataLibraryListMutation();
  const [deleteAllApi] = useDeleteAllDataLibraryMutation();

  const refetchLocalLists = async () => {
    const { isError, lists } = await getDataLibraryListIndexDB();
    setLibrary(lists ?? {});
    hasError = isError === true;
  };

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!useApi) {
        const { isError, lists } = await getDataLibraryListIndexDB();
        if (!isError) {
          setLibrary(lists ?? {});
        }
      }
    };

    fetchLibrary();
  }, [useApi]);

  const addListToDataLibrary = async (item?: Partial<Datalist>) => {
    const adjustedData = {
      ...(item ?? {}),
      name: generateUniqueName(item?.name ?? 'List', dataLibrary),
    };

    if (useApi) {
      await addItemToLibraryApi(adjustedData);
      refetchLibraryFromApi();
    } else {
      const { isError } = await addListToDataLibraryIndexDB(adjustedData);
      await refetchLocalLists();
      hasError = isError === true;
    }
  };

  const deleteListFromDataLibrary = async (id: string) => {
    if (useApi) {
      await deleteItemInLibraryApi(id);
      refetchLibraryFromApi();
    } else {
      const { isError } = await deleteListIndexDB(id);
      refetchLocalLists();
      hasError = isError === true;
    }
  };

  const setAllListsInDataLibrary = async (data: LoadAllListData) => {
    if (useApi) {
      await addAllItemsToLibraryApi(data);
      refetchLibraryFromApi();
    } else {
      const { isError } = await addAllListIndexDB(data);
      refetchLocalLists();
      hasError = isError === true;
    }
  };

  const updateListInDataLibrary = async (id: string, data: Datalist) => {
    const flattend = flattenDataList(data);
    if (useApi) {
      await updateItemInLibraryApi({ id, list: flattend });
      refetchLibraryFromApi();
    } else {
      const { isError } = await updateListIndexDB(id, data);
      refetchLocalLists();
      hasError = isError === true;
    }
  };

  const clearLibrary = async () => {
    if (useApi) {
      await deleteAllApi();
      refetchLibraryFromApi();
    } else {
      const { isError } = await deleteAll();
      refetchLocalLists();
      hasError = isError === true;
    }
  };

  const dataLibrary = useApi ? (apiLibrary ? apiLibrary.lists : {}) : library;

  return {
    dataLibrary,
    isError: hasError,
    isLoading,
    error: errorData,
    addListToDataLibrary,
    deleteListFromDataLibrary,
    clearLibrary,
    setAllListsInDataLibrary,
    updateListInDataLibrary,
  };
};

export default useDataLibrary;
