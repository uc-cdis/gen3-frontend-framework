import { ContentSource } from './types';

/**
 *  The Content management "datastore" which is an abstracted interface to
 *  some persistent storage of content needed for Gen3's content management system
 */

export interface CreateDatabase {
  store: ContentSource;
}

export class ContentDatabase {
  public store: ContentSource;

  constructor(public config: CreateDatabase) {
    this.store = config.store;
  }

  public async get<T extends Record<string, any>>(
    filepath: string,
  ): Promise<T> {
    return this.store.get(filepath);
  }

  public async getAll<T extends Record<string, any>>(
    filepath: string,
    filter: string,
  ): Promise<Array<T>> {
    //   Array<Promise<T>>
    return this.store.getAll(filepath, filter);
  }
}
