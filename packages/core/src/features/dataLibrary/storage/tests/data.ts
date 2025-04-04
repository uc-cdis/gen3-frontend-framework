import { LibraryListItemsAPI } from '../../types';

export const ListItems: LibraryListItemsAPI = {
  'dg.5555/8d84511c': {
    dataset_guid: '1010',
    md5sum: 'a1890eb3da180416a3a1e2c4e4527356', // pragma: allowlist secret
    name: 'teach.sav',
    file_size: 1291786,
    id: 'dg.5555/8d84511c',
    type: 'GA4GH_DRS',
    itemType: 'Data',
  },
  'dg.5555/3ca7d38-': {
    dataset_guid: '1010',
    md5sum: '32d8152b09a2ed05a0fde2f21ff46479', // pragma: allowlist secret
    name: 'Teaching.zip',
    file_size: 2565265,
    id: 'dg.5555/3ca7d38-',
    type: 'GA4GH_DRS',
    itemType: 'Data',
  },
};

export const ListToAdd = {
  name: 'test-list',
  items: ListItems,
};

export const SecondList = {
  name: 'test-list-2',
  'dg.5555/0c8df5e3': {
    dataset_guid: '1010',
    md5sum: 'dde1b1d86b3b4ed88fa5b42974ecfd79', // pragma: allowlist secret
    file_name: 'tutorial.zip',
    file_size: 94535,
    object_id: 'dg.5555/0c8df5e3',
  },
  'dg.5555/03ed62aa': {
    dataset_guid: '1010',
    md5sum: '8f5b9b28004210865a0c1d7fc9834b1a', // pragma: allowlist secret
    file_name: 'teach.csv',
    file_size: 932272,
    object_id: 'dg.5555/03ed62aa',
    itemType: 'Data',
  },
};

export const APIListData = {
  lists: {
    '2b0f57fe-b887-42e6-afd4-d65b716ee683': {
      version: 0,
      creator: '2192',
      authz: {
        authz: [
          '/users/2192/user-data-library/lists/2b0f57fe-b887-42e6-afd4-d65b716ee683',
        ],
        version: 0,
      },
      name: 'Research List',
      created_time: '2024-12-11T16:32:31.813138+00:00',
      updated_time: '2025-01-31T23:11:10.871176+00:00',
      items: {},
    },
    '4e773dda-bd3b-4fb5-82dd-b25def7aafbf': {
      version: 0,
      creator: '2192',
      authz: {
        authz: [
          '/users/2192/user-data-library/lists/4e773dda-bd3b-4fb5-82dd-b25def7aafbf',
        ],
        version: 0,
      },
      name: 'Scratch',
      created_time: '2024-12-07T13:08:10.722886+00:00',
      updated_time: '2025-01-31T23:11:27.162196+00:00',
      items: {
        'd502d180-c579-4dd3-9946-2b6febd5f4ce': {
          id: 'd502d180-c579-4dd3-9946-2b6febd5f4ce',
          type: 'GA4GH_DRS',
          itemType: 'Data',
          description:
            'Serialized PFB created with test data from data-simulator',
          dataset_guid: 'open_access-1000Genomes',
          display_name: 'Test PFB',
        },
      },
    },
    '863e49c7-627b-4efa-ba56-98c4a8e10185': {
      version: 0,
      creator: '2192',
      authz: {
        authz: [
          '/users/2192/user-data-library/lists/863e49c7-627b-4efa-ba56-98c4a8e10185',
        ],
        version: 0,
      },
      name: 'Dataset New',
      created_time: '2024-12-06T13:08:02.213807+00:00',
      updated_time: '2025-01-31T23:11:41.960061+00:00',
      items: {
        'd502d180-c579-4dd3-9946-2b6febd5f4ce': {
          id: 'd502d180-c579-4dd3-9946-2b6febd5f4ce',
          type: 'GA4GH_DRS',
          itemType: 'Data',
          description:
            'Serialized PFB created with test data from data-simulator',
          dataset_guid: 'open_access-1000Genomes',
          display_name: 'Test PFB',
        },
      },
    },
    '9640e63f-44d6-4b67-a649-ff61ddef3fee': {
      version: 0,
      creator: '2192',
      authz: {
        authz: [
          '/users/2192/user-data-library/lists/9640e63f-44d6-4b67-a649-ff61ddef3fee',
        ],
        version: 0,
      },
      name: 'Test Data',
      created_time: '2024-12-08T02:51:15.657814+00:00',
      updated_time: '2025-01-31T23:12:00.627676+00:00',
      items: {
        'd502d180-c579-4dd3-9946-2b6febd5f4ce': {
          id: 'd502d180-c579-4dd3-9946-2b6febd5f4ce',
          type: 'GA4GH_DRS',
          itemType: 'Data',
          description:
            'Serialized PFB created with test data from data-simulator',
          dataset_guid: 'open_access-1000Genomes',
          display_name: 'Test PFB',
        },
      },
    },
    'cb83dc14-71cb-48f3-bead-55df0bef9dde': {
      version: 0,
      creator: '2192',
      authz: {
        authz: [
          '/users/2192/user-data-library/lists/cb83dc14-71cb-48f3-bead-55df0bef9dde',
        ],
        version: 0,
      },
      name: 'Dataset 1',
      created_time: '2024-12-08T02:56:56.219373+00:00',
      updated_time: '2025-01-31T23:03:31.299197+00:00',
      items: {
        'd502d180-c579-4dd3-9946-2b6febd5f4ce': {
          id: 'd502d180-c579-4dd3-9946-2b6febd5f4ce',
          type: 'GA4GH_DRS',
          itemType: 'Data',
          description:
            'Serialized PFB created with test data from data-simulator',
          dataset_guid: 'open_access-1000Genomes',
          display_name: 'Test PFB',
        },
      },
    },
  },
};

export const SelectedStudies = [
  {
    'tutorial-synthetic_data_set_1': {
      _unique_id: 'tutorial-synthetic_data_set_1',
      study_id: 'tutorial-synthetic_data_set_1',
      commons: 'Test Commons',
      _subjects_count: 2504,
      __manifest: [
        {
          md5sum: '7204a6a585eab709f58d7173d6b45860', // pragma: allowlist secret
          file_name:
            'ALL.chr8.phase3_shapeit2_mvncall_integrated_v5a.20130502.genotypes.bi_maf001.vcf.bgz.gds',
          file_size: 15769211,
          object_id: 'dg.5555/93f98458-e816-4e56-9bea-013dc6c0ea4b',
        },
        {
          md5sum: 'cdb26235b79473d3da3f88959e849c65', // pragma: allowlist secret
          file_name:
            'ALL.chr18.phase3_shapeit2_mvncall_integrated_v5a.20130502.genotypes.bi_maf001.vcf.bgz',
          file_size: 158422243,
          object_id: 'dg.5555/0fbb8b5d-81a5-4928-a42d-7cac707f746e',
        },
      ],
    },
    'tutorial-synthetic_data_set_2': {
      _unique_id: 'tutorial-synthetic_data_set_2',
      study_id: 'tutorial-synthetic_data_set_2',
      commons: 'Test Commons',
      _subjects_count: 2504,
      __manifest: [
        {
          md5sum: 'e4001829e6e59f1f37db39c08a29dd97', // pragma: allowlist secret
          file_name:
            'ALL.chr1.phase3_shapeit2_mvncall_integrated_v5a.20130502.genotypes.bi_maf001.vcf.bgz.gds',
          file_size: 21134780,
          object_id: 'dg.4503/73f904d1-de54-4ee3-9ae3-ba8af9d0aa7a',
        },
        {
          md5sum: '34ec3657c883d673e1f8f74ee7ab7109', // pragma: allowlist secret
          file_name:
            'ALL.chr13.phase3_shapeit2_mvncall_integrated_v5a.20130502.genotypes.bi_maf001.vcf.bgz',
          file_size: 55828550,
          object_id: 'dg.4503/b4a7afff-d8ba-41e7-ab12-b046768252df',
        },
        {
          md5sum: 'd3e8f13cfeaec0560757295493773620', // pragma: allowlist secret
          file_name:
            'ALL.chr14.phase3_shapeit2_mvncall_integrated_v5a.20130502.genotypes.bi_maf001.vcf.bgz',
          file_size: 61024080,
          object_id: 'dg.4503/80cb7adc-9e5e-4a55-9795-97015f2eaa7c',
        },
      ],
    },
  },
];
