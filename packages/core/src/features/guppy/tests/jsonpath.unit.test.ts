import { describe, it } from '@jest/globals';
import { JSONPath } from 'jsonpath-plus';
import { AggregationsData } from '../../../types';

const histogramData = {
  programs_name: {
    histogram: [
      {
        key: 'tutorial',
        count: 7518,
      },
      {
        key: 'idc',
        count: -1,
      },
    ],
  },
  project_id: {
    histogram: [
      {
        key: 'tutorial-synthetic_data_set_open_access_1',
        count: 2504,
      },
      {
        key: 'tutorial-synthetic_data_set_controlled_access_1',
        count: 2504,
      },
      {
        key: 'tutorial-synthetic_data_set_1',
        count: 2504,
      },
      {
        key: 'tutorial-study_level_test_1',
        count: -1,
      },
      {
        key: 'idc-tcia-tcga-read',
        count: -1,
      },
    ],
  },
  consent_codes: {
    histogram: [
      {
        key: 'open',
        count: 5011,
      },
      {
        key: 'controlled',
        count: 2510,
      },
    ],
  },
  studies_submitter_id: {
    histogram: [
      {
        key: 'public',
        count: 2504,
      },
      {
        key: 'open',
        count: 2504,
      },
      {
        key: 'controlled',
        count: 2504,
      },
      {
        key: 'study_level_test_1',
        count: -1,
      },
      {
        key: 'tcia-tcga-read',
        count: -1,
      },
    ],
  },
  geographic_site: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  data_type: {
    histogram: [
      {
        key: 'Simple Germline Variation',
        count: 2504,
      },
      {
        key: 'Aligned Reads',
        count: 2504,
      },
      {
        key: 'TXT',
        count: -1,
      },
      {
        key: 'Imaging File Reference',
        count: -1,
      },
      {
        key: 'Imaging File',
        count: -1,
      },
      {
        key: 'no data',
        count: 4968,
      },
    ],
  },
  data_format: {
    histogram: [
      {
        key: 'VCF',
        count: 2504,
      },
      {
        key: 'CRAM',
        count: 2504,
      },
      {
        key: 'TXT',
        count: -1,
      },
      {
        key: 'TSV',
        count: -1,
      },
      {
        key: 'NIFTI',
        count: -1,
      },
      {
        key: 'no data',
        count: 4968,
      },
    ],
  },
  annotated_sex: {
    histogram: [
      {
        key: 'female',
        count: 3813,
      },
      {
        key: 'male',
        count: 3699,
      },
      {
        key: 'no data',
        count: -1,
      },
    ],
  },
  race: {
    histogram: [
      {
        key: '["asian"]',
        count: 2979,
      },
      {
        key: '["black or african american"]',
        count: 1983,
      },
      {
        key: '["white"]',
        count: 1509,
      },
      {
        key: '["hispanic"]',
        count: 1041,
      },
      {
        key: 'no data',
        count: -1,
      },
    ],
  },
  ethnicity: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  hispanic_subgroup: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  subcohort: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  current_smoker_baseline: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  ever_smoker_baseline: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  fasting_lipids: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  lipid_lowering_medication: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  carotid_plaque: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  carotid_stenosis: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  antihypertensive_meds: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  vte_case_status: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
  vte_prior_history: {
    histogram: [
      {
        key: 'no data',
        count: 7521,
      },
    ],
  },
};

const results = {
  programs_name: [
    {
      key: 'tutorial',
      count: 7518,
    },
    {
      key: 'idc',
      count: -1,
    },
  ],
  project_id: [
    {
      key: 'tutorial-synthetic_data_set_open_access_1',
      count: 2504,
    },
    {
      key: 'tutorial-synthetic_data_set_controlled_access_1',
      count: 2504,
    },
    {
      key: 'tutorial-synthetic_data_set_1',
      count: 2504,
    },
    {
      key: 'tutorial-study_level_test_1',
      count: -1,
    },
    {
      key: 'idc-tcia-tcga-read',
      count: -1,
    },
  ],
  consent_codes: [
    {
      key: 'open',
      count: 5011,
    },
    {
      key: 'controlled',
      count: 2510,
    },
  ],
  studies_submitter_id: [
    {
      key: 'public',
      count: 2504,
    },
    {
      key: 'open',
      count: 2504,
    },
    {
      key: 'controlled',
      count: 2504,
    },
    {
      key: 'study_level_test_1',
      count: -1,
    },
    {
      key: 'tcia-tcga-read',
      count: -1,
    },
  ],
  geographic_site: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  data_type: [
    {
      key: 'Simple Germline Variation',
      count: 2504,
    },
    {
      key: 'Aligned Reads',
      count: 2504,
    },
    {
      key: 'TXT',
      count: -1,
    },
    {
      key: 'Imaging File Reference',
      count: -1,
    },
    {
      key: 'Imaging File',
      count: -1,
    },
    {
      key: 'no data',
      count: 4968,
    },
  ],
  data_format: [
    {
      key: 'VCF',
      count: 2504,
    },
    {
      key: 'CRAM',
      count: 2504,
    },
    {
      key: 'TXT',
      count: -1,
    },
    {
      key: 'TSV',
      count: -1,
    },
    {
      key: 'NIFTI',
      count: -1,
    },
    {
      key: 'no data',
      count: 4968,
    },
  ],
  annotated_sex: [
    {
      key: 'female',
      count: 3813,
    },
    {
      key: 'male',
      count: 3699,
    },
    {
      key: 'no data',
      count: -1,
    },
  ],
  race: [
    {
      key: '["asian"]',
      count: 2979,
    },
    {
      key: '["black or african american"]',
      count: 1983,
    },
    {
      key: '["white"]',
      count: 1509,
    },
    {
      key: '["hispanic"]',
      count: 1041,
    },
    {
      key: 'no data',
      count: -1,
    },
  ],
  ethnicity: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  hispanic_subgroup: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  subcohort: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  current_smoker_baseline: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  ever_smoker_baseline: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  fasting_lipids: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  lipid_lowering_medication: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  carotid_plaque: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  carotid_stenosis: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  antihypertensive_meds: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  vte_case_status: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
  vte_prior_history: [
    {
      key: 'no data',
      count: 7521,
    },
  ],
};

describe('test json path plus with hisogram', () => {
  it('should return histogram data with correct facet value', () => {
    const valueData = JSONPath({
      json: histogramData,
      path: '$..histogram',
      resultType: 'value',
    });

    const pointerData = JSONPath({
      json: histogramData,
      path: '$..histogram',
      resultType: 'pointer',
    });

    //  const pointer = JSONPath.toPointer(pathData);
    const processedResults = pointerData.reduce(
      (acc: AggregationsData, element: Record<string, any>, idx: number) => {
        const key = element
          .slice(1)
          .replace(/\/histogram/g, '')
          .replace(/\//g, '.');
        return {
          ...acc,
          [key]: valueData[idx],
        };
      },
      {} as AggregationsData,
    );
    expect(processedResults).toEqual(results);
  });
});
