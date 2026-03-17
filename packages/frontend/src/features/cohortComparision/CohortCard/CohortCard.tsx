import React from 'react';
import { Switch, useMantineTheme } from '@mantine/core';
import CohortVennDiagram from '../CohortVennDiagram';
import Link from 'next/link';
import { CohortComparisonType, FIELD_LABELS } from '../types';
import CohortTable from './CohortTable';

interface CohortCardProps {
  selectedCards: Record<string, boolean>;
  setSelectedCards: (cards: Record<string, boolean>) => void;
  counts: number[];
  options: Record<string, string>;
  cohorts: CohortComparisonType;
  survivalPlotSelectable: boolean;
  caseSetIds?: string[];
  objectsFetching: boolean;
  index: string;
}

const CohortCard: React.FC<CohortCardProps> = ({
  selectedCards,
  setSelectedCards,
  options,
  counts,
  cohorts,
  survivalPlotSelectable,
  objectsFetching,
  index,
}: Readonly<CohortCardProps>) => {
  const theme = useMantineTheme();

  return (
    <div className="flex flex-col gap-y-4">
      <div className="border-1 border-base-lighter p-4">
        <CohortTable
          cohorts={cohorts}
          counts={counts}
          casesFetching={objectsFetching}
        />

        <CohortVennDiagram
          cohorts={cohorts}
          isLoading={objectsFetching || counts.length === 0}
          index={index}
        />

        <div className="text-center hidden">
          <Link
            href={{
              pathname: '/analysis_page',
              query: {
                app: 'SetOperationsApp',
                skipSelectionScreen: 'true',
                cohort1Id: cohorts.primary_cohort.id,
                cohort2Id: cohorts.comparison_cohort.id,
              },
            }}
            data-testid="link-open-venn-diagram"
            className="underline text-primary font-bold"
            aria-label="View Venn diagram in Set Operations. Note: you will be directed to the Set Operations tool. Close the tool to return to the Analysis Center if you wish to use Cohort Comparison."
          >
            View Venn diagram in Set Operations
          </Link>
        </div>
      </div>

      <div>
        <div className="py-3 pl-2 bg-primary-darkest text-base-max font-bold text-[1rem]">
          Customize Properties Display
        </div>
        <ul className="border-1 border-base-lighter rounded-b px-2">
          {Object.entries(options).map(([value, field]) => (
            <li key={value}>
              <Switch
                data-testid={`button-enable-${value}-cohort-comparison`}
                id={`cohort-comparison-${value}`}
                labelPosition="left"
                color={theme.colors['accent'][4]}
                classNames={{
                  root: 'py-1',
                  body: 'flex justify-between items-center',
                  label:
                    'cursor-pointer text-sm text-black font-content font-medium',
                  track: `cursor-pointer hover:bg-secondary-lighter`,
                }}
                checked={selectedCards[value]}
                onChange={(e) =>
                  setSelectedCards({
                    ...selectedCards,
                    [value]: e.currentTarget.checked,
                  })
                }
                disabled={value === 'survival' && !survivalPlotSelectable}
                label={value === 'survival' ? field : FIELD_LABELS[field]}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CohortCard;
