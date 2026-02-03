import React, { useEffect, useState } from 'react';
import { Alert, LoadingOverlay } from '@mantine/core';
import {
  convertFilterToGqlFilter,
  Intersection,
  Operation,
  useCoreSelector,
} from '@gen3/core';
import {
  convertFilterSetToOperation,
  selectCurrentCohortCaseFilters as selectCurrentCohortFilters,
} from '@/core/utils';
import {
  EmptySurvivalPlot,
  useGetSurvivalPlotQuery,
} from '@/core/features/survival';
import { useIsDemoApp } from '@/hooks/useIsDemoApp';
import { SurvivalPlotTypes } from '@/features/charts/SurvivalPlot/types';
import { getFormattedTimestamp } from '@/utils/date';
import { isInterval, parseContinuousBucket, toDisplayName } from '../utils';
import { CategoricalBins, CustomInterval, NamedFromTo } from '../types';
import { DEMO_COHORT_FILTERS } from '../constants';
import { ExternalDownloadStateSurvivalPlot } from '@/features/charts/SurvivalPlot/SurvivalPlot';

export const isIntersection = (o: Operation): o is Intersection =>
  (o as Intersection).operator === 'and';

interface ClinicalSurvivalPlotProps {
  readonly field: string;
  readonly selectedSurvivalPlots: string[];
  readonly customBinnedData:
    | CategoricalBins
    | NamedFromTo[]
    | CustomInterval
    | null;
  readonly continuous: boolean;
}

const ClinicalSurvivalPlot: React.FC<ClinicalSurvivalPlotProps> = ({
  field,
  selectedSurvivalPlots,
  customBinnedData,
  continuous,
}: ClinicalSurvivalPlotProps) => {
  const isDemoMode = useIsDemoApp();
  const [plotType, setPlotType] = useState<SurvivalPlotTypes | undefined>(
    undefined,
  );
  const cohortFilters = useCoreSelector((state) =>
    convertFilterSetToOperation(
      isDemoMode
        ? DEMO_COHORT_FILTERS
        : selectCurrentCohortFilters(state, 'case_centric'),
    ),
  );

  useEffect(() => {
    if (selectedSurvivalPlots.length === 0) {
      setPlotType(SurvivalPlotTypes.overall);
    } else {
      if (continuous) {
        setPlotType(SurvivalPlotTypes.continuous);
      } else {
        setPlotType(SurvivalPlotTypes.categorical);
      }
    }
  }, [selectedSurvivalPlots, continuous]);

  const filters =
    selectedSurvivalPlots.length === 0
      ? cohortFilters && [cohortFilters]
      : selectedSurvivalPlots.map((value) => {
          const content: Array<Operation> = [];
          if (cohortFilters) {
            content.push(cohortFilters);
          }

          if (continuous) {
            if (
              customBinnedData !== null &&
              !isInterval(customBinnedData as NamedFromTo[] | CustomInterval)
            ) {
              const dataPoint = (customBinnedData as NamedFromTo[]).find(
                (bin) => bin.name === value,
              );

              if (dataPoint !== undefined) {
                content.push({
                  operator: '>=',
                  field: field,
                  operand: dataPoint.from,
                });

                content.push({
                  operator: '<',
                  field,
                  operand: dataPoint.to,
                });
              }
            } else {
              const [fromValue, toValue] = parseContinuousBucket(value);

              content.push({
                operator: '>=',
                field,
                operand: fromValue,
              });

              content.push({
                operator: '<',
                field,
                operand: toValue,
              });
            }
          } else {
            if (
              typeof customBinnedData?.[
                value as keyof typeof customBinnedData
              ] === 'object'
            ) {
              content.push({
                operator: '=',
                field: field,
                operand: Object.keys(
                  customBinnedData[value as keyof typeof customBinnedData],
                )[0],
              });
            } else {
              content.push({
                operator: '=',
                field: field,
                operand: value,
              });
            }
          }

          return {
            operator: 'and',
            operands: content,
          } satisfies Intersection;
        });

  const { data, isError, isFetching } = useGetSurvivalPlotQuery({
    filters:
      filters?.map((x) => {
        return convertFilterToGqlFilter(x);
      }) ?? [],
  });

  return isError ? (
    <div className="h-64">
      <Alert color="red">Something&apos;s gone wrong</Alert>
    </div>
  ) : (
    <div className="relative">
      <LoadingOverlay data-testid="loading-spinner" visible={isFetching} />
      <ExternalDownloadStateSurvivalPlot
        data={data ?? EmptySurvivalPlot}
        height={150}
        title={toDisplayName(field)}
        showTitleOnlyOnDownload
        field={field}
        names={selectedSurvivalPlots}
        plotType={plotType}
        downloadFileName={`${field
          .split('.')
          .at(-1)}-survival-plot.${getFormattedTimestamp()}`}
        tableTooltip
      />
    </div>
  );
};

export default ClinicalSurvivalPlot;
