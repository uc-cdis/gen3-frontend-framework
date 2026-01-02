import { FilesystemContent } from './filesystem';
import { ContentDatabase } from './ContentDatabase';
import { GEN3_FRONTEND_CONFIGURATION_ROOT } from './constants';

export class ContentSource {
  private static instance: ContentSource | null = null;
  private contentDatabase: ContentDatabase;

  private constructor() {
    const config = {
      store: new FilesystemContent({
        rootPath: GEN3_FRONTEND_CONFIGURATION_ROOT,
      }),
    };
    this.contentDatabase = new ContentDatabase(config);
  }

  public static getInstance(): ContentSource {
    if (!ContentSource.instance) {
      ContentSource.instance = new ContentSource();
    }
    return ContentSource.instance;
  }

  // Add methods to access the ContentDatabase functionality
  // For example:
  public getContentDatabase(): ContentDatabase {
    return this.contentDatabase;
  }

  // ✅ Compatibility helper: allow `ContentSource.getContentDatabase()`
  public static getContentDatabase(): ContentDatabase {
    return ContentSource.getInstance().getContentDatabase();
  }
}

// Export a singleton instance
export default ContentSource.getInstance();
