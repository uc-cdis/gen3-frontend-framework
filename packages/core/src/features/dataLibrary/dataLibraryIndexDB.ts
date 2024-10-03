import { isArray } from 'lodash';
import { JSONObject, isJSONObject } from '../../types';
import { type DataList, LoadAllListData } from './types';
import { nanoid } from '@reduxjs/toolkit';
import { openDB, IDBPDatabase } from 'idb';

const DATABASE_NAME = 'Gen3DataLibrary';
const STORE_NAME = 'DataLibraryLists';

interface ReturnStatus {
  isError?: true;
  status?: string;
  lists?: Record<string, DataList>;
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
  body?: Partial<DataList>,
): Promise<ReturnStatus> => {
  const timestamp = new Date().toJSON();
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
  list: DataList,
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

    const timestamp = new Date().toJSON();
    const version = listData.version ? listData.version + 1 : 0;
    const updated = {
      ...listData,
      ...list,
      version: version,
      updated_time: timestamp,
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
  const timestamp = new Date().toJSON();
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

export const getDataLibraryListIndexDB = async (
  id?: string,
): Promise<ReturnStatus> => {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    if (id !== undefined) {
      const lists = await store.get(id);
      if (lists) {
        return {
          status: 'success',
          lists: {
            [id]: lists,
          },
        };
      } else {
        return { isError: true, status: `${id} does not exist` };
      }
    } else {
      const lists = (await store.getAll()) as Array<DataList>;
      return {
        status: 'success',
        lists: lists.reduce((acc: Record<string, DataList>, x: DataList) => {
          acc[x.id] = x;
          return acc;
        }, {}),
      };
    }
  } catch (error: unknown) {
    return { isError: true };
  }
};
