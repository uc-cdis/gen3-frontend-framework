import { LocalStorageService } from './dataLibraryIndexDBStorage';
import { ApiService } from './dataLibraryAPIStorage';
import { StorageService } from './types';

export const createStorageService = (
  requiresAPI: boolean,
  isLoggedIn: boolean,
): StorageService => {
  if (!requiresAPI || !isLoggedIn) {
    return new LocalStorageService();
  }
  return new ApiService();
};
