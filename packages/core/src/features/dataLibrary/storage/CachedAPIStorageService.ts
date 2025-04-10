import { ReturnStatus, StorageService } from './types';
import { DatalistAsAPIItems } from '../types';
import { LocalStorageService } from './LocalStorageService';
import { APIStorageService } from './APIStorageService';
import { convertDataLibraryToDataLibraryAPI } from '../utils';

export class CachedAPIService implements StorageService {
  private localStorageDataLibrary: LocalStorageService;
  private apiDataLibrary: APIStorageService;
  constructor() {
    this.localStorageDataLibrary = new LocalStorageService(); // always update local storage
    this.apiDataLibrary = new APIStorageService();
  }

  async getLists(): Promise<ReturnStatus> {
    // do a network request to get the library
    // get the remote list
    const apiResults = await this.apiDataLibrary.getLists();

    if (apiResults.isError) {
      return {
        ...apiResults,
        lists: undefined,
      };
    }

    const dataLibrary = convertDataLibraryToDataLibraryAPI(
      apiResults?.lists ?? {},
    );
    await this.localStorageDataLibrary.cacheLists(dataLibrary);
    return apiResults;
  }

  async getList(id: string): Promise<ReturnStatus> {
    return await this.localStorageDataLibrary.getList(id);
  }

  async getCachedLists(id: string): Promise<ReturnStatus> {
    return await this.localStorageDataLibrary.getList(id);
  }

  async setAllLists(lists: Array<DatalistAsAPIItems>): Promise<ReturnStatus> {
    const apiResults = await this.apiDataLibrary.setAllLists(lists);
    if (apiResults.isError) {
      return {
        ...apiResults,
        lists: undefined,
      };
    }
    const dataLibrary = convertDataLibraryToDataLibraryAPI(
      apiResults?.lists ?? {},
    );
    await this.localStorageDataLibrary.cacheLists(dataLibrary);

    return apiResults;
  }

  async addList(list: DatalistAsAPIItems): Promise<ReturnStatus> {
    // update the API list
    const apiResults = await this.apiDataLibrary.addList(list);
    if (apiResults.isError) {
      return {
        ...apiResults,
        lists: undefined,
      };
    }
    const cacheResults = await this.localStorageDataLibrary.addList(list);
    return {
      ...cacheResults,
      lists: undefined,
    };
  }

  async updateList(
    id: string,
    list: DatalistAsAPIItems,
  ): Promise<ReturnStatus> {
    const apiResults = await this.apiDataLibrary.updateList(id, list);
    if (apiResults.isError) {
      return {
        ...apiResults,
        lists: undefined,
      };
    }

    return await this.localStorageDataLibrary.cacheList(
      id,
      (apiResults.lists as any) ?? {},
    );
  }

  async deleteList(id: string): Promise<ReturnStatus> {
    const apiResults = await this.apiDataLibrary.deleteList(id);
    if (apiResults.isError) {
      return {
        ...apiResults,
        lists: undefined,
      };
    }
    return await this.localStorageDataLibrary.deleteList(id);
  }

  async clearLists(): Promise<ReturnStatus> {
    const apiResults = await this.apiDataLibrary.clearLists();
    if (apiResults.isError) {
      return {
        ...apiResults,
        lists: undefined,
      };
    }
    return await this.localStorageDataLibrary.clearLists();
  }
}
