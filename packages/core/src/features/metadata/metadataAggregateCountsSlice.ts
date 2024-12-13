import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JSONPath } from 'jsonpath-plus';
import { AggregationsData, JSONObject } from '../../types';

interface BucketCountsState {
  counts: AggregationsData;
  loading: boolean;
  error: string | null;
  selectedPaths: string[];
}

// Initial state
const initialState: BucketCountsState = {
  counts: {},
  loading: false,
  error: null,
  selectedPaths: [],
};

// Async thunk for generating bucket counts
export const generateBucketCounts = createAsyncThunk(
  'bucketCounts/generate',
  async ({ data, paths }: { data: JSONObject; paths: string | string[] }) => {
    try {
      // Normalize paths to array
      const pathsToProcess = Array.isArray(paths) ? paths : [paths];

      // Initialize results object
      const results: AggregationsData = {};

      pathsToProcess.forEach((path) => {
        // Use JSONPath to extract all values at the given path
        const values = JSONPath({
          path,
          json: data,
          flatten: true,
        });

        // Count occurrences of each value
        // add missing to count null values
        const counts: { [key: string]: number } = {
          _missing: 0,
        };
        values.forEach((value: any) => {
          if (value && value !== '') {
            counts[value] = (counts[value] || 0) + 1;
          } else {
            counts['_missing'] += 1;
          }
        });

        // Convert to required format and sort by count
        // Store results using the path as key
        results[path] = Object.entries(counts)
          .map(([key, count]) => ({
            key,
            count,
          }))
          .sort((a, b) => b.count - a.count);
      });

      return results;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to generate bucket counts',
      );
    }
  },
);

// Slice
const bucketCountsSlice = createSlice({
  name: 'bucketCounts',
  initialState,
  reducers: {
    setMetadataAggregations(state, action: PayloadAction<string[]>) {
      state.selectedPaths = action.payload;
    },
    clearMetadataAggregations(state) {
      state.counts = {};
      state.selectedPaths = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateBucketCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateBucketCounts.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = {
          ...state.counts,
          ...action.payload,
        };
      })
      .addCase(generateBucketCounts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Failed to generate bucket counts';
      });
  },
});

// Actions
export const { setMetadataAggregations, clearMetadataAggregations } =
  bucketCountsSlice.actions;

// Selectors
export const selectBucketCounts = (state: {
  bucketCounts: BucketCountsState;
}) => state.bucketCounts.counts;

// Helper selector to get counts for a specific path
export const selectPathCounts = (
  state: { bucketCounts: BucketCountsState },
  path: string,
) => state.bucketCounts.counts[path] || [];

export default bucketCountsSlice.reducer;
