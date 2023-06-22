import { ContentSource, Gen3CommonsConfiguration } from './types';

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

  /**
   * loads a resource from the content store
   * @param path: key, filename or url
   */
  public async get<T extends Record<string, any>>(path: string) : Promise<T>{
    return await this.store.get(path);
  }

}
