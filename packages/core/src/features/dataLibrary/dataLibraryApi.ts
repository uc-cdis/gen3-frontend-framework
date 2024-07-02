import { gen3Api } from '../gen3';
import { GEN3_DATA_LIBRARY_API } from '../../constants';
import {
  DataLibrary,
  DataList,
  ListItemDefinition,
  DataLibraryAPIResponse,
} from './types';
import { BuildLists } from './utils';

interface AddUpdateListParams {
  id: string;
  list: ListItemDefinition;
}

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
    getDataLibraryLists: builder.query<DataLibrary, void>({
      query: () => `${GEN3_DATA_LIBRARY_API}`,
      transformResponse: (res: DataLibraryAPIResponse) => BuildLists(res),
    }),
    getDataLibraryList: builder.query<DataList, string>({
      query: (id: string) => `${GEN3_DATA_LIBRARY_API}/${id}`,
      transformResponse: (res: DataLibraryAPIResponse) =>
        BuildLists(res)?.lists,
    }),
    addDataLibraryLists: builder.mutation<
      void,
      Record<string, ListItemDefinition>
    >({
      query: (lists) => ({
        url: `${GEN3_DATA_LIBRARY_API}`,
        method: 'POST',
        body: lists,
      }),
      invalidatesTags: [TAGS],
    }),
    addDataLibraryList: builder.mutation<void, AddUpdateListParams>({
      query: ({ id, list }) => ({
        url: `${GEN3_DATA_LIBRARY_API}/${id}`,
        method: 'POST',
        body: list,
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
  }),
});

export const {
  useGetDataLibraryListQuery,
  useGetDataLibraryListsQuery,
  useAddDataLibraryListMutation,
  useDeleteDataLibraryListMutation,
  useUpdateDataLibraryListMutation,
} = dataLibraryApi;
