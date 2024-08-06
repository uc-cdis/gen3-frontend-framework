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
import { DataList, LoadAllListData } from './types';

export const useDataLibrary = (useApi: boolean) => {
  const [localLibrary, setLocalLibrary] = useState<Record<string, DataList>>(
    {},
  );

  const { data: apiLibrary, refetch: refetchLibraryFromApi } =
    useGetDataLibraryListsQuery(undefined, { skip: !useApi });
  const [addItemToLibraryApi] = useAddDataLibraryListMutation();
  const [addAllItemsToLibraryApi] = useAddAllDataLibraryListsMutation();
  const [deleteItemInLibraryApi] = useDeleteDataLibraryListMutation();
  const [updateItemInLibarayApi] = useUpdateDataLibraryListMutation();
  const [deleteAllApi] = useDeleteAllDataLibraryMutation();

  let hasError = false;

  const refetchLocalLists = async () => {
    const { isError, lists } = await getDataLibraryListIndexDB();
    setLocalLibrary(lists ?? {});
    hasError = isError === true;
  };

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!useApi) {
        const { isError, lists } = await getDataLibraryListIndexDB();
        if (!isError) setLocalLibrary(lists ?? {});
      }
    };

    fetchLibrary();
  }, [useApi]);

  const addListToDataLibrary = async (item: DataList) => {
    if (useApi) {
      await addItemToLibraryApi(item);
      refetchLibraryFromApi();
    } else {
      const { isError } = await addListToDataLibraryIndexDB(item);
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

  const updateListInDataLibrary = async (id: string, data: DataList) => {
    if (useApi) {
      await updateItemInLibarayApi({ id, list: data });
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

  const dataLibraryItems = useApi ? apiLibrary : { lists: localLibrary };

  return {
    dataLibraryItems,
    hasError,
    addListToDataLibrary,
    deleteListFromDataLibrary,
    clearLibrary,
    setAllListsInDataLibrary,
    updateListInDataLibrary,
  };
};

export default useDataLibrary;
