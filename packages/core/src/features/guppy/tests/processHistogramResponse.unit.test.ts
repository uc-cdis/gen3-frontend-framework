//import diveristyData from './diversityResponse.json';

// Import all required packages
import { processHistogramResponseAsPercentage } from '../guppySlice';

// Define a type for HistogramDataArray
type HistogramDataArray = Array<{ key: string; doc_count: number }>;

// Define a type for AggregationsData
type AggregationsData = Record<string, HistogramDataArray>;

// Define the test
describe('Testing the processHistogramResponseAsPercentage function', () => {
  it('Should correctly process data', () => {
    // Example data to be supplied to the function
    const data: Record<string, any> = {
      histogram: [
        { key: 'key1', doc_count: 10 },
        { key: 'key2', doc_count: 20 },
      ],
    };

    // Expected result
    const expectedResult: AggregationsData = {
      key1: [{ key: 'key1', doc_count: 10 }],
      key2: [{ key: 'key2', doc_count: 20 }],
    };

    // Call the function with the data
    const result = processHistogramResponseAsPercentage(data);

    // Ensure the function's output matches the expected result
    expect(result).toEqual(expectedResult);
  });
});
