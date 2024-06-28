'use strict';
import * as fs from 'node:fs';
import path from 'path';

export const getSubdirectories = (dir: string) => {
  const files = fs.readdirSync(dir);

  const subDirs = files.filter((file) => {
    const stats = fs.statSync(path.join(dir, file));
    return stats.isDirectory();
  });
  return subDirs;
};
