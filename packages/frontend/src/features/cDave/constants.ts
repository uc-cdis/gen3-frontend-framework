import { FilterSet } from '@gen3/core';
import { DataDimension } from './types';

export const DEMO_COHORT_FILTERS: FilterSet = {
  mode: 'and',
  root: {
    'cases.project.project_id': {
      operator: 'includes',
      field: 'cases.project.project_id',
      operands: ['TCGA-LGG'],
    },
  },
};

export const DEFAULT_FIELDS = [
  'demographic.gender',
  'demographic.race',
  'demographic.ethnicity',
  'diagnoses.primary_diagnosis',
];

export const CONTINUOUS_FACET_TYPES = [
  'year',
  'years',
  'age',
  'numeric',
  'integer',
  'percent',
  'long',
  'double',
];

export const HIDE_QQ_BOX_FIELDS = [
  'demographic.year_of_birth',
  'demographic.year_of_death',
  'diagnoses.year_of_diagnosis',
  'exposures.tobacco_smoking_onset_year',
  'exposures.tobacco_smoking_quit_year',
];

export const COLOR_MAP: Record<string, string> = {
  demographic: 'plum',
  diagnoses: 'apricot',
  treatments: 'platinum',
  exposures: 'blush',
  other_clinical_attributes: 'gunmetal',
};

// this is done so tailwind loads the classes properly
export const COLOR_CLASS_HOVER_MAP: Record<string, string> = {
  demographic: 'hover:brightness-50',
  diagnoses: 'hover:brightness-50',
  treatments: 'hover:brightness-50',
  exposures: 'hover:brightness-50',
  other_clinical_attributes: 'brightness-50',
};

export const CAPITALIZED_TERMS = [
  'ajcc',
  'uicc',
  'cog',
  'figo',
  'inss',
  'iss',
  'icd',
  'igcccg',
  'bmi',
];

export const SPECIAL_CASE_FIELDS: Record<string, string> = {
  icd_10_code: 'ICD-10 Code',
  days_to_death: 'Time to Death',
  // TODO - remove special case when field is updated
  gender: 'Sex',
};

export const FACET_SORT: Record<string, Array<string>> = {
  demographic: ['gender', 'race', 'ethnicity', 'vital_status', 'days_to_death'],
  diagnoses: [
    'uicc_clinical_stage',
    'uicc_pathologic_stage',
    'primary_diagnosis',
    'synchronous_malignancy',
    'cog_neuroblastoma_risk_group',
    'morphology',
    'tumor_grade',
    'tissue_or_organ_of_origin',
    'site_of_resection_or_biopsy',
    'progression_or_recurrence',
    'days_to_last_follow_up',
  ],
};

export const DATA_DIMENSIONS: Record<
  string,
  { unit: DataDimension; toggleValue?: DataDimension }
> = {
  'diagnoses.age_at_diagnosis': {
    unit: 'Days',
    toggleValue: 'Years',
  },
  'demographic.days_to_birth': { unit: 'Days', toggleValue: 'Years' },
  'demographic.days_to_death': { unit: 'Days', toggleValue: 'Years' },
  'diagnoses.days_to_diagnosis': { unit: 'Days', toggleValue: 'Years' },
  'diagnoses.days_to_last_follow_up': { unit: 'Days', toggleValue: 'Years' },
  'diagnoses.days_to_last_known_disease_status': {
    unit: 'Days',
    toggleValue: 'Years',
  },
  'diagnoses.days_to_recurrence': { unit: 'Days', toggleValue: 'Years' },
  'diagnoses.treatments.days_to_treatment_end': {
    unit: 'Days',
    toggleValue: 'Years',
  },
  'diagnoses.treatments.days_to_treatment_start': {
    unit: 'Days',
    toggleValue: 'Years',
  },
  'diagnoses.year_of_diagnosis': { unit: 'Years' },
  'follow_ups.other_clinical_attributes.weight': {
    unit: 'Kilograms',
  },
  'follow_ups.other_clinical_attributes.height': {
    unit: 'Centimeters',
  },
};

export const TABS = {
  demographic: 'Demographic',
  diagnoses: 'Diagnosis',
  treatments: 'Treatment',
  exposures: 'Exposures',
  other_clinical_attributes: 'Other Clinical Attribute',
};

export const SURVIVAL_PLOT_MIN_COUNT = 10;
export const BUCKETS_MAX_COUNT = 500;
export const MISSING_KEY = '_missing';
