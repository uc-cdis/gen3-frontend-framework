import { processHistogramResponse } from '../guppySlice'; // Adjust the import path as needed
import { AggregationsData } from '../../../types'; // Adjust the import path as needed

describe('processHistogramResponse', () => {
  it('should process a simple histogram response', () => {
    const input = {
      field1: {
        histogram: [
          { key: 'value1', count: 10 },
          { key: 'value2', count: 20 },
        ],
      },
    };

    const expected: AggregationsData = {
      field1: [
        { key: 'value1', count: 10 },
        { key: 'value2', count: 20 },
      ],
    };

    expect(processHistogramResponse(input)).toEqual(expected);
  });

  it('should process a nested histogram response', () => {
    const input = {
      category: {
        subcategory: {
          field2: {
            histogram: [
              { key: 'a', count: 5 },
              { key: 'b', count: 15 },
            ],
          },
        },
      },
    };

    const expected: AggregationsData = {
      'category.subcategory.field2': [
        { key: 'a', count: 5 },
        { key: 'b', count: 15 },
      ],
    };

    expect(processHistogramResponse(input)).toEqual(expected);
  });

  it('should handle multiple fields in the response', () => {
    const input = {
      field1: {
        histogram: [{ key: 'x', count: 1 }],
      },
      field2: {
        histogram: [{ key: 'y', count: 2 }],
      },
    };

    const expected: AggregationsData = {
      field1: [{ key: 'x', count: 1 }],
      field2: [{ key: 'y', count: 2 }],
    };

    expect(processHistogramResponse(input)).toEqual(expected);
  });

  it('should return an empty object for empty input', () => {
    const input = {};
    const expected: AggregationsData = {};

    expect(processHistogramResponse(input)).toEqual(expected);
  });

  it('should handle inputs without histogram data', () => {
    const input = {
      field1: {
        otherData: 'some value',
      },
    };

    const expected: AggregationsData = {};

    expect(processHistogramResponse(input)).toEqual(expected);
  });

  it('should handle a real payload', () => {
    const input = {
      demographic: {
        histogram: [
          {
            key: 'Female',
            count: 39872,
          },
          {
            key: 'Male',
            count: 37645,
          },
          {
            key: 'Undisclosed',
            count: 18,
          },
          {
            key: 'no data',
            count: 7103,
          },
        ],
      },
      ancestral_background: {
        histogram: [
          {
            key: 'European',
            count: 38215,
          },
          {
            key: 'African',
            count: 23518,
          },
          {
            key: 'Undisclosed',
            count: 6329,
          },
          {
            key: 'Asian',
            count: 3984,
          },
          {
            key: 'Mixed Heritage',
            count: 2234,
          },
          {
            key: 'Indigenous American',
            count: 192,
          },
          {
            key: 'Pacific Region',
            count: 179,
          },
          {
            key: 'no data',
            count: 9604,
          },
        ],
      },
      cultural_identity: {
        histogram: [
          {
            key: 'Non-Latino',
            count: 61738,
          },
          {
            key: 'Undisclosed',
            count: 7582,
          },
          {
            key: 'Latino',
            count: 6125,
          },
          {
            key: 'no data',
            count: 7810,
          },
        ],
      },
      age_group: {
        histogram: [
          {
            key: [0, 92],
            count: 73461,
          },
        ],
      },
      entry_point: {
        histogram: [
          {
            key: 'Viral Test',
            count: 67923,
          },
          {
            key: 'Post-COVID Syndrome',
            count: 687,
          },
          {
            key: 'Cohort Inclusion',
            count: 541,
          },
          {
            key: 'no data',
            count: 14104,
          },
        ],
      },
    };

    const expected = {
      age_group: [
        {
          count: 73461,
          key: [0, 92],
        },
      ],
      ancestral_background: [
        {
          count: 38215,
          key: 'European',
        },
        {
          count: 23518,
          key: 'African',
        },
        {
          count: 6329,
          key: 'Undisclosed',
        },
        {
          count: 3984,
          key: 'Asian',
        },
        {
          count: 2234,
          key: 'Mixed Heritage',
        },
        {
          count: 192,
          key: 'Indigenous American',
        },
        {
          count: 179,
          key: 'Pacific Region',
        },
        {
          count: 9604,
          key: 'no data',
        },
      ],
      cultural_identity: [
        {
          count: 61738,
          key: 'Non-Latino',
        },
        {
          count: 7582,
          key: 'Undisclosed',
        },
        {
          count: 6125,
          key: 'Latino',
        },
        {
          count: 7810,
          key: 'no data',
        },
      ],
      demographic: [
        {
          count: 39872,
          key: 'Female',
        },
        {
          count: 37645,
          key: 'Male',
        },
        {
          count: 18,
          key: 'Undisclosed',
        },
        {
          count: 7103,
          key: 'no data',
        },
      ],
      entry_point: [
        {
          count: 67923,
          key: 'Viral Test',
        },
        {
          count: 687,
          key: 'Post-COVID Syndrome',
        },
        {
          count: 541,
          key: 'Cohort Inclusion',
        },
        {
          count: 14104,
          key: 'no data',
        },
      ],
    };

    expect(processHistogramResponse(input)).toEqual(expected);
  });
});
