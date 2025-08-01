import {
  processHistogramResponse,
  roundHistogramResponse,
} from '../processing';
import { AggregationsData } from '../../../types';

const HISTOGRAM_DATA_1 = [
  {
    key: 'Boston',
    count: 12,
  },
  {
    key: 'Chicago',
    count: 534,
  },
  {
    key: 'Seattle',
    count: 2033,
  },
];

const HISTOGRAM_DATA_2 = [
  {
    key: 'Chicago',
    count: 904,
  },
  {
    key: 'New York',
    count: 53427,
  },
];

describe('processHistogramResponse for AggregationsData', () => {
  it('should process histogram data from the input object correctly', () => {
    const inputData = {
      data: {
        histogram: HISTOGRAM_DATA_1,
      },
    };
    const expectedOutput = {
      data: HISTOGRAM_DATA_1,
    };

    const result = processHistogramResponse<AggregationsData>(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle nested histogram objects correctly', () => {
    const inputData = {
      outer: {
        inner: {
          histogram: HISTOGRAM_DATA_1,
        },
      },
    };
    const expectedOutput: AggregationsData = {
      'outer.inner': HISTOGRAM_DATA_1,
    };

    const result = processHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle any minimum value correctly', () => {
    const inputData = {
      outer: {
        inner: {
          histogram: HISTOGRAM_DATA_1,
        },
      },
    };
    const expectedOutput: AggregationsData = {
      'outer.inner': HISTOGRAM_DATA_1,
    };

    const result = processHistogramResponse<AggregationsData>(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should return an empty object if no histogram data is present', () => {
    const inputData = {
      data: {
        noHistogram: HISTOGRAM_DATA_1,
      },
    };
    const expectedOutput: AggregationsData = {};

    const result = processHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should correctly process multiple histogram entries in the input', () => {
    const inputData = {
      first: {
        histogram: HISTOGRAM_DATA_1,
      },
      second: {
        histogram: HISTOGRAM_DATA_2,
      },
    };
    const expectedOutput: AggregationsData = {
      first: HISTOGRAM_DATA_1,
      second: HISTOGRAM_DATA_2,
    };

    const result = processHistogramResponse<AggregationsData>(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle an empty input object gracefully', () => {
    const inputData = {};
    const expectedOutput: AggregationsData = {};

    const result = processHistogramResponse<AggregationsData>(inputData);

    expect(result).toEqual(expectedOutput);
  });
});

describe('roundHistogramResponse', () => {
  it('should process histogram data from the input object correctly', () => {
    const inputData = {
      data: {
        histogram: HISTOGRAM_DATA_1,
      },
    };
    const expectedOutput = {
      data: { histogram: HISTOGRAM_DATA_1 },
    };

    const result = roundHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle nested histogram objects correctly', () => {
    const inputData = {
      outer: {
        inner: {
          histogram: HISTOGRAM_DATA_1,
        },
      },
    };
    const expectedOutput = {
      outer: {
        inner: {
          histogram: HISTOGRAM_DATA_1,
        },
      },
    };

    const result = roundHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should return an empty object if no histogram data is present', () => {
    const inputData = {
      data: {
        noHistogram: HISTOGRAM_DATA_1,
      },
    };
    const expectedOutput: AggregationsData = {};

    const result = roundHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should correctly process multiple histogram entries in the input', () => {
    const inputData = {
      first: {
        histogram: HISTOGRAM_DATA_1,
      },
      second: {
        histogram: HISTOGRAM_DATA_2,
      },
    };
    const expectedOutput = {
      first: { histogram: HISTOGRAM_DATA_1 },
      second: { histogram: HISTOGRAM_DATA_2 },
    };

    const result = roundHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });

  it('should handle an empty input object gracefully', () => {
    const inputData = {};
    const expectedOutput: AggregationsData = {};

    const result = roundHistogramResponse(inputData);

    expect(result).toEqual(expectedOutput);
  });
});
