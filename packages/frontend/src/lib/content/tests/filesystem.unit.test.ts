import fs from 'fs';
import os from 'os';
import path from 'path';
import { FilesystemContent } from '../filesystem';

describe('FilesystemContent', () => {
  let tmp: string;
  let root: string;
  let content: FilesystemContent;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gff-content-'));
    root = path.join(tmp, 'config');
    fs.mkdirSync(path.join(root, 'apps'), { recursive: true });
    fs.writeFileSync(path.join(root, 'apps', 'good.json'), '{"a":1}');
    fs.writeFileSync(path.join(root, 'apps', 'bad.json'), '{not json');
    // sibling of root whose name shares root's prefix, and a file outside root
    fs.mkdirSync(path.join(tmp, 'config-evil'));
    fs.writeFileSync(path.join(tmp, 'config-evil', 'x.json'), '{"x":1}');
    fs.writeFileSync(path.join(tmp, 'outside.json'), '{"outside":true}');
    content = new FilesystemContent({ rootPath: root });
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  describe('get', () => {
    it('reads and parses a JSON file', async () => {
      await expect(content.get('apps/good.json')).resolves.toEqual({ a: 1 });
    });

    it('throws when the file does not exist', async () => {
      await expect(content.get('apps/missing.json')).rejects.toThrow(
        /Cannot read/,
      );
    });

    it('throws a parse error for invalid JSON', async () => {
      await expect(content.get('apps/bad.json')).rejects.toThrow(
        /Cannot parse JSON/,
      );
    });

    it.each([
      '../outside.json',
      'apps/../../outside.json',
      '../config-evil/x.json',
    ])('rejects path escaping the root: %s', async (p) => {
      await expect(content.get(p)).rejects.toThrow(/outside the content root/);
    });

    it('rejects an absolute path outside the root', async () => {
      await expect(content.get(path.join(tmp, 'outside.json'))).rejects.toThrow(
        /outside the content root/,
      );
    });

    it('allows ".." that stays inside the root', async () => {
      await expect(content.get('apps/../apps/good.json')).resolves.toEqual({
        a: 1,
      });
    });
  });

  describe('exists', () => {
    it('is true for an existing file', async () => {
      await expect(content.exists('apps/good.json')).resolves.toBe(true);
    });

    it('is false for a missing file', async () => {
      await expect(content.exists('apps/missing.json')).resolves.toBe(false);
    });

    it.each(['../outside.json', '../config-evil/x.json'])(
      'is false for an existing file outside the root: %s',
      async (p) => {
        await expect(content.exists(p)).resolves.toBe(false);
      },
    );
  });

  describe('getAll', () => {
    it('returns files matching the filter', async () => {
      await expect(content.getAll('apps', 'good')).resolves.toEqual([{ a: 1 }]);
    });

    it('returns an empty list when the directory is missing', async () => {
      await expect(content.getAll('nope', '.json')).resolves.toEqual([]);
    });
  });
});
