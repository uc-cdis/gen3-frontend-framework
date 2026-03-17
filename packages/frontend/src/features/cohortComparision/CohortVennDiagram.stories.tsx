import type { Meta, StoryObj } from '@storybook/nextjs';
import { http, HttpResponse } from 'msw';
import { FilterSet, GEN3_ANALYSIS_API, GEN3_API } from '@gen3/core';

import CohortVennDiagram from './CohortVennDiagram';
import vennData from './test/vennData.json';

const primary: FilterSet = {
  mode: 'and',
  root: {
    case_id: {
      field: 'case_id',
      operator: 'in',
      operands: ['0000001'],
    },
  },
};

const comparison: FilterSet = {
  mode: 'and',
  root: {
    case_id: {
      field: 'case_id',
      operator: 'in',
      operands: ['0000001', '0000002'],
    },
  },
};

const cohorts = {
  primary_cohort: {
    filter: primary,
    name: 'Primary',
    id: 'primary',
  },
  comparison_cohort: {
    filter: comparison,
    name: 'Comparison',
    id: 'comparison',
  },
};

const meta = {
  component: CohortVennDiagram,
  title: 'features/CohortComparison/CohortVennDiagram',
} satisfies Meta<typeof CohortVennDiagram>;

export default meta;

type Story = StoryObj<typeof meta>;

const handlers = {
  success: [
    http.get(`${GEN3_API}/_status`, () => {
      return HttpResponse.json({
        message: 'Feeling good with storybook!',
        csrf: '6640e4857e5cb3b42db303d8ee3a4ace11900.0002025-06-17T15:24:53+00:00',
      });
    }),
    http.post(`${GEN3_ANALYSIS_API}/venn`, () => {
      return HttpResponse.json(vennData);
    }),
  ],
};

export const Default: Story = {
  args: {
    cohorts: cohorts,
    objectIds: [],
    isLoading: false,
    index: 'case',
  },
  parameters: {
    msw: handlers.success,
  },
};
