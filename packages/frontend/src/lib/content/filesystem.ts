import { ContentSourceInterface } from './types';
import fs from 'fs';
import path from 'path';

const myGlob = (dir: string, filter: string) => {
  try {
    const files = fs.readdirSync(dir);
    return files.filter((file) => file.search(filter) !== -1);
  } catch (error: any) {}
  return [];
};

export class FilesystemContent implements ContentSourceInterface {
  rootPath: string;
  constructor({ rootPath }: { rootPath?: string }) {
    this.rootPath = rootPath || '';
  }

  public async get<T extends Record<string, any>>(
    filepath: string,
  ): Promise<T> {
    const fullPath = path.join(this.rootPath, filepath);
    let raw: string;
    try {
      raw = fs.readFileSync(fullPath).toString('utf8');
    } catch {
      throw new Error(`Cannot read ${fullPath}`);
    }
    try {
      return JSON.parse(raw);
    } catch (err) {
      const syntaxMsg = err instanceof SyntaxError ? `: ${err.message}` : '';
      throw new Error(`Cannot parse JSON in ${fullPath}${syntaxMsg}`);
    }
  }
  public async getAll<T extends Record<string, any>>(
    filepath: string,
    filter: string,
  ): Promise<Array<T>> {
    try {
      const files = myGlob(path.join(this.rootPath, filepath), filter);
      return Promise.all(
        files.map((file) => this.get<T>(path.join(filepath, file))),
      );
    } catch {
      throw new Error(
        `getAllCannot process ${path.join(this.rootPath, filepath)}/${filter}`,
      );
    }
  }
}
