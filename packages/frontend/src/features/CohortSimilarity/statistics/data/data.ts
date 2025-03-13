import { convertToAggregateData } from './utils';

export const getStaticSimilarityData = (dataset: string) => {
  return convertToAggregateData({
    census: {
      age_at_index: {
        '0-4 Years': 6,
        '5-11 Years': 8.7,
        '12-15 Years': 5.1,
        '16-17 Years': 2.5,
        '18-29 Years': 16.4,
        '30-39 Years': 13.5,
        '40-49 Years': 12.3,
        '50-64 Years': 19.2,
        '65-74 Years': 9.6,
        '75-84 Years': 4.9,
        '85-89 Years': 2,
      },
      race: {
        White: 61.6315330007,
        'Black or African American': 12.4013544021,
        Asian: 5.9997260938,
        Other: 18.6347237845,
        'American Indian or Alaska Native': 1.1244963298,
        'Native Hawaiian or Other Pacific Islander': 0.2081663891,
        'Not Reported': 0,
      },
      ethnicity: {
        'Hispanic or Latino': 18.7298774077,
        'Not Hispanic or Latino': 81.2701225923,
        'Not Reported': 0,
      },
      sex: {
        Female: 50.75,
        Male: 49.25,
        'Not Reported': 0,
      },
      race_and_ethnicity: {
        'Hispanic or Latino': 18.45,
        'American Indian or Alaska Native, Not Hispanic or Latino': 0.74,
        'Asian, Not Hispanic or Latino': 5.76,
        'Black, Not Hispanic or Latino': 12.54,
        'Native Hawaiian or Other Pacific Islander, Not Hispanic or Latino': 0.182,
        'White, Not Hispanic or Latino': 60.11,
        'Multiple or Other, Not Hispanic or Latino': 2.22,
        'Not Reported': 0,
      },
    },
  })[dataset];
};
