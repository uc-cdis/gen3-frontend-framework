import { ReturnStatus, StorageService } from './types';
import { DataLibraryStoreMode, DatalistAsAPIItems } from '../types';
import { LocalStorageService } from './LocalStorageService';
import { APIStorageService } from './APIStorageService';
import { CachedAPIService } from './CachedAPIStorageService';

export class DataLibraryStorageService implements StorageService {
  private storageService: StorageService;

  constructor(mode: DataLibraryStoreMode = DataLibraryStoreMode.ApiOnly) {
    if (mode === DataLibraryStoreMode.ApiOnly) {
      this.storageService = new APIStorageService();
    } else if (mode === DataLibraryStoreMode.ApiAndLocal)
      this.storageService = new CachedAPIService();
    else this.storageService = new LocalStorageService();
  }

  async setStorageMode(mode: DataLibraryStoreMode) {
    if (mode === DataLibraryStoreMode.ApiOnly) {
      this.storageService = new APIStorageService();
    } else if (mode === DataLibraryStoreMode.ApiAndLocal)
      this.storageService = new CachedAPIService();
    else this.storageService = new LocalStorageService();
  }

  // private async syncApiAndLocal() {
  //   const { lists: localData, isError: localError } =
  //     await this.localStorageDataLibrary.getLists();
  //   const { lists: apiData, isError: apiError } =
  //     await this.apiDataLibrary.getLists();
  //
  //   if (localError || apiError) {
  //     return;
  //   }
  //
  //   const mergedData: Record<string, Datalist> = { ...localData };
  //
  //   // First, update any existing items with newer versions from API
  //   Object.values(apiData?.lists ?? {}).forEach((apiList) => {
  //     const id = apiList.id as keyof DataLibrary;
  //     const localList = localData?.[id];
  //     if (
  //       !localList ||
  //       storage Date(apiList.updatedTime) > storage Date(localList.updatedTime)
  //     ) {
  //       mergedData[id] = apiList;
  //     }
  //   });
  //
  //   //  Push local-only changes to API
  //   const syncPromises: Promise<any>[] = [];
  //
  //   for (const [id, localList] of Object.entries(localData?.lists ?? {})) {
  //     if (!apiData?.[id]) {
  //       // This list exists locally but not in API, so push it to API
  //       syncPromises.push(this.apiDataLibrary.addList(localList));
  //     } else if (
  //       storage Date(localList.updatedTime) > storage Date(apiData[id].updatedTime)
  //     ) {
  //       // Local list is newer than API, so update API
  //       syncPromises.push(this.apiDataLibrary.updateList(localList));
  //     }
  //   }
  //
  //   // Wait for all API operations to complete
  //   await Promise.all(syncPromises);
  //   await this.localStorageDataLibrary.cacheLists({ lists: mergedData });
  // }

  async getLists(): Promise<ReturnStatus> {
    return await this.storageService.getLists();
  }

  async getList(id: string): Promise<ReturnStatus> {
    return await this.storageService.getList(id);
  }

  async getCachedLists(id: string): Promise<ReturnStatus> {
    return await this.storageService.getList(id);
  }

  async setAllLists(lists: Array<DatalistAsAPIItems>): Promise<ReturnStatus> {
    return await this.storageService.setAllLists(lists ?? {});
  }

  async addList(list: DatalistAsAPIItems): Promise<ReturnStatus> {
    return await this.storageService.addList(list);
  }

  async updateList(
    id: string,
    list: DatalistAsAPIItems,
  ): Promise<ReturnStatus> {
    return await this.storageService.updateList(id, list);
  }

  async deleteList(id: string): Promise<ReturnStatus> {
    return await this.storageService.deleteList(id);
  }

  async clearLists(): Promise<ReturnStatus> {
    return await this.storageService.clearLists();
  }
}
