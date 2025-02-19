// DataLibraryAdapter interface - defines common operations
import { DataLibrary, Datalist, LoadAllListData } from '../types';

export interface IDataLibraryAdapter {
  getLists(): Promise<DataLibrary>;
  addList(item?: Partial<Datalist>): Promise<void>;
  deleteList(id: string): Promise<void>;
  updateList(id: string, data: Datalist): Promise<void>;
  deleteAll(): Promise<void>;
  setAllLists(data: LoadAllListData): Promise<void>;
}
