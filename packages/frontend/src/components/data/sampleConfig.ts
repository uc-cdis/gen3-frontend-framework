const sampleConfig = {
  explorerConfig: [
    {
      tabTitle: 'Subjects',
      filters: [
        {
          tabs: [
            {
              title: 'Project',
              fields: ['project', 'study']
            },
            {
              title: 'Subject',
              fields: ['race', 'ethnicity', 'gender', 'vital_status']
            },
            {
              title: 'File',
              fields: ['file_count', 'file_type', 'file_format']
            }
          ]
        }
      ],
      table: {
        enabled: true,
        fields: ['race', 'ethnicity', 'gender', 'vital_status']
      },
      guppyConfig: {
        dataType: 'subject',
        nodeCountTitle: 'Subject',
        fieldMapping: [
          {
            field: 'project',
            name: 'Project'
          },
          {
            field: 'study',
            name: 'Study'
          }
        ],
        manifestMapping: {
          resourceIndexType: 'imaging_data_file',
          resourceIdField: 'object_id',
          referenceIdFieldInResourceIndex: '_case_id',
          referenceIdFieldInDataIndex: '_case_id'
        },
        accessibleFieldCheckList: ['project'],
        accessibleValidationField: 'project'
      }
    }
  ]
};

export default sampleConfig;
