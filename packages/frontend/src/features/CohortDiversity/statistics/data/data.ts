import { convertToAggregateData } from './utils';

export const getDiversityData = () =>
  convertToAggregateData({
    census: {
      'Age at Index': {
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
        '85+ Years': 2,
      },
      Race: {
        'American Indian or Alaska Native': 1.1244963298,
        Asian: 5.9997260938,
        Black: 12.4013544021,
        'Native Hawaiian or Other Pacific Islander': 0.2081663891,
        White: 61.6315330007,
        'Multiple or Other': 18.6347237845,
        'Not reported': 0,
      },
      Ethnicity: {
        'Hispanic or Latino': 18.7298774077,
        'Not Hispanic or Latino': 81.2701225923,
        'Not reported': 0,
      },
      Sex: {
        Female: 50.75,
        Male: 49.25,
        'Not reported': 0,
      },
      'Race and Ethnicity': {
        'Hispanic or Latino': 18.45,
        'American Indian or Alaska Native, Not Hispanic or Latino': 0.74,
        'Asian, Not Hispanic or Latino': 5.76,
        'Black, Not Hispanic or Latino': 12.54,
        'Native Hawaiian or Other Pacific Islander, Not Hispanic or Latino': 0.182,
        'White, Not Hispanic or Latino': 60.11,
        'Multiple or Other, Not Hispanic or Latino': 2.22,
        'Not reported': 0,
      },
    },
    MIDRC: {
      'Age at Index': {
        '50-64 Years': 25.9889610654,
        '65-74 Years': 17.3029197575,
        '85+ Years': 15.5304519996,
        '75-84 Years': 11.8539714398,
        '40-49 Years': 11.2721897503,
        '30-39 Years': 9.4020803103,
        '18-29 Years': 6.8023705231,
        '0-4 Years': 0.7702843814,
        '5-11 Years': 0.4176894181,
        '16-17 Years': 0.3295406773,
        '12-15 Years': 0.3295406773,
      },
      Race: {
        White: 50.9879561988,
        Black: 31.3229956108,
        'Not reported': 8.8726212354,
        Asian: 5.3339003387,
        'Multiple or Other': 2.9858906793,
        'American Indian or Alaska Native': 0.2566711723,
        'Native Hawaiian or Other Pacific Islander': 0.2399647647,
      },
      Ethnicity: {
        'Not Hispanic or Latino': 81.65081814,
        'Not reported': 10.3354151523,
        'Hispanic or Latino': 8.0137667077,
      },
      Sex: {
        Female: 50.9041819342,
        Male: 49.0661484372,
        'Not reported': 0.0296696287,
      },
    },
  });
