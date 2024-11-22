import { nanoid } from '@reduxjs/toolkit';
import { gen3Api } from '../gen3';
import { GEN3_DATA_LIBRARY_API } from '../../constants';
import {
  AddUpdateListParams,
  DataLibraryItems,
  Datalist,
  LoadAllListData,
  DataLibraryAPIResponse,
} from './types';
import { BuildLists } from './utils';

const TAGS = 'dataLibrary';

export const dataLibraryTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

/**
 * RTKQuery hooks for data-library list CRUD operations.
 * @param getLists returns all the list in the user's data library
 * @param getList args: id returns the list for the given id
 * @param addLists args: Record<string, ListItemDefinition> populates the whole datalibrary
 * @param addList args: id ListItemDefinition creates a new list
 * @param updateList args: id ListItemDefinition updates a list
 * @param deleteList args: id deletes the list by id
 */
export const dataLibraryApi = dataLibraryTags.injectEndpoints({
  endpoints: (builder) => ({
    getDataLibraryLists: builder.query<DataLibraryItems, void>({
      query: () => `${GEN3_DATA_LIBRARY_API}`,
      transformResponse: (res: DataLibraryAPIResponse) => {
        console.log('transformResponse', res);
        const a = BuildLists(res);
        console.log('transformResponse', a);
        return { lists: BuildLists(res) };
      },
    }),
    getDataLibraryList: builder.query<Datalist, string>({
      query: (id: string) => `${GEN3_DATA_LIBRARY_API}/${id}`,
      transformResponse: (res: DataLibraryAPIResponse) =>
        BuildLists(res)?.lists,
    }),
    addAllDataLibraryLists: builder.mutation<void, LoadAllListData>({
      query: (lists) => ({
        url: `${GEN3_DATA_LIBRARY_API}`,
        method: 'POST',
        body: lists,
      }),
      invalidatesTags: [TAGS],
    }),
    addDataLibraryList: builder.mutation<void, Partial<Datalist> | undefined>({
      query: (list) => ({
        url: `${GEN3_DATA_LIBRARY_API}/${nanoid()}`,
        method: 'POST',
        body: list ?? {},
      }),
      invalidatesTags: [TAGS],
    }),
    updateDataLibraryList: builder.mutation<void, AddUpdateListParams>({
      query: ({ id, list }) => ({
        url: `${GEN3_DATA_LIBRARY_API}/${id}`,
        method: 'PATCH',
        body: list,
      }),
      invalidatesTags: [TAGS],
    }),
    deleteDataLibraryList: builder.mutation<void, string>({
      query: (id) => ({
        url: `${GEN3_DATA_LIBRARY_API}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TAGS],
    }),
    deleteAllDataLibrary: builder.mutation<void, void>({
      query: () => ({
        url: `${GEN3_DATA_LIBRARY_API}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TAGS],
    }),
  }),
});

export const {
  useGetDataLibraryListQuery,
  useGetDataLibraryListsQuery,
  useAddDataLibraryListMutation,
  useAddAllDataLibraryListsMutation,
  useDeleteDataLibraryListMutation,
  useDeleteAllDataLibraryMutation,
  useUpdateDataLibraryListMutation,
} = dataLibraryApi;
