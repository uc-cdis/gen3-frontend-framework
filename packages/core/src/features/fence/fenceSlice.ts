import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CoreDispatch } from '../../store';
import { CoreState } from '../../reducers';
import { castDraft } from 'immer';
import { fetchLogin } from './fenceApi';
import type { Gen3FenceResponse, Gen3FenceUserProviders } from './fenceApi';
import { DataStatus, CoreDataSelectorResponse } from '../../dataAccess';
import { selectCSRFToken} from './csrfSlice';

export const fetchLoginProviders = createAsyncThunk<
    Gen3FenceResponse<Gen3FenceUserProviders>,
    string,
    { dispatch: CoreDispatch; state: CoreState }
    >('fence/user/login', async (hostname: string, thunkAPI) => {
        const csrfToken = selectCSRFToken(thunkAPI.getState());
        console.log(csrfToken);
        return await fetchLogin(hostname, csrfToken);
    }
    );

export interface Gen3LoginProviderState extends Gen3FenceUserProviders {
    readonly status: DataStatus;
    readonly error?: string;
}


const initialState: Gen3LoginProviderState = {
    default_provider: { idp:'', desc: '', id: '', name:'', url:'', secondary: false, urls: []},
    providers: [],
    status: 'uninitialized',
    error: undefined
};

const slice = createSlice({
    name: 'facets',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLoginProviders.fulfilled, (state, action) => {
                const response = action.payload;
                if (response.errors) {
                    state = castDraft(initialState);
                    state.status = 'rejected';
                    state.error = response.errors.filters;
                }

                state = { ...response.data, status: 'fulfilled' };
                return state;
            })
            .addCase(fetchLoginProviders.pending, (state ) => {
                state.status =  'pending';
            })
            .addCase(fetchLoginProviders.rejected, (state) => {
                state.status =  'rejected';
                }
            );
    },
});

export const loginProvidersReducer = slice.reducer;

export const selectLoginProvidersState = (state: CoreState): Gen3LoginProviderState => state.fence;

export const selectLoginProvidersData = (
    state: CoreState,
): CoreDataSelectorResponse<Gen3FenceUserProviders> => {
    return {
        data: {
            default_provider: state.fence.default_provider,
            providers: state.fence.providers
        },
        status: state.fence.status,
        error: state.fence.error,
    };
};
