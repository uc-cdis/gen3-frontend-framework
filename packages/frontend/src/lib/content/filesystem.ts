import { ContentSource } from './types';
import fs from 'fs';
import path from 'path';

export class FilesystemContent implements ContentSource {
  rootPath: string;
  constructor({ rootPath }: { rootPath?: string }) {
    this.rootPath = rootPath || '';
  }

  public async get<T extends Record<string, undefined>>(
    filepath: string,
  ): Promise<T> {
    try {
      return await JSON.parse(
        fs.readFileSync(path.join(this.rootPath, filepath)).toString('utf-8'),
      );
    } catch (err) {
      throw new Error(`Cannot process ${filepath}`);
    }
  }
}
