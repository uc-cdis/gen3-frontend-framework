import { openDB, IDBPDatabase } from 'idb';
import { isArray } from 'lodash';
import { JSONObject, isJSONObject } from '../../types';
import { type DataList } from './types';
import { nanoid } from '@reduxjs/toolkit';

const DATABASE_NAME = 'Gen3DataLibrary';
const STORE_NAME = 'DataLibraryLists';

interface ReturnStatus {
  error?: true;
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
export const deleteAll = async (): Promise<ReturnStatus> => {
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
export const deleteList = async (id: string): Promise<ReturnStatus> => {
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
    return { error: true };
  }
};

export const addList = async (body: JSONObject): Promise<ReturnStatus> => {
  const timestamp = new Date().toJSON();
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const id = nanoid(); // Create an id for the list
    tx.objectStore(STORE_NAME).put({
      id,
      version: 0,
      items: body,
      creator: '{{subject_id}}',
      authz: {
        version: 0,
        authz: [`/users/{{subject_id}}/user-library/lists/${id}`],
      },
      created_time: timestamp,
      updated_time: timestamp,
    });
    await tx.done;
    return { status: 'list added' };
  } catch (error: unknown) {
    return { error: true, status: `unable to add list` };
  }
};

export const updateList = async (
  id: string,
  body: JSONObject,
  override = true,
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
    const updated = {
      ...listData,
      version: listData?.version + 1 ?? 0,
      updated_time: timestamp,
      ...body,
    };

    store.put(updated);
    await tx.done;
    return { status: 'success' };
  } catch (error: any) {
    return { error: true, status: `unable to update list: ${id}` };
  }
};

export const addAllList = async (body: JSONObject): Promise<ReturnStatus> => {
  if (!Object.keys(body).includes('lists') || !isArray(body['lists'])) {
    return { error: true, status: 'lists not found in request' };
  }
  const timestamp = new Date().toJSON();
  const allLists = body['lists'].reduce((acc: JSONObject, x: unknown) => {
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
      tx.objectStore(STORE_NAME).put({ id, ...(list as Object) });
    }
    await tx.done;
    return { status: 'success' };
  } catch (error: unknown) {
    return { error: true, status: 'unable to add lists' };
  }
};

export const getList = async (id: string): Promise<ReturnStatus> => {
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
        return { error: true, status: `${id} does not exist` };
      }
    } else {
      const lists = (await store.getAll()) as Array<DataList>;
      return lists.reduce((acc: Record<string, DataList>, x: DataList) => {
        acc[x.id] = x;
        return acc;
      }, {});
    }
  } catch (error: unknown) {
    return { error: true };
  }
};

export const getLists = async () => {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const lists = await store.getAll();
    return { lists };
  } catch (error: unknown) {
    return { error: true };
  }
};
