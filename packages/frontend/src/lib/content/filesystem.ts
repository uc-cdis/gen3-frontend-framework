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

  /**
   * Resolve filepath under rootPath, rejecting anything that escapes it
   * (e.g. "../" sequences coming from request parameters).
   */
  private resolveSafe(filepath: string): string {
    const root = path.resolve(this.rootPath);
    const fullPath = path.resolve(root, filepath);
    if (fullPath !== root && !fullPath.startsWith(root + path.sep)) {
      throw new Error(`Path ${filepath} is outside the content root`);
    }
    return fullPath;
  }

  public async get<T extends Record<string, any>>(
    filepath: string,
  ): Promise<T> {
    const fullPath = this.resolveSafe(filepath);
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

  public async exists(filepath: string): Promise<boolean> {
    try {
      await fs.promises.access(this.resolveSafe(filepath));
      return true;
    } catch {
      return false;
    }
  }
}
