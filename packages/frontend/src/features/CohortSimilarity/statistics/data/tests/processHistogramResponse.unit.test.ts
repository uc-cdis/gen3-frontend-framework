import similarityData from './similarityResponse.json';
import { getStaticSimilarityData } from '../data';
// Import all required packages
import { AggregationsData } from '@gen3/core';
import {
  normalizeAgeOfIndex,
  processHistogramResponseAsPercentage,
  alignData,
} from '../utils';

// Define the test
describe('Testing the processHistogramResponseAsPercentage function', () => {
  it('Should correctly process percentage data', () => {
    const result = processHistogramResponseAsPercentage(similarityData.data);

    const expectedResult: AggregationsData = {
      age_at_index: [
        {
          count: 3.6189318749578017,
          key: '85-89',
        },
        {
          count: 11.834447370197825,
          key: '75-84',
        },
        {
          count: 17.311457700357842,
          key: '65-74',
        },
        {
          count: 26.01444872054554,
          key: '50-64',
        },
        {
          count: 11.280804807237864,
          key: '40-49',
        },
        {
          count: 9.406522179461211,
          key: '30-39',
        },
        {
          count: 6.815204915265681,
          key: '18-29',
        },
        {
          count: 0.32948484234690434,
          key: '16-17',
        },
        {
          count: 0.3281344946323679,
          key: '12-15',
        },
        {
          count: 0.4159070960772399,
          key: '5-11',
        },
        {
          count: 0.7669975018567281,
          key: '0-4',
        },
      ],
      ethnicity: [
        {
          count: 74.32313820808858,
          key: 'Not Hispanic or Latino',
        },
        {
          count: 9.040577948821822,
          key: 'Not Reported',
        },
        {
          count: 7.294578353926136,
          key: 'Hispanic or Latino',
        },
        {
          count: 9.34170548916346,
          key: 'no data',
        },
      ],
      race: [
        {
          count: 45.33387347241915,
          key: 'White',
        },
        {
          count: 27.849571264600637,
          key: 'Black or African American',
        },
        {
          count: 7.5214367699682665,
          key: 'Not Reported',
        },
        {
          count: 4.742421173452164,
          key: 'Asian',
        },
        {
          count: 2.6547836067787456,
          key: 'Other',
        },
        {
          count: 0.22820876375666735,
          key: 'American Indian or Alaska Native',
        },
        {
          count: 0.2133549388967659,
          key: 'Native Hawaiian or other Pacific Islander',
        },
        {
          count: 11.456350010127608,
          key: 'no data',
        },
      ],
      sex: [
        {
          count: 46.581594760650866,
          key: 'Female',
        },
        {
          count: 44.84234690432786,
          key: 'Male',
        },
        {
          count: 0.028357302005266354,
          key: 'Not Reported',
        },
        {
          count: 8.547701033016002,
          key: 'no data',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  it('Should normalize the results', () => {
    const result = processHistogramResponseAsPercentage(similarityData.data);
    const normalized = normalizeAgeOfIndex(result);

    const expectedResult: AggregationsData = {
      age_at_index: [
        {
          count: 3.6189318749578017,
          key: '85-89 Years',
        },
        {
          count: 11.834447370197825,
          key: '75-84 Years',
        },
        {
          count: 17.311457700357842,
          key: '65-74 Years',
        },
        {
          count: 26.01444872054554,
          key: '50-64 Years',
        },
        {
          count: 11.280804807237864,
          key: '40-49 Years',
        },
        {
          count: 9.406522179461211,
          key: '30-39 Years',
        },
        {
          count: 6.815204915265681,
          key: '18-29 Years',
        },
        {
          count: 0.32948484234690434,
          key: '16-17 Years',
        },
        {
          count: 0.3281344946323679,
          key: '12-15 Years',
        },
        {
          count: 0.4159070960772399,
          key: '5-11 Years',
        },
        {
          count: 0.7669975018567281,
          key: '0-4 Years',
        },
      ],
      ethnicity: [
        {
          count: 74.32313820808858,
          key: 'Not Hispanic or Latino',
        },
        {
          count: 9.040577948821822,
          key: 'Not Reported',
        },
        {
          count: 7.294578353926136,
          key: 'Hispanic or Latino',
        },
        {
          count: 9.34170548916346,
          key: 'no data',
        },
      ],
      race: [
        {
          count: 45.33387347241915,
          key: 'White',
        },
        {
          count: 27.849571264600637,
          key: 'Black or African American',
        },
        {
          count: 7.5214367699682665,
          key: 'Not Reported',
        },
        {
          count: 4.742421173452164,
          key: 'Asian',
        },
        {
          count: 2.6547836067787456,
          key: 'Other',
        },
        {
          count: 0.22820876375666735,
          key: 'American Indian or Alaska Native',
        },
        {
          count: 0.2133549388967659,
          key: 'Native Hawaiian or other Pacific Islander',
        },
        {
          count: 11.456350010127608,
          key: 'no data',
        },
      ],
      sex: [
        {
          count: 46.581594760650866,
          key: 'Female',
        },
        {
          count: 44.84234690432786,
          key: 'Male',
        },
        {
          count: 0.028357302005266354,
          key: 'Not Reported',
        },
        {
          count: 8.547701033016002,
          key: 'no data',
        },
      ],
    };

    expect(normalized).toEqual(expectedResult);
  });

  it('Should align the source data with the ground data', () => {
    const result = processHistogramResponseAsPercentage(similarityData.data);
    const normalized = normalizeAgeOfIndex(result);
    const ground = getStaticSimilarityData('census');
    const aligned = alignData(normalized, ground);

    const expectedResult: AggregationsData = {
      age_at_index: [
        {
          count: 0.7669975018567281,
          key: '0-4 Years',
        },
        {
          count: 0.4159070960772399,
          key: '5-11 Years',
        },
        {
          count: 0.3281344946323679,
          key: '12-15 Years',
        },
        {
          count: 0.32948484234690434,
          key: '16-17 Years',
        },
        {
          count: 6.815204915265681,
          key: '18-29 Years',
        },
        {
          count: 9.406522179461211,
          key: '30-39 Years',
        },
        {
          count: 11.280804807237864,
          key: '40-49 Years',
        },
        {
          count: 26.01444872054554,
          key: '50-64 Years',
        },
        {
          count: 17.311457700357842,
          key: '65-74 Years',
        },
        {
          count: 11.834447370197825,
          key: '75-84 Years',
        },
        {
          count: 3.6189318749578017,
          key: '85-89 Years',
        },
      ],
      ethnicity: [
        {
          count: 7.294578353926136,
          key: 'Hispanic or Latino',
        },
        {
          count: 74.32313820808858,
          key: 'Not Hispanic or Latino',
        },
        {
          count: 9.040577948821822,
          key: 'Not Reported',
        },
      ],
      race: [
        {
          count: 45.33387347241915,
          key: 'White',
        },
        {
          count: 27.849571264600637,
          key: 'Black or African American',
        },
        {
          count: 4.742421173452164,
          key: 'Asian',
        },
        {
          count: 2.6547836067787456,
          key: 'Other',
        },
        {
          count: 0.22820876375666735,
          key: 'American Indian or Alaska Native',
        },
        {
          count: 0,
          key: 'Native Hawaiian or Other Pacific Islander',
        },
        {
          count: 7.5214367699682665,
          key: 'Not Reported',
        },
      ],
      sex: [
        {
          count: 46.581594760650866,
          key: 'Female',
        },
        {
          count: 44.84234690432786,
          key: 'Male',
        },
        {
          count: 0.028357302005266354,
          key: 'Not Reported',
        },
      ],
    };

    expect(aligned).toEqual(expectedResult);
  });
});
