// useDataLibrary.ts
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import {
  setLists, addList, updateList, deleteList,
  setLoading, setError, setSyncTime
} from './dataLibrarySlice';
import { createStorageService } from './dataLibraryStorage';
import { DataLibrary, Datalist } from '../types';
import { useCoreSelector } from '../../../hooks';
import { selectDataLibraryLists } from './dataLibrarySelectors';


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


interface UseDataLibraryOptions {
  requiresAPI: boolean;
}

export function useDataLibrary(
  options: UseDataLibraryOptions = { requiresAPI: false }
) {
  const dispatch = useDispatch();
  const lists = useSelector(state => state.dataLibrary.lists);
  const isLoading = useSelector(state => state.dataLibrary.isLoading);
  const error = useSelector(state => state.dataLibrary.error);
  const lastSyncTime = useSelector(state => state.dataLibrary.lastSyncTime);

  // Track login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Get the appropriate storage service
  const storageService = createStorageService(
    options.requiresAPI,
    isLoggedIn
  );

  // Initialize data from storage
  useEffect(() => {
    const loadData = async () => {
      dispatch(setLoading(true));

        const { lists, isError, status }  = await storageService.getLists();
        if (!isError && lists) {
          dispatch(setLists(lists));
          dispatch(setError(null));
        } else
        dispatch(setError(status || 'Failed add to library'));
        dispatch(setLoading(false));
    };

    loadData();
  }, [storageService, dispatch]);

  // Sync logic when login state changes
  useEffect(() => {
    if (options.requiresAPI && isLoggedIn) {
      // Sync localStorage with API
      // This is where you'd implement the sync logic
    }
  }, [isLoggedIn, options.requiresAPI]);

  const dataLists = useCoreSelector((state) => selectDataLibraryLists(state));

  // CRUD operations
  const addListToDataLibrary = useCallback(async (item: Partial<Datalist>) => {

    const adjustedData = {
      ...(item ?? {}),
      name: generateUniqueName(item?.name ?? 'List', dataLists),
    };
    dispatch(setLoading(true));

    const { lists, isError, status }  = await storageService.addList(adjustedData);
      dispatch(setError(null));
      return savedList;
    } catch (err) {
      dispatch(setError(err.message || 'Failed to add list'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [storageService, dispatch]);

  const updateListInDataLibrary = useCallback(async (id: string, listData: Datalist) => {
    dispatch(setLoading(true));
    try {
      const list = {
        ...listData,
        updatedTime: new Date().toISOString()
      };

      const updatedList = await storageService.updateList(list);
      dispatch(updateList(updatedList));
      dispatch(setError(null));
      return updatedList;
    } catch (err) {
      dispatch(setError(err.message || 'Failed to update list'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [storageService, dispatch]);

  const deleteListFromDataLibrary = useCallback(async (id: string) => {
    dispatch(setLoading(true));
    try {
      await storageService.deleteList(id);
      dispatch(deleteList(id));
      dispatch(setError(null));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to delete list'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [storageService, dispatch]);

  const clearLibrary = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      await storageService.clearLists();
      dispatch(setLists({}));
      dispatch(setError(null));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to clear library'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [storageService, dispatch]);

  // Login state management
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
    setLoginState
  };
}
