import { describe } from '@jest/globals';

import { groupSharedFields } from '../utils';

const data = {
  measurement: [
    '_measurement_id',
    'auth_resource_path',
    'case_ids',
    'data_contributor',
    'data_url_doi',
    'dataset_submitter_id',
    'license',
    'node_id',
    'project_id',
    'submitter_id',
    'test_days_from_index',
    'test_method',
    'test_name',
    'test_result_text',
  ],
  data_file: [
    '_annotation_id',
    '_case_id',
    '_data_file_id',
    '_dataset_id',
    '_imaging_study_id',
    'acquisition_type',
    'age_at_imaging',
    'age_at_index',
    'angio_flag',
    'annotation_method',
    'annotation_name',
    'annotator_id',
    'auth_resource_path',
    'body_part_examined',
    'case_ids',
    'contrast_bolus_agent',
    'convolution_kernel',
    'covid19_positive',
    'data_category',
    'data_contributor',
    'data_format',
    'data_type',
    'data_url_doi',
    'dataset_submitter_id',
    'days_from_study_to_neg_covid_test',
    'days_from_study_to_pos_covid_test',
    'days_to_study',
    'detector_type',
    'diffusion_b_value',
    'diffusion_gradient_orientation',
    'echo_number',
    'echo_time',
    'echo_train_length',
    'ethnicity',
    'exposure_modulation_type',
    'file_name',
    'file_size',
    'image_data_modification_method',
    'image_data_modification_name',
    'image_data_modified',
    'image_type',
    'imaged_nucleus',
    'imager_pixel_spacing',
    'index_event',
    'instance_uids',
    'license',
    'loinc_code',
    'loinc_contrast',
    'loinc_long_common_name',
    'loinc_method',
    'loinc_system',
    'lossy_image_compression',
    'manufacturer',
    'manufacturer_model_name',
    'md5sum',
    'modality',
    'node_id',
    'number_of_instances',
    'number_of_temporal_positions',
    'object_id',
    'patient_position',
    'pixel_spacing',
    'program_name',
    'project_code',
    'project_id',
    'race',
    'radiopharmaceutical',
    'repetition_time',
    'scan_options',
    'sequence_variant',
    'series_description',
    'series_uid',
    'sex',
    'slice_thickness',
    'software_version',
    'software_versions',
    'source_node',
    'spacing_between_slices',
    'spatial_resolution',
    'study_description',
    'study_modality',
    'study_uid',
    'study_year',
    'study_year_shifted',
    'submitter_id',
    'transducer_type',
    'view_position',
    'zip',
  ],
  case: [
    '_case_id',
    '_cr_series_file_count',
    '_ct_series_file_count',
    '_dx_series_file_count',
    '_imaging_studies_count',
    '_mr_series_file_count',
    'age_at_imaging',
    'age_at_index',
    'airspace_disease_grading',
    'annotation_method',
    'annotation_name',
    'annotator_id',
    'auth_resource_path',
    'body_part_examined',
    'breathing_support_type',
    'case_annotations._annotation_id',
    'case_annotations.annotation_method',
    'case_annotations.annotator_id',
    'class_covid19_pneumonia',
    'condition_code',
    'condition_code_system',
    'condition_name',
    'conditions._condition_id',
    'conditions.condition_code',
    'conditions.condition_code_system',
    'conditions.condition_name',
    'conditions.days_to_condition_end',
    'conditions.days_to_condition_start',
    'covid19_positive',
    'data_category',
    'data_contributor',
    'data_file_count',
    'data_file_image_data_modification_method',
    'data_file_image_data_modification_name',
    'data_file_image_data_modified',
    'data_format',
    'data_type',
    'data_url_doi',
    'dataset_submitter_id',
    'days_from_study_to_neg_covid_test',
    'days_from_study_to_pos_covid_test',
    'days_to_condition_end',
    'days_to_condition_start',
    'days_to_medication_end',
    'days_to_medication_start',
    'days_to_procedure_end',
    'days_to_procedure_start',
    'days_to_study',
    'dose_sequence_number',
    'ethnicity',
    'image_data_modified',
    'imaging_studies._imaging_study_id',
    'imaging_studies.age_at_imaging',
    'imaging_studies.body_part_examined',
    'imaging_studies.days_from_study_to_neg_covid_test',
    'imaging_studies.days_from_study_to_pos_covid_test',
    'imaging_studies.days_to_study',
    'imaging_studies.image_data_modified',
    'imaging_studies.loinc_code',
    'imaging_studies.loinc_contrast',
    'imaging_studies.loinc_long_common_name',
    'imaging_studies.loinc_method',
    'imaging_studies.loinc_system',
    'imaging_studies.study_description',
    'imaging_studies.study_modality',
    'imaging_studies.study_uid',
    'imaging_studies.study_year',
    'imaging_study_annotations._annotation_id',
    'imaging_study_annotations.airspace_disease_grading',
    'imaging_study_annotations.annotation_method',
    'imaging_study_annotations.annotation_name',
    'imaging_study_annotations.annotator_id',
    'imaging_study_annotations.class_covid19_pneumonia',
    'imaging_study_annotations.instance_uids',
    'imaging_study_annotations.midrc_mRALE_score',
    'index_event',
    'instance_uids',
    'license',
    'loinc_code',
    'loinc_contrast',
    'loinc_long_common_name',
    'loinc_method',
    'loinc_system',
    'measurements._measurement_id',
    'measurements.test_days_from_index',
    'measurements.test_method',
    'measurements.test_name',
    'measurements.test_result_text',
    'medication_code',
    'medication_code_system',
    'medication_manufacturer',
    'medication_name',
    'medication_type',
    'medications._medication_id',
    'medications.days_to_medication_end',
    'medications.days_to_medication_start',
    'medications.dose_sequence_number',
    'medications.medication_code',
    'medications.medication_code_system',
    'medications.medication_manufacturer',
    'medications.medication_name',
    'medications.medication_type',
    'midrc_mRALE_score',
    'node_id',
    'object_id',
    'procedure_name',
    'procedures._procedure_id',
    'procedures.breathing_support_type',
    'procedures.days_to_procedure_end',
    'procedures.days_to_procedure_start',
    'procedures.procedure_name',
    'project_id',
    'race',
    'sex',
    'study_description',
    'study_modality',
    'study_uid',
    'study_year',
    'submitter_id',
    'test_days_from_index',
    'test_method',
    'test_name',
    'test_result_text',
    'zip',
  ],
  annotation: [
    '_annotation_id',
    'airspace_disease_grading',
    'annotation_method',
    'annotation_name',
    'annotator_id',
    'auth_resource_path',
    'case_ids',
    'class_covid19_pneumonia',
    'instance_uids',
    'midrc_mRALE_score',
    'node_id',
    'project_id',
    'submitter_id',
  ],
  imaging_study: [
    '_cr_series_file_count',
    '_ct_series_file_count',
    '_dx_series_file_count',
    '_imaging_study_id',
    '_mr_series_file_count',
    'age_at_imaging',
    'age_at_index',
    'airspace_disease_grading',
    'annotation_method',
    'annotation_name',
    'annotator_id',
    'auth_resource_path',
    'body_part_examined',
    'case_ids',
    'class_covid19_pneumonia',
    'covid19_positive',
    'data_category',
    'data_contributor',
    'data_file_annotation_method',
    'data_file_annotation_name',
    'data_file_image_data_modification_method',
    'data_file_image_data_modification_name',
    'data_file_image_data_modified',
    'data_file_source_node',
    'data_format',
    'data_type',
    'data_url_doi',
    'dataset_submitter_id',
    'days_from_study_to_neg_covid_test',
    'days_from_study_to_pos_covid_test',
    'days_to_study',
    'ethnicity',
    'image_data_modified',
    'imaging_study_annotations._annotation_id',
    'imaging_study_annotations.airspace_disease_grading',
    'imaging_study_annotations.annotation_method',
    'imaging_study_annotations.annotation_name',
    'imaging_study_annotations.annotator_id',
    'imaging_study_annotations.class_covid19_pneumonia',
    'imaging_study_annotations.instance_uids',
    'imaging_study_annotations.midrc_mRALE_score',
    'index_event',
    'instance_uids',
    'license',
    'loinc_code',
    'loinc_contrast',
    'loinc_long_common_name',
    'loinc_method',
    'loinc_system',
    'midrc_mRALE_score',
    'node_id',
    'object_id',
    'project_id',
    'race',
    'sex',
    'study_description',
    'study_modality',
    'study_uid',
    'study_year',
    'study_year_shifted',
    'submitter_id',
    'zip',
  ],
};

const expected = {
  auth_resource_path: [
    {
      index: 'measurement',
      field: 'auth_resource_path',
    },
    {
      index: 'data_file',
      field: 'auth_resource_path',
    },
    {
      index: 'case',
      field: 'auth_resource_path',
    },
    {
      index: 'annotation',
      field: 'auth_resource_path',
    },
    {
      index: 'imaging_study',
      field: 'auth_resource_path',
    },
  ],
  case_ids: [
    {
      index: 'measurement',
      field: 'case_ids',
    },
    {
      index: 'data_file',
      field: 'case_ids',
    },
    {
      index: 'annotation',
      field: 'case_ids',
    },
    {
      index: 'imaging_study',
      field: 'case_ids',
    },
  ],
  data_contributor: [
    {
      index: 'measurement',
      field: 'data_contributor',
    },
    {
      index: 'data_file',
      field: 'data_contributor',
    },
    {
      index: 'case',
      field: 'data_contributor',
    },
    {
      index: 'imaging_study',
      field: 'data_contributor',
    },
  ],
  data_url_doi: [
    {
      index: 'measurement',
      field: 'data_url_doi',
    },
    {
      index: 'data_file',
      field: 'data_url_doi',
    },
    {
      index: 'case',
      field: 'data_url_doi',
    },
    {
      index: 'imaging_study',
      field: 'data_url_doi',
    },
  ],
  dataset_submitter_id: [
    {
      index: 'measurement',
      field: 'dataset_submitter_id',
    },
    {
      index: 'data_file',
      field: 'dataset_submitter_id',
    },
    {
      index: 'case',
      field: 'dataset_submitter_id',
    },
    {
      index: 'imaging_study',
      field: 'dataset_submitter_id',
    },
  ],
  license: [
    {
      index: 'measurement',
      field: 'license',
    },
    {
      index: 'data_file',
      field: 'license',
    },
    {
      index: 'case',
      field: 'license',
    },
    {
      index: 'imaging_study',
      field: 'license',
    },
  ],
  node_id: [
    {
      index: 'measurement',
      field: 'node_id',
    },
    {
      index: 'data_file',
      field: 'node_id',
    },
    {
      index: 'case',
      field: 'node_id',
    },
    {
      index: 'annotation',
      field: 'node_id',
    },
    {
      index: 'imaging_study',
      field: 'node_id',
    },
  ],
  project_id: [
    {
      index: 'measurement',
      field: 'project_id',
    },
    {
      index: 'data_file',
      field: 'project_id',
    },
    {
      index: 'case',
      field: 'project_id',
    },
    {
      index: 'annotation',
      field: 'project_id',
    },
    {
      index: 'imaging_study',
      field: 'project_id',
    },
  ],
  submitter_id: [
    {
      index: 'measurement',
      field: 'submitter_id',
    },
    {
      index: 'data_file',
      field: 'submitter_id',
    },
    {
      index: 'case',
      field: 'submitter_id',
    },
    {
      index: 'annotation',
      field: 'submitter_id',
    },
    {
      index: 'imaging_study',
      field: 'submitter_id',
    },
  ],
  test_days_from_index: [
    {
      index: 'measurement',
      field: 'test_days_from_index',
    },
    {
      index: 'case',
      field: 'test_days_from_index',
    },
  ],
  test_method: [
    {
      index: 'measurement',
      field: 'test_method',
    },
    {
      index: 'case',
      field: 'test_method',
    },
  ],
  test_name: [
    {
      index: 'measurement',
      field: 'test_name',
    },
    {
      index: 'case',
      field: 'test_name',
    },
  ],
  test_result_text: [
    {
      index: 'measurement',
      field: 'test_result_text',
    },
    {
      index: 'case',
      field: 'test_result_text',
    },
  ],
  _annotation_id: [
    {
      index: 'data_file',
      field: '_annotation_id',
    },
    {
      index: 'annotation',
      field: '_annotation_id',
    },
  ],
  _case_id: [
    {
      index: 'data_file',
      field: '_case_id',
    },
    {
      index: 'case',
      field: '_case_id',
    },
  ],
  _imaging_study_id: [
    {
      index: 'data_file',
      field: '_imaging_study_id',
    },
    {
      index: 'imaging_study',
      field: '_imaging_study_id',
    },
  ],
  age_at_imaging: [
    {
      index: 'data_file',
      field: 'age_at_imaging',
    },
    {
      index: 'case',
      field: 'age_at_imaging',
    },
    {
      index: 'imaging_study',
      field: 'age_at_imaging',
    },
  ],
  age_at_index: [
    {
      index: 'data_file',
      field: 'age_at_index',
    },
    {
      index: 'case',
      field: 'age_at_index',
    },
    {
      index: 'imaging_study',
      field: 'age_at_index',
    },
  ],
  annotation_method: [
    {
      index: 'data_file',
      field: 'annotation_method',
    },
    {
      index: 'case',
      field: 'annotation_method',
    },
    {
      index: 'annotation',
      field: 'annotation_method',
    },
    {
      index: 'imaging_study',
      field: 'annotation_method',
    },
  ],
  annotation_name: [
    {
      index: 'data_file',
      field: 'annotation_name',
    },
    {
      index: 'case',
      field: 'annotation_name',
    },
    {
      index: 'annotation',
      field: 'annotation_name',
    },
    {
      index: 'imaging_study',
      field: 'annotation_name',
    },
  ],
  annotator_id: [
    {
      index: 'data_file',
      field: 'annotator_id',
    },
    {
      index: 'case',
      field: 'annotator_id',
    },
    {
      index: 'annotation',
      field: 'annotator_id',
    },
    {
      index: 'imaging_study',
      field: 'annotator_id',
    },
  ],
  body_part_examined: [
    {
      index: 'data_file',
      field: 'body_part_examined',
    },
    {
      index: 'case',
      field: 'body_part_examined',
    },
    {
      index: 'imaging_study',
      field: 'body_part_examined',
    },
  ],
  covid19_positive: [
    {
      index: 'data_file',
      field: 'covid19_positive',
    },
    {
      index: 'case',
      field: 'covid19_positive',
    },
    {
      index: 'imaging_study',
      field: 'covid19_positive',
    },
  ],
  data_category: [
    {
      index: 'data_file',
      field: 'data_category',
    },
    {
      index: 'case',
      field: 'data_category',
    },
    {
      index: 'imaging_study',
      field: 'data_category',
    },
  ],
  data_format: [
    {
      index: 'data_file',
      field: 'data_format',
    },
    {
      index: 'case',
      field: 'data_format',
    },
    {
      index: 'imaging_study',
      field: 'data_format',
    },
  ],
  data_type: [
    {
      index: 'data_file',
      field: 'data_type',
    },
    {
      index: 'case',
      field: 'data_type',
    },
    {
      index: 'imaging_study',
      field: 'data_type',
    },
  ],
  days_from_study_to_neg_covid_test: [
    {
      index: 'data_file',
      field: 'days_from_study_to_neg_covid_test',
    },
    {
      index: 'case',
      field: 'days_from_study_to_neg_covid_test',
    },
    {
      index: 'imaging_study',
      field: 'days_from_study_to_neg_covid_test',
    },
  ],
  days_from_study_to_pos_covid_test: [
    {
      index: 'data_file',
      field: 'days_from_study_to_pos_covid_test',
    },
    {
      index: 'case',
      field: 'days_from_study_to_pos_covid_test',
    },
    {
      index: 'imaging_study',
      field: 'days_from_study_to_pos_covid_test',
    },
  ],
  days_to_study: [
    {
      index: 'data_file',
      field: 'days_to_study',
    },
    {
      index: 'case',
      field: 'days_to_study',
    },
    {
      index: 'imaging_study',
      field: 'days_to_study',
    },
  ],
  ethnicity: [
    {
      index: 'data_file',
      field: 'ethnicity',
    },
    {
      index: 'case',
      field: 'ethnicity',
    },
    {
      index: 'imaging_study',
      field: 'ethnicity',
    },
  ],
  image_data_modified: [
    {
      index: 'data_file',
      field: 'image_data_modified',
    },
    {
      index: 'case',
      field: 'image_data_modified',
    },
    {
      index: 'imaging_study',
      field: 'image_data_modified',
    },
  ],
  index_event: [
    {
      index: 'data_file',
      field: 'index_event',
    },
    {
      index: 'case',
      field: 'index_event',
    },
    {
      index: 'imaging_study',
      field: 'index_event',
    },
  ],
  instance_uids: [
    {
      index: 'data_file',
      field: 'instance_uids',
    },
    {
      index: 'case',
      field: 'instance_uids',
    },
    {
      index: 'annotation',
      field: 'instance_uids',
    },
    {
      index: 'imaging_study',
      field: 'instance_uids',
    },
  ],
  loinc_code: [
    {
      index: 'data_file',
      field: 'loinc_code',
    },
    {
      index: 'case',
      field: 'loinc_code',
    },
    {
      index: 'imaging_study',
      field: 'loinc_code',
    },
  ],
  loinc_contrast: [
    {
      index: 'data_file',
      field: 'loinc_contrast',
    },
    {
      index: 'case',
      field: 'loinc_contrast',
    },
    {
      index: 'imaging_study',
      field: 'loinc_contrast',
    },
  ],
  loinc_long_common_name: [
    {
      index: 'data_file',
      field: 'loinc_long_common_name',
    },
    {
      index: 'case',
      field: 'loinc_long_common_name',
    },
    {
      index: 'imaging_study',
      field: 'loinc_long_common_name',
    },
  ],
  loinc_method: [
    {
      index: 'data_file',
      field: 'loinc_method',
    },
    {
      index: 'case',
      field: 'loinc_method',
    },
    {
      index: 'imaging_study',
      field: 'loinc_method',
    },
  ],
  loinc_system: [
    {
      index: 'data_file',
      field: 'loinc_system',
    },
    {
      index: 'case',
      field: 'loinc_system',
    },
    {
      index: 'imaging_study',
      field: 'loinc_system',
    },
  ],
  object_id: [
    {
      index: 'data_file',
      field: 'object_id',
    },
    {
      index: 'case',
      field: 'object_id',
    },
    {
      index: 'imaging_study',
      field: 'object_id',
    },
  ],
  race: [
    {
      index: 'data_file',
      field: 'race',
    },
    {
      index: 'case',
      field: 'race',
    },
    {
      index: 'imaging_study',
      field: 'race',
    },
  ],
  sex: [
    {
      index: 'data_file',
      field: 'sex',
    },
    {
      index: 'case',
      field: 'sex',
    },
    {
      index: 'imaging_study',
      field: 'sex',
    },
  ],
  study_description: [
    {
      index: 'data_file',
      field: 'study_description',
    },
    {
      index: 'case',
      field: 'study_description',
    },
    {
      index: 'imaging_study',
      field: 'study_description',
    },
  ],
  study_modality: [
    {
      index: 'data_file',
      field: 'study_modality',
    },
    {
      index: 'case',
      field: 'study_modality',
    },
    {
      index: 'imaging_study',
      field: 'study_modality',
    },
  ],
  study_uid: [
    {
      index: 'data_file',
      field: 'study_uid',
    },
    {
      index: 'case',
      field: 'study_uid',
    },
    {
      index: 'imaging_study',
      field: 'study_uid',
    },
  ],
  study_year: [
    {
      index: 'data_file',
      field: 'study_year',
    },
    {
      index: 'case',
      field: 'study_year',
    },
    {
      index: 'imaging_study',
      field: 'study_year',
    },
  ],
  study_year_shifted: [
    {
      index: 'data_file',
      field: 'study_year_shifted',
    },
    {
      index: 'imaging_study',
      field: 'study_year_shifted',
    },
  ],
  zip: [
    {
      index: 'data_file',
      field: 'zip',
    },
    {
      index: 'case',
      field: 'zip',
    },
    {
      index: 'imaging_study',
      field: 'zip',
    },
  ],
  _cr_series_file_count: [
    {
      index: 'case',
      field: '_cr_series_file_count',
    },
    {
      index: 'imaging_study',
      field: '_cr_series_file_count',
    },
  ],
  _ct_series_file_count: [
    {
      index: 'case',
      field: '_ct_series_file_count',
    },
    {
      index: 'imaging_study',
      field: '_ct_series_file_count',
    },
  ],
  _dx_series_file_count: [
    {
      index: 'case',
      field: '_dx_series_file_count',
    },
    {
      index: 'imaging_study',
      field: '_dx_series_file_count',
    },
  ],
  _mr_series_file_count: [
    {
      index: 'case',
      field: '_mr_series_file_count',
    },
    {
      index: 'imaging_study',
      field: '_mr_series_file_count',
    },
  ],
  airspace_disease_grading: [
    {
      index: 'case',
      field: 'airspace_disease_grading',
    },
    {
      index: 'annotation',
      field: 'airspace_disease_grading',
    },
    {
      index: 'imaging_study',
      field: 'airspace_disease_grading',
    },
  ],
  class_covid19_pneumonia: [
    {
      index: 'case',
      field: 'class_covid19_pneumonia',
    },
    {
      index: 'annotation',
      field: 'class_covid19_pneumonia',
    },
    {
      index: 'imaging_study',
      field: 'class_covid19_pneumonia',
    },
  ],
  data_file_image_data_modification_method: [
    {
      index: 'case',
      field: 'data_file_image_data_modification_method',
    },
    {
      index: 'imaging_study',
      field: 'data_file_image_data_modification_method',
    },
  ],
  data_file_image_data_modification_name: [
    {
      index: 'case',
      field: 'data_file_image_data_modification_name',
    },
    {
      index: 'imaging_study',
      field: 'data_file_image_data_modification_name',
    },
  ],
  data_file_image_data_modified: [
    {
      index: 'case',
      field: 'data_file_image_data_modified',
    },
    {
      index: 'imaging_study',
      field: 'data_file_image_data_modified',
    },
  ],
  'imaging_study_annotations._annotation_id': [
    {
      index: 'case',
      field: 'imaging_study_annotations._annotation_id',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations._annotation_id',
    },
  ],
  'imaging_study_annotations.airspace_disease_grading': [
    {
      index: 'case',
      field: 'imaging_study_annotations.airspace_disease_grading',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.airspace_disease_grading',
    },
  ],
  'imaging_study_annotations.annotation_method': [
    {
      index: 'case',
      field: 'imaging_study_annotations.annotation_method',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.annotation_method',
    },
  ],
  'imaging_study_annotations.annotation_name': [
    {
      index: 'case',
      field: 'imaging_study_annotations.annotation_name',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.annotation_name',
    },
  ],
  'imaging_study_annotations.annotator_id': [
    {
      index: 'case',
      field: 'imaging_study_annotations.annotator_id',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.annotator_id',
    },
  ],
  'imaging_study_annotations.class_covid19_pneumonia': [
    {
      index: 'case',
      field: 'imaging_study_annotations.class_covid19_pneumonia',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.class_covid19_pneumonia',
    },
  ],
  'imaging_study_annotations.instance_uids': [
    {
      index: 'case',
      field: 'imaging_study_annotations.instance_uids',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.instance_uids',
    },
  ],
  'imaging_study_annotations.midrc_mRALE_score': [
    {
      index: 'case',
      field: 'imaging_study_annotations.midrc_mRALE_score',
    },
    {
      index: 'imaging_study',
      field: 'imaging_study_annotations.midrc_mRALE_score',
    },
  ],
  midrc_mRALE_score: [
    {
      index: 'case',
      field: 'midrc_mRALE_score',
    },
    {
      index: 'annotation',
      field: 'midrc_mRALE_score',
    },
    {
      index: 'imaging_study',
      field: 'midrc_mRALE_score',
    },
  ],
};

describe('test grouping by index', () => {
  it('should group by index', () => {
    const results = groupSharedFields(data);

    expect(results).toEqual(expected);
  });
});
