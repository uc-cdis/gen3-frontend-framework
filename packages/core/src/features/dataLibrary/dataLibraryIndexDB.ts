import { isArray } from 'lodash';
import { isJSONObject, JSONObject } from '../../types';
import { type Datalist, LoadAllListData } from './types';
import { nanoid } from '@reduxjs/toolkit';
import { IDBPDatabase, openDB } from 'idb';
import { getTimestamp } from './utils';

const DATABASE_NAME = 'Gen3DataLibrary';
const STORE_NAME = 'DataLibraryLists';

interface ReturnStatus {
  isError?: true;
  status?: string;
  lists?: Record<string, Datalist>;
}

const getDb = async (): Promise<IDBPDatabase> => {
  return openDB(DATABASE_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

/**
 * Deletes all lists in the database.
 *
 * @async
 * @returns {Promise<ReturnStatus>} A promise that resolves to the status of the operation.
 */
export const deleteAllIndexDB = async (): Promise<ReturnStatus> => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  await tx.done;
  return { status: 'all lists deleted' };
};

/**
 * Deletes a list from the database.
 *
 * @async
 * @param {string} id - The unique identifier of the list to delete.
 * @returns {Promise<ReturnStatus>} The status of the deletion operation.
 * @throws {Error} If the list with the provided id does not exist.
 */
export const deleteListIndexDB = async (id: string): Promise<ReturnStatus> => {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = await store.get(id);

    if (!item) {
      throw new Error(`List ${id} does not exist`);
    }

    store.delete(id);
    await tx.done;
    return { status: `${id} deleted` };
  } catch (error: unknown) {
    return { isError: true };
  }
};

export const deleteAll = async () => {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    await tx.done;
    return { status: 'list added' };
  } catch (error: unknown) {
    return { isError: true, status: `unable to clear library` };
  }
};

export const addListToDataLibraryIndexDB = async (
  body?: Partial<Datalist>,
): Promise<ReturnStatus> => {
  const timestamp = getTimestamp();
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const id = nanoid(); // Create an id for the list
    tx.objectStore(STORE_NAME).put({
      id,
      version: 0,
      items: body?.items ?? {},
      creator: '{{subject_id}}',
      authz: {
        version: 0,
        authz: [`/users/{{subject_id}}/user-library/lists/${id}`],
      },
      name: body?.name ?? 'New List',
      created_time: timestamp,
      updated_time: timestamp,
    });
    await tx.done;
    return { status: 'list added' };
  } catch (error: unknown) {
    return { isError: true, status: `unable to add list` };
  }
};

export const updateListIndexDB = async (
  id: string,
  list: Datalist,
  //  override = true,
): Promise<ReturnStatus> => {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const listData = await store.get(id);

    if (!listData) {
      throw new Error(`List ${id} does not exist`);
    }

    const timestamp = getTimestamp();
    const version = listData.version ? listData.version + 1 : 0;
    const updated = {
      ...listData,
      ...list,
      version: version,
      updated_time: timestamp,
      created_time: listData.created_time,
    };

    store.put(updated);
    await tx.done;
    return { status: 'success' };
  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      isError: true,
      status: `Unable to update list: ${id}. Error: ${errorMessage}`,
    };
  }
};

export const addAllListIndexDB = async (
  data: LoadAllListData,
): Promise<ReturnStatus> => {
  if (!Object.keys(data).includes('lists') || !isArray(data['lists'])) {
    return { isError: true, status: 'lists not found in request' };
  }
  const timestamp = getTimestamp();
  const allLists = data['lists'].reduce((acc: JSONObject, x: unknown) => {
    if (!isJSONObject(x)) return acc;

    const id = nanoid(10);
    acc[id] = {
      ...(x as JSONObject),
      version: 0,
      created_time: timestamp,
      updated_time: timestamp,
      creator: '{{subject_id}}',
      authz: {
        version: 0,
        authz: [`/users/{{subject_id}}/user-library/lists/${id}`],
      },
    };
    return acc;
  }, {} as JSONObject);

  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const [id, list] of Object.entries(allLists)) {
      tx.objectStore(STORE_NAME).put({ id, ...(list as object) });
    }
    await tx.done;
    return { status: 'success' };
  } catch (error: unknown) {
    return { isError: true, status: 'unable to add lists' };
  }
};

interface DataLibraryFromStore
  extends Omit<Datalist, 'createdTime' | 'updatedTime'> {
  created_time: string;
  updated_time: string;
}

export const getDataLibraryListIndexDB = async (
  id?: string,
): Promise<ReturnStatus> => {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    if (id !== undefined) {
      const lists = (await store.get(id)) as Array<DataLibraryFromStore>;
      if (lists) {
        return {
          status: 'success',
          lists: lists.reduce(
            (acc: Record<string, Datalist>, x: DataLibraryFromStore) => {
              acc[x.id] = {
                id: x.id,
                version: x.version,
                name: x.name,
                authz: x.authz,
                createdTime: x.created_time,
                updatedTime: x.updated_time,
                items: x.items,
              };
              return acc;
            },
            {},
          ),
        };
      } else {
        return { isError: true, status: `${id} does not exist` };
      }
    } else {
      const lists = (await store.getAll()) as Array<DataLibraryFromStore>;
      return {
        status: 'success',
        lists: lists.reduce(
          (acc: Record<string, Datalist>, x: DataLibraryFromStore) => {
            acc[x.id] = {
              id: x.id,
              version: x.version,
              name: x.name,
              authz: x.authz,
              createdTime: x.created_time,
              updatedTime: x.updated_time,
              items: x.items,
            };
            return acc;
          },
          {},
        ),
      };
    }
  } catch (error: unknown) {
    return { isError: true };
  }
};
