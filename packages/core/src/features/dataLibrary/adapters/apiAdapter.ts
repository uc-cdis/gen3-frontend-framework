import { IDataLibraryAdapter } from './types';
import {
  useGetDataLibraryListsQuery,
  useAddDataLibraryListMutation,
  useDeleteDataLibraryListMutation,
  useAddAllDataLibraryListsMutation,
  useUpdateDataLibraryListMutation,
  useDeleteAllDataLibraryMutation,
} from '../dataLibraryApi';
import { DataLibrary, Datalist, LoadAllListData } from '../types';
import { flattenDataList } from '../utils';

// API Implementation
export class APIDataLibraryAdapter implements IDataLibraryAdapter {
  constructor(
    private api = {
      getLists: useGetDataLibraryListsQuery,
      addList: useAddDataLibraryListMutation,
      deleteList: useDeleteDataLibraryListMutation,
      updateList: useUpdateDataLibraryListMutation,
      deleteAll: useDeleteAllDataLibraryMutation,
      setAllLists: useAddAllDataLibraryListsMutation,
    },
  ) {}

  async getLists(): Promise<DataLibrary> {
    const { data } = this.api.getLists();
    return data?.lists ?? {};
  }

  async addList(item?: Partial<Datalist>): Promise<void> {
    await this.api.addList()[0](item);
  }

  async deleteList(id: string): Promise<void> {
    await this.api.deleteList()[0](id);
  }

  async updateList(id: string, data: Datalist): Promise<void> {
    const flattened = flattenDataList(data);
    await this.api.updateList()[0]({ id, list: flattened });
  }

  async deleteAll(): Promise<void> {
    await this.api.deleteAll()[0]();
  }

  async setAllLists(data: LoadAllListData): Promise<void> {
    await this.api.setAllLists()[0](data);
  }
}
