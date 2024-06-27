import { gen3Api } from '../gen3';
import { GEN3_DATA_LIBRARY_API } from '../../constants';
import { DataLibrary, DataList, ListItemDefinition } from './types';

interface AddUpdateListParams {
  id: string;
  list: DataList;
}

const TAGS = 'dataLibrary';

export const dataLibraryTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

/**
 */
export const dataLibraryApi = dataLibraryTags.injectEndpoints({
  endpoints: (builder) => ({
    getLists: builder.query<DataLibrary, void>({
      query: () => `${GEN3_DATA_LIBRARY_API}/lists`,
    }),
    getList: builder.query<DataList, string>({
      query: (id: string) => `${GEN3_DATA_LIBRARY_API}/lists/${id}`,
    }),
    addLists: builder.mutation<void, Record<string, ListItemDefinition>>({
      query: (lists) => ({
        url: `${GEN3_DATA_LIBRARY_API}/lists`,
        method: 'POST',
        body: lists,
      }),
      invalidatesTags: [TAGS],
    }),
    addList: builder.mutation<void, AddUpdateListParams>({
      query: ({ id, list }) => ({
        url: `${GEN3_DATA_LIBRARY_API}/lists/${id}`,
        method: 'POST',
        body: list,
      }),
      invalidatesTags: [TAGS],
    }),
    updateList: builder.mutation<void, AddUpdateListParams>({
      query: ({ id, list }) => ({
        url: `${GEN3_DATA_LIBRARY_API}/lists/${id}`,
        method: 'PATCH',
        body: list,
      }),
      invalidatesTags: [TAGS],
    }),
    deleteList: builder.mutation<void, string>({
      query: (id) => ({
        url: `${GEN3_DATA_LIBRARY_API}/lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [TAGS],
    }),
  }),
});

export const {
  useGetListQuery,
  useGetListsQuery,
  useAddListMutation,
  useDeleteListMutation,
  useUpdateListMutation,
} = dataLibraryApi;
