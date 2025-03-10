import { ReturnStatus, StorageService } from './types';
import {
  DataLibrary,
  Datalist,
  NamedDataItems,
  UpdateDataLibraryListParams,
} from '../types';
import { LocalStorageService } from './dataLibraryIndexDBStorage';
import { ApiService } from './dataLibraryAPIStorage';

export class CachedAPIService implements StorageService {
  private useAPI: boolean;
  private localStorageDataLibrary: LocalStorageService;
  private apiDataLibrary: ApiService;

  constructor() {
    this.useAPI = false;
    this.localStorageDataLibrary = new LocalStorageService(); // always update local storage
    this.apiDataLibrary = new ApiService();
  }

  async setUseAPI(useAPI: boolean) {
    this.useAPI = useAPI;
    if (useAPI) {
      await this.syncApiAndLocal();
    }
  }

  private async syncApiAndLocal() {
    const { lists: localData, isError: localError } =
      await this.localStorageDataLibrary.getLists();
    const { lists: apiData, isError: apiError } =
      await this.apiDataLibrary.getLists();

    if (localError || apiError) {
      return;
    }

    const mergedData: Record<string, Datalist> = { ...localData };

    // First, update any existing items with newer versions from API
    Object.values(apiData?.lists ?? {}).forEach((apiList) => {
      const id = apiList.id as keyof DataLibrary;
      const localList = localData?.[id];
      if (
        !localList ||
        new Date(apiList.updatedTime) > new Date(localList.updatedTime)
      ) {
        mergedData[id] = apiList;
      }
    });

    //  Push local-only changes to API
    const syncPromises: Promise<any>[] = [];

    for (const [id, localList] of Object.entries(localData?.lists ?? {})) {
      if (!apiData?.[id]) {
        // This list exists locally but not in API, so push it to API
        syncPromises.push(this.apiDataLibrary.addList(localList));
      } else if (
        new Date(localList.updatedTime) > new Date(apiData[id].updatedTime)
      ) {
        // Local list is newer than API, so update API
        syncPromises.push(this.apiDataLibrary.updateList(localList));
      }
    }

    // Wait for all API operations to complete
    await Promise.all(syncPromises);
    await this.localStorageDataLibrary.cacheLists(mergedData);
  }

  async getLists(): Promise<ReturnStatus> {
    if (this.useAPI) {
      // do a network request to get the library
      // get the remote list
      const apiResults = await this.apiDataLibrary.getLists();
      if (apiResults.isError) {
        return apiResults;
      }
      await this.localStorageDataLibrary.cacheLists(apiResults.lists ?? {});
    }
    return await this.localStorageDataLibrary.getLists();
  }

  async getList(id: string): Promise<ReturnStatus> {
    return await this.localStorageDataLibrary.getList(id);
  }

  async getCachedLists(id: string): Promise<ReturnStatus> {
    return await this.localStorageDataLibrary.getList(id);
  }

  async setAllLists(lists: Array<NamedDataItems>): Promise<ReturnStatus> {
    if (this.useAPI) {
      const apiResults = await this.apiDataLibrary.setAllLists(lists);
      if (apiResults.isError) {
        return apiResults;
      }
    }
    return await this.localStorageDataLibrary.setAllLists(lists ?? {});
  }

  async addList(list: NamedDataItems): Promise<ReturnStatus> {
    if (this.useAPI) {
      const apiResults = await this.apiDataLibrary.addList(list);
      if (apiResults.isError) {
        return apiResults;
      }
    }
    return await this.localStorageDataLibrary.addList(list);
  }

  async updateList(list: UpdateDataLibraryListParams): Promise<ReturnStatus> {
    if (this.useAPI) {
      const apiResults = await this.apiDataLibrary.updateList(list);
      if (apiResults.isError) {
        return apiResults;
      }
    }
    return await this.localStorageDataLibrary.updateList(list);
  }

  async deleteList(id: string): Promise<ReturnStatus> {
    if (this.useAPI) {
      const apiResults = await this.apiDataLibrary.deleteList(id);
      if (apiResults.isError) {
        return apiResults;
      }
    }
    return await this.localStorageDataLibrary.deleteList(id);
  }

  async clearLists(): Promise<ReturnStatus> {
    if (this.useAPI) {
      const apiResults = await this.apiDataLibrary.clearLists();
      if (apiResults.isError) {
        return apiResults;
      }
    }
    return await this.localStorageDataLibrary.clearLists();
  }
}
