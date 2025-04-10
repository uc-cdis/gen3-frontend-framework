import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  APIStorageService,
  fetchFromDataLibraryAPI,
} from '../APIStorageService';
import { GEN3_API, GEN3_DATA_LIBRARY_API } from '../../../../constants';
import { APIListData, ListToAdd, SecondList } from './data';
import { DataLibraryAPIResponse, DatalistAsAPIItems } from '../../types';
import { BuildLists } from '../../utils';

jest.mock('@reduxjs/toolkit', () => {
  const actualToolkit = jest.requireActual('@reduxjs/toolkit');
  let counter = 0;
  return {
    ...actualToolkit,
    nanoid: jest.fn(() => `mocked-nanoid-${counter++}`),
  };
});

const csrfData = {
  message: 'Feelin good!', // User message
  csrf: '11ff0e613e5c782d5cf29c5b565be2258880.0002025-03-26T22:32:39+00:00', // CSRF token
};

// Set up MSW server
const server = setupServer(
  // mock the _status call for CSRF token

  http.get(`${GEN3_API}/_status`, () => {
    return HttpResponse.json(csrfData);
  }),
);

describe('ApiService', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  let apiService: APIStorageService;

  beforeEach(() => {
    apiService = new APIStorageService();
  });

  describe('fetchFromDataLibraryAPI', () => {
    it('should handle successful responses', async () => {
      server.use(
        http.get(`https://test-url.com`, () => {
          return HttpResponse.json({ test: 'data' });
        }),
      );

      const result = await fetchFromDataLibraryAPI('https://test-url.com');
      expect(result.data).toEqual({ test: 'data' });
      expect(result.error).toBeUndefined();
    });

    it('should handle HTTP errors', async () => {
      server.use(
        http.get('https://test-url.com', () => {
          return HttpResponse.json(
            { message: 'Not Found' },
            {
              status: 404,
            },
          );
        }),
      );

      const result = await fetchFromDataLibraryAPI('https://test-url.com');
      expect(result.error).toEqual({
        status: 404,
        message: 'Not Found',
      });
      expect(result.data).toBeUndefined();
    });

    it('should handle unknown errors', async () => {
      server.use(
        http.get('https://test-url.com', () => {
          return HttpResponse.error();
        }),
      );

      const result = await fetchFromDataLibraryAPI('https://test-url.com');
      expect(result.error).toEqual({
        status: 500,
        message: 'Unknown Error',
      });
      expect(result.data).toBeUndefined();
    });
  });

  describe('getLists', () => {
    it('should return all lists successfully', async () => {
      server.use(
        http.get(`${GEN3_DATA_LIBRARY_API}`, () => {
          return HttpResponse.json(APIListData);
        }),
      );

      const result = await apiService.getLists();

      expect(result.isError).toBeUndefined();
      expect(result.status).toBe('success');
      expect(result.lists).toEqual(
        BuildLists(APIListData as unknown as DataLibraryAPIResponse),
      );
    });

    it('should handle API errors', async () => {
      server.use(
        http.get(`${GEN3_DATA_LIBRARY_API}`, () => {
          return HttpResponse.json(
            { message: 'Server error' },
            {
              status: 500,
            },
          );
        }),
      );

      const result = await apiService.getLists();

      expect(result.isError).toBe(true);
      expect(result.status).toBe('Internal Server Error');
      expect(result.lists).toBeUndefined();
    });

    it('should handle invalid response data', async () => {
      server.use(
        http.get(`${GEN3_DATA_LIBRARY_API}`, () => {
          return HttpResponse.json(
            { invalidData: true },
            {
              status: 200,
            },
          );
        }),
      );

      const result = await apiService.getLists();

      expect(result.status).toBe('no list returned');
      expect(result.lists).toEqual({});
    });
  });

  describe('addList', () => {
    it('should add a list successfully', async () => {
      server.use(
        http.put(`${GEN3_DATA_LIBRARY_API}`, () => {
          return HttpResponse.json({
            lists: {
              name: 'test-list',
              items: ListToAdd.items,
            },
          });
        }),
      );

      const result = await apiService.addList(ListToAdd);

      expect(result.status).toBe('success');
      expect(result.lists).toBeDefined();
    });

    it('should handle API errors when adding a list', async () => {
      server.use(
        http.put(`${GEN3_DATA_LIBRARY_API}`, () => {
          return HttpResponse.json(
            { message: 'Server error' },
            {
              status: 500,
            },
          );
        }),
      );

      const result = await apiService.addList(ListToAdd);

      expect(result.isError).toBe(true);
      expect(result.status).toContain('DataLibraryAPI error');
      expect(result.lists).toBeUndefined();
    });
  });

  describe('updateList', () => {
    it('should update a list successfully', async () => {
      const updatedList = {
        name: 'Updated List Name',
        items: ListToAdd.items,
      };

      server.use(
        http.put(`${GEN3_DATA_LIBRARY_API}/list-id-1`, () => {
          return HttpResponse.json({
            lists: {
              'list-id-1': {
                updated_time: '2025-04-04T19:35:52.557718+00:00',
                authz: {
                  authz: [
                    '/users/2192/user-data-library/lists/4d5c53d1-1318-4320-bff6-7faf5af1710e',
                  ],
                  version: 0,
                },
                id: 'list-id-1',
                version: 0,
                created_time: '2025-04-04T18:55:21.195457+00:00',
                items: ListToAdd.items,
              },
            },
          });
        }),
      );

      const result = await apiService.updateList('list-id-1', updatedList);

      expect(result.status).toBe('success');
      expect(result.lists).toBeDefined();
    });

    it('should handle API errors when updating a list', async () => {
      server.use(
        http.put(`${GEN3_DATA_LIBRARY_API}/invalid-id`, () => {
          return new HttpResponse('Not found', {
            status: 404,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }),
      );

      const result = await apiService.updateList('invalid-id', {
        name: 'New Name',
        items: ListToAdd.items,
      });

      expect(result.status).toContain('DataLibraryAPI error');
      expect(result.lists).toBeUndefined();
    });
  });

  describe('deleteList', () => {
    it('should delete a list successfully', async () => {
      server.use(
        http.delete(`${GEN3_DATA_LIBRARY_API}/list-id-1`, () => {
          return new HttpResponse(null, { status: 204 });
        }),
      );

      const result = await apiService.deleteList('list-id-1');
      expect(result.status).toBe('success');
    });

    it('should handle API errors when deleting a list', async () => {
      server.use(
        http.delete(`${GEN3_DATA_LIBRARY_API}/invalid-id`, () => {
          new HttpResponse('Not found', {
            status: 404,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }),
      );

      const result = await apiService.deleteList('invalid-id');

      expect(result.isError).toBe(true);
      expect(result.status).toContain('DataLibraryAPI error');
      expect(result.lists).toBeUndefined();
    });
  });

  describe('clearLists', () => {
    it('should clear all lists successfully', async () => {
      server.use(
        http.delete(`${GEN3_DATA_LIBRARY_API}`, () => {
          return new HttpResponse(null, {
            status: 204,
          });
        }),
      );

      const result = await apiService.clearLists();

      expect(result.status).toBe('success');
    });

    it('should handle API errors when clearing lists', async () => {
      server.use(
        http.delete(`${GEN3_DATA_LIBRARY_API}`, () => {
          new HttpResponse('Server Error', {
            status: 500,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }),
      );

      const result = await apiService.clearLists();

      expect(result.isError).toBe(true);
      expect(result.status).toContain('DataLibraryAPI error');
      expect(result.lists).toBeUndefined();
    });
  });

  describe('setAllLists', () => {
    it('should set all lists successfully', async () => {
      const listsToSet: Array<DatalistAsAPIItems> = [ListToAdd, SecondList];

      server.use(
        http.post(`${GEN3_DATA_LIBRARY_API}`, () => {
          return new HttpResponse(null, {
            status: 204,
          });
        }),
      );
      const result = await apiService.setAllLists(listsToSet);
      expect(result.status).toBe('success');
    });

    it('should handle API errors when setting all lists', async () => {
      server.use(
        http.post(`${GEN3_DATA_LIBRARY_API}`, () => {
          new HttpResponse('Server Error', {
            status: 500,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }),
      );

      const result = await apiService.setAllLists([ListToAdd]);

      expect(result.isError).toBe(true);
      expect(result.status).toContain('DataLibraryAPI error');
      expect(result.lists).toBeUndefined();
    });
  });

  describe('getList', () => {
    it('should get a specific list successfully', async () => {
      server.use(
        http.get(`${GEN3_DATA_LIBRARY_API}/test-list`, () => {
          return HttpResponse.json({
            lists: {
              name: 'test-list',
              items: ListToAdd.items,
            },
          });
        }),
      );

      const result = await apiService.getList('test-list');

      expect(result.status).toBe('success');
      expect(result.lists).toBeDefined();
    });

    it('should handle API errors when getting a specific list', async () => {
      server.use(
        http.get(`${GEN3_DATA_LIBRARY_API}/invalid-id`, () => {
          return HttpResponse.json(
            { message: 'Not Found' },
            {
              status: 404,
            },
          );
        }),
      );

      const result = await apiService.getList('invalid-id');

      expect(result.isError).toBe(true);
      expect(result.status).toBe('Not Found');
      expect(result.lists).toBeUndefined();
    });

    it('should handle invalid response data', async () => {
      server.use(
        http.get(`${GEN3_DATA_LIBRARY_API}/list-id-1`, () => {
          new HttpResponse('Server Error', {
            status: 500,
            headers: {
              'Content-Type': 'text/plain',
            },
          });
        }),
      );

      const result = await apiService.getList('list-id-1');

      expect(result.isError).toBe(true);
      expect(result.status).toBe('Unknown Error');
      expect(result.lists).toBeUndefined();
    });
  });
});
