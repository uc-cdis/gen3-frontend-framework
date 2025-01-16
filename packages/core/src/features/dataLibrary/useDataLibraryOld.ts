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

export const useDataLibrary = (useApi: boolean) => {
  const [localLibrary, setLocalLibrary] = useState<DataLibrary>({});

  const {
    data: apiLibrary,
    refetch: refetchLibraryFromApi,
    error: apiError,
    isError: isAPIListError,
    isLoading: isAPIListLoading,
  } = useGetDataLibraryListsQuery(undefined, { skip: !useApi });
  const [addItemToLibraryApi] = useAddDataLibraryListMutation();
  const [addAllItemsToLibraryApi] = useAddAllDataLibraryListsMutation();
  const [deleteItemInLibraryApi] = useDeleteDataLibraryListMutation();
  const [updateItemInLibraryApi, { isLoading: isUpdatingLoading }] =
    useUpdateDataLibraryListMutation();
  const [deleteAllApi] = useDeleteAllDataLibraryMutation();

  let hasError = false;
  let errorData = null;
  let isLoading = false;

  // TODO: Add error message from indexedDB
  if (useApi && isAPIListError) {
    hasError = true;
    errorData = apiError;
  }

  if (useApi && (isUpdatingLoading || isAPIListLoading)) {
    isLoading = true;
  }

  const generateUniqueName = (baseName: string = 'List') => {
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

  const refetchLocalLists = async () => {
    const { isError, lists } = await getDataLibraryListIndexDB();
    setLocalLibrary(lists ?? {});
    hasError = isError === true;
  };

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!useApi) {
        const { isError, lists } = await getDataLibraryListIndexDB();
        if (!isError) {
          setLocalLibrary(lists ?? {});
        }
      }
    };

    fetchLibrary();
  }, [useApi]);

  const addListToDataLibrary = async (item?: Partial<Datalist>) => {
    const adjustedData = {
      ...(item ?? {}),
      name: generateUniqueName(item?.name ?? 'List'),
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

  const dataLibrary = useApi
    ? apiLibrary
      ? apiLibrary.lists
      : {}
    : localLibrary;

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
