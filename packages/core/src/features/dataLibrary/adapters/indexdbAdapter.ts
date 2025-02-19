import { IDataLibraryAdapter } from './types';
import { DataLibrary, Datalist, LoadAllListData } from '../types';
import {
  getDataLibraryListIndexDB,
  addListToDataLibraryIndexDB,
  deleteListIndexDB,
  addAllListIndexDB,
  updateListIndexDB,
  deleteAll,
} from '../dataLibraryIndexDB';

export class IndexDBDataLibraryAdapter implements IDataLibraryAdapter {
  async getLists(): Promise<DataLibrary> {
    const result = await getDataLibraryListIndexDB();
    if (result.isError) {
      throw new Error(result.status);
    }
    return result.lists ?? {};
  }

  async addList(item?: Partial<Datalist>): Promise<void> {
    const result = await addListToDataLibraryIndexDB(item);
    if (result.isError) {
      throw new Error(result.status);
    }
  }

  async deleteList(id: string): Promise<void> {
    const result = await deleteListIndexDB(id);
    if (result.isError) {
      throw new Error(result.status);
    }
  }

  async updateList(id: string, data: Datalist): Promise<void> {
    const result = await updateListIndexDB(id, data);
    if (result.isError) {
      throw new Error(result.status);
    }
  }

  async deleteAll(): Promise<void> {
    const result = await deleteAll();
    if (result.isError) {
      throw new Error(result.status);
    }
  }

  async setAllLists(data: LoadAllListData): Promise<void> {
    const result = await addAllListIndexDB(data);
    if (result.isError) {
      throw new Error(result.status);
    }
  }
}
