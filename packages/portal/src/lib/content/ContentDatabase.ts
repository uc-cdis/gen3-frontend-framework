import { ContentSource } from "./types";

/**
 *  The Content management "datastore" which is an abstracted interface to
 *  some persistent storage of content needed for Gen3's content management system
 */

export interface CreateDatabase {
    store: ContentSource;
}

export class ContentDatabase {
    public store: ContentSource

    constructor(public config: CreateDatabase) {
        this.store = config.store
    }

    public async get<T extends Record<string, undefined>>(filepath: string): Promise<T> {
        return this.store.get(filepath);
    }
}
