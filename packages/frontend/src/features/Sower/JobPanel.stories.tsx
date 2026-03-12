import type { Meta, StoryObj } from '@storybook/nextjs';
import { useArgs } from 'storybook/preview-api';

import JobPanel from './JobPanel';

const meta = {
  component: JobPanel,
  parameters: {},
} satisfies Meta<typeof JobPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

const additionalJobs = [
  {
    uid: 'a1b2c3d4-0001',
    name: 'Ingest TCGA Cohort Data',
    status: 'Completed',
  },
  {
    uid: 'a1b2c3d4-0002',
    name: 'Run Mutation Aggregation Pipeline',
    status: 'Completed',
  },
  { uid: 'a1b2c3d4-0003', name: 'Export GDC BAM Files', status: 'Failed' },
  {
    uid: 'a1b2c3d4-0004',
    name: 'Sync Elasticsearch Index',
    status: 'Completed',
  },
  {
    uid: 'a1b2c3d4-0005',
    name: 'Validate Clinical Metadata',
    status: 'Running',
  },
  { uid: 'a1b2c3d4-0006', name: 'Process FASTQ Alignment', status: 'Running' },
  {
    uid: 'a1b2c3d4-0007',
    name: 'Build Variant Call Report',
    status: 'Completed',
  },
];

export const Default: Story = {
  args: {
    isLoading: false,
    data: [
      {
        uid: 'a1b2c3d4-0008',
        name: 'Upload IDAT Files to S3',
        status: 'Failed',
      },
      {
        uid: 'a1b2c3d4-0009',
        name: 'Index Canine Osteosarcoma Dataset',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0010',
        name: 'Generate GraphQL Schema',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0011',
        name: 'Run Copy Number Analysis',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0012',
        name: 'Reindex MMRF Study Samples',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0013',
        name: 'Reconcile Patient Demographics',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0014',
        name: 'Parse VCF Annotation Files',
        status: 'Failed',
      },
      {
        uid: 'a1b2c3d4-0015',
        name: 'Trigger Downstream ETL Job',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0016',
        name: 'Refresh Dashboard Aggregations',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0017',
        name: 'Archive Legacy Study Files',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0018',
        name: 'Normalize Gene Expression Matrix',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0019',
        name: 'Validate S3 Manifest Checksums',
        status: 'Failed',
      },
      {
        uid: 'a1b2c3d4-0020',
        name: 'Publish Data Release v4.2',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0021',
        name: 'Run Survival Analysis Model',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0022',
        name: 'Backfill Missing Sample Metadata',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0023',
        name: 'Reprocess Failed BAM Alignments',
        status: 'Running',
      },
      {
        uid: 'a1b2c3d4-0024',
        name: 'Notify Downstream Consumers',
        status: 'Completed',
      },
      {
        uid: 'a1b2c3d4-0025',
        name: 'Audit Access Logs for Study X',
        status: 'Running',
      },
    ],
    sowerJobDatetimeCache: {
      'a1b2c3d4-0013': new Date(),
    },
  } as any,
  render: (args: any) => {
    const [{ data }, updateArgs] = useArgs();
    const refetch = () => updateArgs({ data: [...additionalJobs, ...data] });
    return <JobPanel {...args} refetch={refetch} />;
  },
};
