import {
  createEntityAdapter,
  EntityState,
  createSlice,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import {
  DataAccessRequest,
  DataAccessRequestStatus,
  CohortId,
  DataAccessRequestUserInformation,
  newDataAccessRequest,
} from './types';
import { AppState } from './appApi';
import { selectAllCohorts } from './CohortManagerSlice';

// Create the entity adapter
export const dataAccessRequestsAdapter = createEntityAdapter<
  DataAccessRequest,
  string
>({
  // Select the id as the primary key
  selectId: (request: DataAccessRequest) => request.id,
  // Optional: Sort by request_datetime descending (newest first)
  sortComparer: (a, b) =>
    new Date(b.request_datetime).getTime() -
    new Date(a.request_datetime).getTime(),
});

type DataAccessRequestState = EntityState<DataAccessRequest, string>;

interface DataAccessRequestForCohort {
  cohortId: CohortId;
  userAccessInformation: DataAccessRequestUserInformation;
}

// Create a slice with reducers
export const dataAccessRequestsSlice = createSlice({
  name: 'dataAccessRequests',
  initialState: dataAccessRequestsAdapter.getInitialState(),
  reducers: {
    addDataAccessRequest: (
      state,
      action: PayloadAction<DataAccessRequestForCohort>,
    ) => {
      const { cohortId, userAccessInformation } = action.payload;

      const dataAccessRequests = newDataAccessRequest(
        userAccessInformation,
        cohortId,
      );
      dataAccessRequestsAdapter.addOne(state, dataAccessRequests);
    },
    // Set a request's status
    setRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: DataAccessRequestStatus }>,
    ) => {
      const { id, status } = action.payload;
      dataAccessRequestsAdapter.updateOne(state, {
        id,
        changes: { status },
      });
    },
  },
});

// Export actions
export const { addDataAccessRequest, setRequestStatus } =
  dataAccessRequestsSlice.actions;

// Export selectors
export const {
  selectAll: selectAllDataAccessRequests,
  selectById: selectDataAccessRequestById,
  selectIds: selectDataAccessRequestIds,
  selectEntities: selectDataAccessRequestEntities,
  selectTotal: selectTotalDataAccessRequests,
} = dataAccessRequestsAdapter.getSelectors(
  (state: AppState) => state.dataAccessRequests,
);

// Additional selectors
export const selectDataAccessRequestsByCohort = (
  state: AppState,
  cohortId: CohortId,
) => {
  return selectAllDataAccessRequests(state).filter(
    (request) => request.cohortId === cohortId,
  );
};

export const selectDataAccessRequestsByStatus = (
  state: AppState,
  status: DataAccessRequestStatus,
) => {
  return selectAllDataAccessRequests(state).filter(
    (request) => request.status === status,
  );
};

export const selectCohortToRequestId = createSelector(
  [selectAllDataAccessRequests],
  (requests) => {
    return requests.reduce<Record<CohortId, string>>((acc, request) => {
      acc[request.cohortId] = request.id;
      return acc;
    }, {});
  },
);

// Export reducer
export const dataAccessRequestsReducer = dataAccessRequestsSlice.reducer;
