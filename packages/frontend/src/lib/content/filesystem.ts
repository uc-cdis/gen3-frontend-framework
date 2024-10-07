import { ContentSource } from './types';
import fs from 'fs';
import path from 'path';

const myGlob = (dir: string, filter: string) => {
  try {
    const files = fs.readdirSync(dir);
    return files.filter((file) => file.search(filter) !== -1);
  } catch (error: any) {
    console.log('myGlow error', error, dir);
  }
  return [];
};

export class FilesystemContent implements ContentSource {
  rootPath: string;
  constructor({ rootPath }: { rootPath?: string }) {
    this.rootPath = rootPath || '';
  }

  public async get<T extends Record<string, any>>(
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
  public async getAll<T extends Record<string, any>>(
    filepath: string,
    filter: string,
  ): Promise<Array<T>> {
    try {
      const files = myGlob(path.join(this.rootPath, filepath), filter);
      return Promise.all(
        files.map((file) =>
          this.get<T>(path.join(this.rootPath, filepath, file)),
        ),
      );
    } catch (err) {
      throw new Error(`getAllCannot process ${filepath}/${filter}`);
    }
  }
}
