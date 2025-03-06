import { IDBPDatabase, openDB } from 'idb';
import { ReturnStatus, StorageService } from './types';
import { LibraryAPIItems, Datalist } from '../types';
import { BuildLists, getTimestamp } from '../utils';
import { JSONObject } from '../../../types';
import { nanoid } from '@reduxjs/toolkit';

const DATABASE_NAME = 'Gen3DataLibrary';
const STORE_NAME = 'DataLibraryLists';

interface DataLibraryFromStore
  extends Omit<Datalist, 'createdTime' | 'updatedTime' | 'items'> {
  created_time: string;
  updated_time: string;
  items: LibraryAPIItems;
}

export class LocalStorageService implements StorageService {
  private getDb(): Promise<IDBPDatabase> {
    return openDB(DATABASE_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async getList(id: string): Promise<ReturnStatus> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
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
              items: x.items as any,
            };
            return acc;
          },
          {},
        ),
      };
    } else {
      return { isError: true, status: `${id} does not exist` };
    }
  }

  async getLists(): Promise<ReturnStatus> {
    const db = await this.getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const lists = (await store.getAll()) as Array<DataLibraryFromStore>;
    const listMap = lists.reduce(
      (acc: Record<string, JSONObject>, x: DataLibraryFromStore) => {
        acc[x.id] = {
          ...x,
          items: x.items as any, // TODO Process items
        } as unknown as JSONObject;
        return acc;
      },
      {},
    );
    const datalists = BuildLists({ lists: listMap });
    return {
      status: 'success',
      lists: datalists,
    };
  }

  async addList(list?: Partial<Datalist>): Promise<ReturnStatus> {
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
      return { status: 'list added' };
    } catch (_error: unknown) {
      return {
        isError: true,
        status: `unable to add list ${list?.name ?? 'New List'}`,
      };
    }
  }

  async updateList(list: Datalist): Promise<ReturnStatus> {
    const { id } = list;
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
      return { status: `${id} deleted` };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: `Unable to delete list: ${id}. Error: ${errorMessage}`,
      };
    }
  }
  async clearLists(): Promise<ReturnStatus> {
    try {
      const db = await this.getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      await tx.done;
      return { status: 'list added' };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        isError: true,
        status: `unable to clear library. Error: ${errorMessage}`,
      };
    }
  }
}
