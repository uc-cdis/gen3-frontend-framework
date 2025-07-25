import { useEffect } from 'react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { FacetDefinition } from './types';
import { CoreDispatch } from '../../store';
import { CoreState } from '../../reducers';
import {
  CoreDataSelector,
  CoreDataSelectorResponse,
  DataStatus,
  UseCoreDataHook,
  UseCoreDataResponse,
} from '../../dataAccess';
import { processDictionaryEntries } from './facetDictionaryApi';
import { useCoreDispatch, useCoreSelector } from '../../hooks';
import { GEN3_SUBMISSION_API } from '../../constants';
import { FetchError } from '../fence';

const buildGraphMappingFetchError = async (
  res: Response,
): Promise<FetchError<unknown>> => {
  return {
    url: res.url,
    status: res.status,
    statusText: res.statusText,
    text: await res.text(),
  };
};

export const fetchFacetDictionary = createAsyncThunk<
  Record<string, FacetDefinition>,
  void,
  { dispatch: CoreDispatch; state: CoreState }
>('facet/fetchFacetDictionary', async () => {
  const res = await fetch(`${GEN3_SUBMISSION_API}/_dictionary/_all/`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  });

  if (res.ok) return res.json();

  throw await buildGraphMappingFetchError(res);
});

export interface FacetDefinitionState {
  readonly status: DataStatus;
  readonly error?: string;
  readonly entries: Record<string, FacetDefinition>;
}

const initialState: FacetDefinitionState = {
  status: 'uninitialized',
  entries: {},
};

const facetDictionary = createSlice({
  name: 'facet/fetchFacetDictionary',
  initialState,
  reducers: {
    resetFacetDictionary: (state) => {
      state.entries = {};
      state.status = 'uninitialized';
    },
    mergeFacetDictionary: (state, action) => {
      const { entries } = action.payload;
      state.entries = {
        ...state.entries,
        ...entries,
      };
    },
    setFacetDictionary: (state, action) => {
      state.entries = action.payload;
      state.status = 'fulfilled';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacetDictionary.fulfilled, (_, action) => {
        const response = action.payload;
        if (response.errors && Object.keys(response.errors).length > 0)
          return {
            entries: {},
            status: 'rejected',
          };

        console.log('processed facets', processDictionaryEntries(response));
        return {
          status: 'fulfilled',
          entries: processDictionaryEntries(response),
        };
      })
      .addCase(fetchFacetDictionary.pending, () => {
        return {
          entries: {},
          status: 'pending',
        };
      })
      .addCase(fetchFacetDictionary.rejected, () => {
        return {
          entries: {},
          status: 'rejected',
        };
      });
  },
});

export const facetDictionaryReducer = facetDictionary.reducer;

export const selectFacetDefinition = (
  state: CoreState,
): CoreDataSelectorResponse<Record<string, FacetDefinition>> => {
  return {
    data: state.facetDictionary.entries,
    status: state.facetDictionary.status,
    error: state.facetDictionary.error,
  };
};

export const selectFacetDefinitionByName = (
  state: CoreState,
  field: string,
): FacetDefinition => {
  return state.facetDictionary.entries?.[field];
};

export const selectFacetDefinitionsByName = (
  state: CoreState,
  fields: ReadonlyArray<string>,
): ReadonlyArray<FacetDefinition> => {
  return fields.flatMap((field) => {
    if (field in state.facetDictionary.entries)
      return [state.facetDictionary.entries[field]];
    else return [];
  });
};

export interface FetchDataActionCreatorNoParameters<A> {
  (): A;
}

const createUseDictionaryHook = <P, A, T>(
  fetchDataActionCreator: FetchDataActionCreatorNoParameters<A>,
  dataSelector: CoreDataSelector<T>,
): UseCoreDataHook<P, T> => {
  return (...params: P[]): UseCoreDataResponse<T> => {
    const coreDispatch = useCoreDispatch();
    const { data, status, error } = useCoreSelector(dataSelector);
    const action = fetchDataActionCreator();

    useEffect(() => {
      if (status === 'uninitialized') {
        coreDispatch(action as any); // eslint-disable-line
      }
    }, [status, coreDispatch, action, params]);

    return {
      data,
      error,
      isUninitialized: status === 'uninitialized',
      isFetching: status === 'pending',
      isSuccess: status === 'fulfilled',
      isError: status === 'rejected',
    };
  };
};

export const useFacetDictionary = createUseDictionaryHook(
  fetchFacetDictionary,
  selectFacetDefinition,
);
