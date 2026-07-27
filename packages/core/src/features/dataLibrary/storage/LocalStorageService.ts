import { IDBPDatabase, openDB } from 'idb';
import { ReturnStatus, StorageService } from './types';
import {
  DataLibraryAPI,
  DatalistAPI,
  DatalistAsAPIItems,
  DatalistWithIdAPI,
  isDatalistAPI,
} from '../types';
import { BuildLists } from '../utils';
import { isJSONObject, JSONObject } from '../../../types';
import { nanoid } from '@reduxjs/toolkit';
import { getTimestamp } from '../../../utils';

const DATABASE_NAME = 'Gen3DataLibrary';
const STORE_NAME = 'DataLibraryLists';

export class LocalStorageService implements StorageService {
  private getDb(): Promise<IDBPDatabase> {
    return openDB(DATABASE_NAME, 1, {
      // TODO add more complete upgrade
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  setAllLists = async (
    data: Array<DatalistAsAPIItems>,
  ): Promise<ReturnStatus> => {
    const timestamp = getTimestamp();
    const allLists = data.reduce((acc: JSONObject, x: unknown) => {
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
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const [id, list] of Object.entries(allLists)) {
        tx.objectStore(STORE_NAME).put({ id, ...(list as object) });
      }
      await tx.done;
      return { status: 200, message: 'success' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error: unknown) {
      return { isError: true, status: 500, message: 'unable to add lists' };
    }
  };

  async getList(id: string): Promise<ReturnStatus> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const lists = (await store.get(id)) as DatalistAPI;
    if (lists) {
      return {
        status: 200,
        message: 'success',
        lists: {
          [id]: {
            id: id,
            ...lists,
            items: lists.items as any,
          },
        },
      };
    } else {
      return { isError: true, status: 500, message: `${id} does not exist` };
    }
  }

  async getLists(): Promise<ReturnStatus> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const lists = (await store.getAll()) as Array<DatalistWithIdAPI>;
    if (!lists) {
      return {
        isError: true,
        status: 500,
        message: 'no lists returned',
      };
    }
    const listMap = lists.reduce((acc: DataLibraryAPI, x) => {
      const { id } = x;
      acc[id] = x;
      return acc;
    }, {});
    const datalists = BuildLists({ lists: listMap });
    return {
      status: 200,
      message: 'success',
      lists: datalists,
    };
  }

  async addList(list: DatalistAsAPIItems): Promise<ReturnStatus> {
    const timestamp = getTimestamp();
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const id = nanoid(); // Create an id for the list
      tx.objectStore(STORE_NAME).put({
        id,
        version: 0,
        items: list?.items ?? {},
        creator: '{{subject_id}}',
        authz: {
          version: 0,
          authz: [`/users/{{subject_id}}/user-library/lists/${id}`],
        },
        name: list?.name ?? 'New List',
        created_time: timestamp,
        updated_time: timestamp,
      });
      await tx.done;
      return { status: 200, message: 'list added' };
      // oxlint-disable-next-line no-unused-vars
    } catch (_error: unknown) {
      return {
        isError: true,
        status: 500,
        message: `unable to add list ${list?.name ?? 'New List'}`,
      };
    }
  }

  async updateList(
    id: string,
    update: DatalistAsAPIItems,
  ): Promise<ReturnStatus> {
    const { name, items } = update;
    try {
      const db = await this.getDb();
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
        name,
        items,
        version,
        updated_time: timestamp,
        created_time: listData.created_time,
      };

      store.put(updated);
      await tx.done;
      return { status: 200, message: 'success' };
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        isError: true,
        status: 500,
        message: `Unable to update list: ${id}. Error: ${errorMessage}`,
      };
    }
  }

  async deleteList(id: string): Promise<ReturnStatus> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const item = await store.get(id);

      if (!item) {
        throw new Error(`List ${id} does not exist`);
      }

      store.delete(id);
      await tx.done;
      return { status: 200, message: `${id} deleted` };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Unable to delete list: ${id}. Error: ${errorMessage}`,
      };
    }
  }
  async clearLists(): Promise<ReturnStatus> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      await tx.done;
      return { status: 200, message: 'list cleared' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `Unable to clear library. Error: ${errorMessage}`,
      };
    }
  }

  async cacheLists(data: DataLibraryAPI): Promise<ReturnStatus> {
    if (!data || typeof data !== 'object') {
      return {
        isError: true,
        status: 500,
        message: 'Invalid or missing lists property in request',
      };
    }

    const allLists = Object.entries(data).reduce(
      (acc, [id, x]) => {
        if (!isDatalistAPI(x)) return acc;

        acc[id] = {
          ...x,
        };
        return acc;
      },
      {} as Record<string, DatalistAPI>,
    );

    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      for (const [id, list] of Object.entries(allLists)) {
        tx.objectStore(STORE_NAME).put({ id, ...(list as object) });
      }
      await tx.done;
      return { status: 200, message: 'success' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 200,
        message: `unable to cache library to local storage. Error: ${errorMessage}`,
      };
    }
  }

  async cacheList(id: string, data: DatalistAPI): Promise<ReturnStatus> {
    if (!data || typeof data !== 'object') {
      return {
        isError: true,
        status: 500,
        message: 'Invalid or missing lists property in request',
      };
    }
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ id: id, ...(data as object) });
      await tx.done;
      return { status: 200, message: 'success' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: 500,
        message: `unable to clear library. Error: ${errorMessage}`,
      };
    }
  }
}
