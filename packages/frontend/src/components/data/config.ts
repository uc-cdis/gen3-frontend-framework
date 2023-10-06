export const filterConfig = {
  tabs: [
    {
      title: 'Project',
      fields: ['project', 'study'],
    },
    {
      title: 'Subject',
      fields: ['race', 'ethnicity', 'gender', 'vital_status'],
    },
    {
      title: 'File',
      fields: ['file_count', 'file_type', 'file_format'],
    },
  ],
};

export const tableConfig = [
  { field: 'project', name: 'Project' },
  { field: 'study', name: 'Study' },
  { field: 'race', name: 'Race' },
  { field: 'ethnicity', name: 'Ethnicity' },
  { field: 'gender', name: 'Gender' },
  { field: 'vital_status', name: 'Vital Status' },
  { field: 'whatever_lab_result_value', name: 'Lab Result Value' },
  { field: 'file_count', name: 'File Count' },
  { field: 'file_type', name: 'File Type' },
  { field: 'file_format', name: 'File Format' },
];

export const fieldMapping = [
  {
    field: 'project',
    name: 'Project Name',
  },
];

export const sampleConfig = {
  explorerConfig: [
    {
      tabTitle: 'Subjects',
      charts: {
        project: {
          chartType: 'fullPie',
          title: 'Projects',
        },
        gender: {
          chartType: 'fullPie',
          title: 'Gender',
        },
        race: {
          chartType: 'fullPie',
          title: 'Race',
        },
      },
      filters: {
        tabs: [
          {
            title: 'Project',
            fields: ['project', 'study'],
          },
          {
            title: 'Subject',
            fields: ['race', 'ethnicity', 'gender', 'vital_status'],
          },
          {
            title: 'File',
            fields: ['file_count', 'file_type', 'file_format'],
          },
        ],
      },
      table: {
        enabled: true,
        fields: ['race', 'ethnicity', 'gender', 'vital_status'],
      },
      guppyConfig: {
        dataType: 'subject',
        nodeCountTitle: 'Subject',
        fieldMapping: [
          {
            field: 'project',
            name: 'Project',
          },
          {
            field: 'study',
            name: 'Study',
          },
        ],
        manifestMapping: {
          resourceIndexType: 'imaging_data_file',
          resourceIdField: 'object_id',
          referenceIdFieldInResourceIndex: '_case_id',
          referenceIdFieldInDataIndex: '_case_id',
        },
        accessibleFieldCheckList: ['project'],
        accessibleValidationField: 'project',
      },
    },
  ],
};
