import { FilterSet } from '@gen3/core';

interface DatasetItem {
  dataset_guid?: string;
  description?: string;
  docsUrl?: string;
  type?: string;
  name?: string;
  guid?: string;
  size?: string;
}

interface Items {
  [key: string]: DatasetItem;
}

interface Dataset {
  name: string;
  items?: Items;
  type?: string;
  schema_version?: string;
  index?: string;
  data?:
    | {
        query: string;
        variables: {
          filter: {
            AND: Array<{
              IN: {
                [key: string]: string[];
              };
            }>;
          };
        };
      }
    | FilterSet;
}

interface List {
  name: string;
  version: number;
  items: {
    [key: string]: Dataset;
  };
}

interface DataSets {
  lists: List[];
}

export const data1 = {
  lists: [
    {
      name: 'My Saved List 1',
      version: 0,
      items: {
        'drs://dg.4503:943200c3-271d-4a04-a2b6-040272239a64': {
          guid: 'phs000001.v1.p1.c1',
          dataset_guid: 'DS_1DS_11111',
        },
        Atlas: {
          description: 'Atlas is a search tool over OMOP data',
          docsUrl: 'https://testing.io',
          type: 'AdditionalData',
          dataset_guid: 'DS_1DS_11111',
        },
        FIHR: {
          type: 'AdditionalData',
          description:
            '(Fast Healthcare Interoperability Resources 1 ) standard defines how healthcare information can be exchanged between different computer systems',
          docsUrl: 'https://testing2.io',
          dataset_guid: 'DS_1DS_11111',
        },
        New_Dataset: {
          description: 'New Dataset featuring extensive genomic data',
          docsUrl: 'https://datasetinfo.io',
          type: 'AdditionalData',
          dataset_guid: 'DS_1DS_11111',
        },
        CF_1: {
          name: 'Cohort Filter 1',
          type: 'Gen3GraphQL',
          schema_version: 'c246d0f',
          index: 'series',
          data: {
            mode: 'and',
            root: {
              'gen3_discovery.PatientSex': {
                operator: 'nested',
                path: 'gen3_discovery',
                operand: {
                  operator: 'in',
                  field: 'PatientSex',
                  operands: ['Female', 'Male'],
                },
              },
              'gen3_discovery.BodyPartExamined': {
                operator: 'nested',
                path: 'gen3_discovery',
                operand: {
                  operator: 'in',
                  field: 'BodyPartExamined',
                  operands: ['BREAST', 'PROSTATE', 'PORT CHEST'],
                },
              },
              'gen3_discovery.primary_site': {
                operator: 'nested',
                path: 'gen3_discovery',
                operand: {
                  operator: 'in',
                  field: 'primary_site',
                  operands: ['Lung'],
                },
              },
            },
          },
        },
      },
    },
    {
      name: 'List 2',
      version: 0,
      items: {
        'drs://dg.4503:943200c3-271d-4a04-a2b6-040272239a64': {
          guid: 'phs000001.v1.p1.c1',
          dataset_guid: 'DS_211',
        },
        Gene_Info: {
          name: 'Gene Info',
          type: 'AdditionalData',
          description: 'Information on genetic markers and their implications',
          docsUrl: 'https://genetics.io',
          dataset_guid: 'DS_211',
        },
        'drs://dg.4503:943200c3-271d-4a04-a2b6-040272239we3': {
          guid: 'ab6623a7-a474-4ffb-ab88-e926764628c4',
          type: 'PFB',
          name: 'Serialized Data Model and Data (PFB)',
          size: '57 KB',
          dataset_guid: 'DS_3',
          description:
            "Harmonized clinical data and subject-level sample file pointers. Harmonized to BDC's Gen3 Data Dictionary.",
        },
        'drs://dg.4503:b1aeee0f-fdf1-4092-b8cf-f521c6a6f3ea': {
          guid: 'b1aeee0f-fdf1-4092-b8cf-f521c6a6f3ea',
          type: 'CSV',
          name: 'Clinical Data',
          size: '27 GB',
          dataset_guid: 'DS_3',
          description: 'A simple CSV containing additional clinical data.',
        },
        Gene_Info_2: {
          name: 'Gene Info',
          type: 'AdditionalData',
          description: 'Information on genetic markers and their implications',
          docsUrl: 'https://genetics.io',
          dataset_guid: 'DS_3',
        },
      },
      CF_4: {
        name: 'Cohort Filter 4',
        type: 'Gen3GraphQL',
        schema_version: 'c246d0f',
        index: 'cases',
        data: {
          query:
            'query ($filter: JSON) { _aggregation { subject (filter: $filter) { file_count { histogram { sum } } } } }',
          variables: {
            filter: {
              AND: [
                {
                  IN: {
                    annotated_sex: ['male'],
                  },
                },
                {
                  IN: {
                    data_type: ['Aligned Reads'],
                  },
                },
                {
                  IN: {
                    data_format: ['CRAM'],
                  },
                },
                {
                  IN: {
                    race: ['["hispanic"]'],
                  },
                },
              ],
            },
          },
        },
      },
    },
    //if type exists -> cohort or additional data (everything else is file [data])
    {
      name: 'Data List 3',
      version: 2,
      items: {
        'drs://dg.4503:31948a1c-0be4-43d5-aab0-2a4471c2ef28': {
          guid: '31948a1c-0be4-43d5-aab0-2a4471c2ef28',
          type: 'CSV',
          name: 'CSV Data Sample',
          size: '42 GB',
          dataset_guid: 'DS_723',
          description:
            'Randomly generated csv file containing biomedical or genomic information.',
        },
        'drs://dg.4503:b0815063-ac00-4958-a17f-f3e4df020ed8': {
          guid: 'b0815063-ac00-4958-a17f-f3e4df020ed8',
          type: 'BAM',
          name: 'BAM Data Sample',
          size: '11 GB',
          dataset_guid: 'DS_723',
          description:
            'Randomly generated bam file containing biomedical or genomic information.',
        },
        'drs://dg.4503:6e78fe3b-cce1-49de-916b-eccf9e9cec93': {
          guid: '6e78fe3b-cce1-49de-916b-eccf9e9cec93',
          type: 'TSV',
          name: 'TSV Data Sample',
          size: '88 GB',
          dataset_guid: 'DS_723',
          description:
            'Randomly generated tsv file containing biomedical or genomic information.',
        },
        'drs://dg.4503:726ae41f-3b44-4a7b-adab-9f0c790a399f': {
          guid: '726ae41f-3b44-4a7b-adab-9f0c790a399f',
          type: 'PFB',
          name: 'PFB Data Sample',
          size: '25 KB',
          dataset_guid: 'DS_723',
          description:
            'Randomly generated pfb file containing biomedical or genomic information.',
        },
        'drs://dg.4503:ce1f5a36-b987-4b67-82c3-27cc1b49f4b7': {
          guid: 'ce1f5a36-b987-4b67-82c3-27cc1b49f4b7',
          type: 'TAR',
          name: 'TAR Data Sample',
          size: '27 KB',
          dataset_guid: 'DS_723',
          description:
            'Randomly generated tar file containing biomedical or genomic information.',
        },
        Genome_Stats: {
          name: 'Genome_Stats',
          description: 'Comprehensive statistics and data on genome sequencing',
          docsUrl: 'https://genomestats.io',
          type: 'AdditionalData',
          dataset_guid: 'DS_723',
        },
      },
    },
  ],
};
