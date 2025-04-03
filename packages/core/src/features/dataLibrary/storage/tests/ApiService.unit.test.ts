import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  APIStorageService,
  fetchFromDataLibraryAPI,
} from '../APIStorageService';
import { GEN3_API, GEN3_DATA_LIBRARY_API } from '../../../../constants';
import { APIListData } from './data';

console.log('GEN3_API: ', GEN3_API);

jest.mock('@reduxjs/toolkit', () => {
  const actualToolkit = jest.requireActual('@reduxjs/toolkit');
  let counter = 0;
  return {
    ...actualToolkit,
    nanoid: jest.fn(() => `mocked-nanoid-${counter++}`),
  };
});

const mockSuccessResponse = {
  lists: {
    'list-id-1': {
      id: 'list-id-1',
      name: 'Test List 1',
      items: {
        'item-1': { id: 'item-1', name: 'Item 1' },
      },
    },
    'list-id-2': {
      id: 'list-id-2',
      name: 'Test List 2',
      items: {
        'item-2': { id: 'item-2', name: 'Item 2' },
      },
    },
  },
};
const csrfData = {
  message: 'Feelin good!', // User message
  csrf: '11ff0e613e5c782d5cf29c5b565be2258880.0002025-03-26T22:32:39+00:00', // CSRF token
};

// Set up MSW server
const server = setupServer(
  // GET /lists endpoint

  http.get(`${GEN3_API}/_status`, () => {
    return HttpResponse.json(csrfData);
  }),
);
//
// // GET /:id endpoint
//http.get(`${GEN3_DATA_LIBRARY_API}/:id`, () => {
//   const { id } = req.params;
//
//   if (id === 'list-id-1') {
//     return res(
//       ctx.status(200),
//       ctx.json({
//         lists: {
//           'list-id-1': mockSuccessResponse.lists['list-id-1'],
//         },
//       }),
//     );
//   }
//
//   return res(ctx.status(404), ctx.json({ message: 'List not found' }));
// }),
//
// // PUT /lists endpoint (add list)
//http.put(`${GEN3_DATA_LIBRARY_API}/lists`, async () => {
//   const body = await req.json();
//
//   return res(
//     ctx.status(200),
//     ctx.json({
//       lists: {
//         ...mockSuccessResponse.lists,
//         [body.id]: body,
//       },
//     }),
//   );
// }),
//
// // PUT /:id endpoint (update list)
//http.put(`${GEN3_DATA_LIBRARY_API}/:id`, async () => {
//   const { id } = req.params;
//   const body = await req.json();
//
//   if (id === body.id) {
//     return res(
//       ctx.status(200),
//       ctx.json({
//         lists: {
//           ...mockSuccessResponse.lists,
//           [id]: body,
//         },
//       }),
//     );
//   }
//
//   return res(ctx.status(400), ctx.json({ message: 'Invalid request' }));
// }),
//
// // DELETE /:id endpoint
//http.delete(`${GEN3_DATA_LIBRARY_API}/:id`, () => {
//   const { id } = req.params;
//
//   if (mockSuccessResponse.lists[id as string]) {
//     const updatedLists = { ...mockSuccessResponse.lists };
//     delete updatedLists[id as string];
//
//     return res(
//       ctx.status(200),
//       ctx.json({
//         lists: updatedLists,
//       }),
//     );
//   }
//
//   return res(ctx.status(404), ctx.json({ message: 'List not found' }));
// }),
//
// // DELETE endpoint (clear all lists)
//http.delete(`${GEN3_DATA_LIBRARY_API}`, () => {
//   return res(ctx.status(200), ctx.json({ lists: {} }));
// }),
//
// // POST endpoint (set all lists)
//http.post(`${GEN3_DATA_LIBRARY_API}`, async () => {
//   const body = await req.json();
//
//   return res(
//     ctx.status(200),
//     ctx.json({
//       lists: body.lists.reduce((acc: any, list: any) => {
//         acc[list.id] = list;
//         return acc;
//       }, {}),
//     }),
//   );
// }),

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
          return HttpResponse.json({ lists: APIListData });
        }),
      );

      const result = await apiService.getLists();

      expect(result.isError).toBeUndefined();
      expect(result.status).toBe('success');
      expect(result.lists).toEqual(APIListData);
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

  // describe('addList', () => {
  //   it('should add a list successfully', async () => {
  //     const result = await apiService.addList(ListToAdd);
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toBeDefined();
  //     // The generated ID will be random due to nanoid, so we can't check the exact value
  //     const listsObject = result.lists as any;
  //     expect(Object.values(listsObject).length).toBeGreaterThan(
  //       Object.values(mockSuccessResponse.lists).length - 1,
  //     );
  //   });
  //
  //   it('should handle API errors when adding a list', async () => {
  //     server.use(
  //      http.put(`${GEN3_DATA_LIBRARY_API}/lists`, () => {
  //         return res(ctx.status(500), ctx.json({ message: 'Server error' }));
  //       }),
  //     );
  //
  //     const result = await apiService.addList(ListToAdd);
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toContain('DataLibraryAPI error');
  //     expect(result.lists).toBeUndefined();
  //   });
  // });
  //
  // describe('updateList', () => {
  //   it('should update a list successfully', async () => {
  //     const updatedList = {
  //       id: 'list-id-1',
  //       name: 'Updated List Name',
  //       items: mockSuccessResponse.lists['list-id-1'].items,
  //     };
  //
  //     const result = await apiService.updateList(updatedList);
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toBeDefined();
  //   });
  //
  //   it('should handle API errors when updating a list', async () => {
  //     server.use(
  //      http.put(`${GEN3_DATA_LIBRARY_API}/invalid-id`, () => {
  //         return res(ctx.status(404), ctx.json({ message: 'List not found' }));
  //       }),
  //     );
  //
  //     const result = await apiService.updateList({
  //       id: 'invalid-id',
  //       name: 'New Name',
  //     });
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toContain('DataLibraryAPI error');
  //     expect(result.lists).toBeUndefined();
  //   });
  // });
  //
  // describe('deleteList', () => {
  //   it('should delete a list successfully', async () => {
  //     const result = await apiService.deleteList('list-id-1');
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toBeDefined();
  //     const listsObject = result.lists as any;
  //     expect(listsObject['list-id-1']).toBeUndefined();
  //   });
  //
  //   it('should handle API errors when deleting a list', async () => {
  //     server.use(
  //      http.delete(`${GEN3_DATA_LIBRARY_API}/nonexistent`, () => {
  //         return res(ctx.status(404), ctx.json({ message: 'List not found' }));
  //       }),
  //     );
  //
  //     const result = await apiService.deleteList('nonexistent');
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toContain('DataLibraryAPI error');
  //     expect(result.lists).toBeUndefined();
  //   });
  // });
  //
  // describe('clearLists', () => {
  //   it('should clear all lists successfully', async () => {
  //     const result = await apiService.clearLists();
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toEqual({});
  //   });
  //
  //   it('should handle API errors when clearing lists', async () => {
  //     server.use(
  //      http.delete(`${GEN3_DATA_LIBRARY_API}`, () => {
  //         return res(ctx.status(500), ctx.json({ message: 'Server error' }));
  //       }),
  //     );
  //
  //     const result = await apiService.clearLists();
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toContain('DataLibraryAPI error');
  //     expect(result.lists).toBeUndefined();
  //   });
  // });
  //
  // describe('setAllLists', () => {
  //   it('should set all lists successfully', async () => {
  //     const listsToSet = [ListToAdd, SecondList];
  //
  //     const result = await apiService.setAllLists(listsToSet);
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toBeDefined();
  //   });
  //
  //   it('should handle API errors when setting all lists', async () => {
  //     server.use(
  //      http.post(`${GEN3_DATA_LIBRARY_API}`, () => {
  //         return res(ctx.status(500), ctx.json({ message: 'Server error' }));
  //       }),
  //     );
  //
  //     const result = await apiService.setAllLists([ListToAdd]);
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toContain('DataLibraryAPI error');
  //     expect(result.lists).toBeUndefined();
  //   });
  // });
  //
  // describe('getList', () => {
  //   it('should get a specific list successfully', async () => {
  //     const result = await apiService.getList('list-id-1');
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toBeDefined();
  //     const listsObject = result.lists as any;
  //     expect(listsObject['list-id-1']).toEqual(
  //       mockSuccessResponse.lists['list-id-1'],
  //     );
  //   });
  //
  //   it('should handle API errors when getting a specific list', async () => {
  //     const result = await apiService.getList('nonexistent');
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toBe('Not Found');
  //     expect(result.lists).toBeUndefined();
  //   });
  //
  //   it('should handle invalid response data', async () => {
  //     server.use(
  //      http.get(`${GEN3_DATA_LIBRARY_API}/list-id-1`, () => {
  //         return res(ctx.status(200), ctx.json({ invalidData: true }));
  //       }),
  //     );
  //
  //     const result = await apiService.getList('list-id-1');
  //
  //     expect(result.isError).toBe(true);
  //     expect(result.status).toBe('Unknown error');
  //     expect(result.lists).toBeUndefined();
  //   });
  // });
  //
  // // Custom implementation tests
  // describe('with custom base URL', () => {
  //   const customBaseUrl = 'https://custom-api.example.com';
  //   let customApiService: APIStorageService;
  //
  //   beforeEach(() => {
  //     customApiService = new APIStorageService(customBaseUrl);
  //
  //     // Update handlers for custom base URL
  //     server.use(
  //      http.get(`${customBaseUrl}/lists`, () => {
  //         return res(ctx.status(200), ctx.json(mockSuccessResponse));
  //       }),
  //     );
  //   });
  //
  //   it('should use custom base URL when fetching lists', async () => {
  //     const result = await customApiService.getLists();
  //
  //     expect(result.status).toBe('success');
  //     expect(result.lists).toEqual(mockSuccessResponse.lists);
  //   });
  // });
});
