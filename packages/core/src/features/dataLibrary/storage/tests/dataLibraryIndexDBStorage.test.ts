import 'fake-indexeddb/auto';
import { LocalStorageService } from '../dataLibraryIndexDBStorage';
import { GroupedDataItems, LibraryAPIItems } from '../../types';
const ListToAdd = {
  name: 'test-list',
  items: {
    'dg.5555/8d84511c': {
      dataset_guid: '1010',
      md5sum: 'a1890eb3da180416a3a1e2c4e4527356', // pragma: allowlist secret
      file_name: 'teach.sav',
      file_size: 1291786,
      object_id: 'dg.5555/8d84511c',
      itemType: 'Data',
      id: 'dg.5555/8d84511c',
    },
    'dg.5555/3ca7d38-': {
      dataset_guid: '1010',
      md5sum: '32d8152b09a2ed05a0fde2f21ff46479', // pragma: allowlist secret
      file_name: 'Teaching.zip',
      file_size: 2565265,
      object_id: 'dg.5555/3ca7d38-',
      itemType: 'Data',
      id: 'dg.5555/3ca7d38-',
    },
  },
};

const SecondList = {
  name: 'test-list-2',
  'dg.5555/0c8df5e3': {
    dataset_guid: '1010',
    md5sum: 'dde1b1d86b3b4ed88fa5b42974ecfd79', // pragma: allowlist secret
    file_name: 'tutorial.zip',
    file_size: 94535,
    object_id: 'dg.5555/0c8df5e3',
    itemType: 'Data',
    id: 'dg.5555/0c8df5e3',
  },
  'dg.5555/03ed62aa': {
    dataset_guid: '1010',
    md5sum: '8f5b9b28004210865a0c1d7fc9834b1a', // pragma: allowlist secret
    file_name: 'teach.csv',
    file_size: 932272,
    object_id: 'dg.5555/03ed62aa',
    itemType: 'Data',
    id: 'dg.5555/03ed62aa',
  },
};

jest.mock('@reduxjs/toolkit', () => {
  const actualToolkit = jest.requireActual('@reduxjs/toolkit');
  let counter = 0;
  return {
    ...actualToolkit,
    nanoid: jest.fn(() => `mocked-nanoid-${counter++}`),
  };
});

describe('LocalStorageService', () => {
  new IDBFactory(); // use for all test below
  const service = new LocalStorageService();

  it('should add a list', async () => {
    const result = await service.addList(
      ListToAdd as unknown as GroupedDataItems,
    );
    expect(result.status).toBe('list added');
  });

  it('should add a second list', async () => {
    const result = await service.addList(
      SecondList as unknown as GroupedDataItems,
    );
    expect(result.status).toBe('list added');
  });

  it('should get all lists', async () => {
    const result = await service.getLists();
    expect(result.status).toBe('success');
    expect(result?.lists?.['mocked-nanoid-0'].name).toBe('test-list');
  });

  it('should get a list by id', async () => {
    const result = await service.getList('mocked-nanoid-0');
    expect(result.status).toBe('success');
    expect(result.isError).toBeUndefined(); // Verify no error was returned
    expect(result?.lists?.['mocked-nanoid-0'].name).toBe('test-list');
  });

  it('should return error if list does not exist', async () => {
    const result = await service.getList('non-existent-id');
    expect(result.isError).toBe(true);
    expect(result.status).toBe('non-existent-id does not exist');
  });

  it('should update an existing list', async () => {
    const result = await service.updateList({
      id: 'mocked-nanoid-0',
      name: 'Updated List',
      items: ListToAdd.items as unknown as LibraryAPIItems,
    });
    expect(result.status).toBe('success');
    const resultList = await service.getList('mocked-nanoid-0');
    expect(resultList.status).toBe('success');
    expect(resultList.isError).toBeUndefined();
    expect(resultList?.lists?.['mocked-nanoid-0'].name).toBe('Updated List');
  });

  it('should fail to update a non-existent list', async () => {
    const result = await service.updateList({
      id: 'non-existent-id',
      name: 'New Name',
      items: {},
    });
    expect(result.isError).toBe(true);
    expect(result.status).toMatch(/non-existent-id does not exist/);
  });

  it('should delete an existing list', async () => {
    const result = await service.deleteList('mocked-nanoid-0');
    expect(result.status).toBe('mocked-nanoid-0 deleted');

    const resultList = await service.getLists();
    expect(resultList.status).toBe('success');
    expect(resultList.isError).toBeUndefined(); // Verify no error was returned
    expect(Object.keys(result).length).toBe(1);
  });

  it('should fail to delete a non-existent list', async () => {
    const result = await service.deleteList('non-existent-id');
    expect(result.isError).toBe(true);
    expect(result.status).toMatch(/non-existent-id does not exist/);
  });

  it('should clear all lists', async () => {
    const result = await service.clearLists();
    expect(result.status).toBe('list cleared');
    const resultList = await service.getLists();
    expect(resultList.status).toBe('success');
    expect(resultList.isError).toBeUndefined(); // Verify no error was returned
    expect(Object.keys(resultList?.lists ?? {}).length).toBe(0);
  });

  it('should cache lists', async () => {
    const lists = {
      'mocked-nanoid-1': {
        items: {},
        version: 0,
        created_time: '4/3/2025, 10:15:14 AM',
        updated_time: '4/3/2025, 10:15:14 AM',
        name: 'test-list-2',
        id: 'mocked-nanoid-1',
        authz: {
          version: 0,
          authz: ['/users/{{subject_id}}/user-library/lists/mocked-nanoid-1'],
        },
      },
    };
    const result = await service.cacheLists({ lists });
    expect(result.status).toBe('success');
    const resultList = await service.getLists();
    expect(resultList.status).toBe('success');
    expect(resultList.isError).toBeUndefined(); // Verify no error was returned
    expect(resultList?.lists).toEqual(lists);
  });
});
