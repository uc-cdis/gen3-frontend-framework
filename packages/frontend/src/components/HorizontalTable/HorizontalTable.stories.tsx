import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, within } from 'storybook/test';
import { HorizontalTable } from './index';

const meta = {
  component: HorizontalTable,
  title: 'components/HorizontalTable',
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof HorizontalTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tableData: [
      {
        headerName: 'UUID',
        values: ['53af5705-a17b-555a-92e9-880ce5c14ca0'],
      },
      {
        headerName: 'DNA Change',
        values: ['chr17:g.7673776G>A'],
      },
      {
        headerName: 'Type',
        values: ['Single base substitution'],
      },
      {
        headerName: 'Reference Genome Assembly',
        values: ['GRCh38'],
      },
      {
        headerName: 'Allele In The Reference Assembly',
        values: ['G'],
      },
      {
        headerName: 'Functional Impact',
        values: [
          <div key="1">
            <div className="flex flex-col py-2 gap-0.5">
              <span className="flex gap-2 items-center ">
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-1 underline font-content"
                  href="http://nov2020.archive.ensembl.org/Homo_sapiens/Transcript/Summary?db=core;t=ENST00000269305"
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  ENST00000269305
                </a>
                <span className="rounded-full aspect-square w-5 h-5 flex justify-center bg-primary text-base-max">
                  C
                </span>
              </span>
              <span>VEP: MODERATE</span>
              <div>
                <span>SIFT: deleterious</span>
                <span>, score: 0</span>
              </div>
              <div>
                <span>PolyPhen: probably_damaging</span>
                <span>, score: 1</span>
              </div>
            </div>
          </div>,
        ],
      },
    ],
    customDataTestID: 'customDataTestID',
    enableSync: true,
    ref: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let testIds = ['customDataTestID'];

    await new Promise(resolve => setTimeout(resolve, 1000));

    const numberOfRowsExpected = 6;
    const rowIds = Array.from(
      { length: numberOfRowsExpected },
      (_, index) => `horizontal-table-row-${index}`,
    );
    testIds = [...testIds, ...rowIds];
    testIds.forEach((id) => {
      const currEle = canvas.getByTestId(id);
      expect(currEle).toBeInTheDocument();
    });
  },
};
