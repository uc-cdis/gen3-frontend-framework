import React, { useEffect, useState } from 'react';
import { ActionIcon, Card, SegmentedControlItem, Tooltip } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import { Buckets, FacetDefinition, Operation, Statistics } from '@gen3/core';
import SegmentedControl from '../../../components/SegmentedControl';
// restore later when API and FacetDictionary is implemented
import { DownloadProgressContext } from '../../Analysis/context';
import { ChartTypes, DataDimension, DownloadType } from '../types';
import ContinuousData from './ContinuousData';
import CategoricalData from './CategoricalData';
import {
  CONTINUOUS_FACET_TYPES,
  DATA_DIMENSIONS,
  HIDE_QQ_BOX_FIELDS,
  MISSING_KEY,
} from '../constants';
import { toDisplayName, useDataDimension } from '../utils';
import { BarChartIcon, CloseIcon, SurvivalChartIcon } from '..//icons';

interface CDaveCardProps {
  field: string;
  facetDefinition: FacetDefinition;
  data: Buckets | Statistics;
  updateFields: (field: string) => void;
  initialDashboardRender: boolean;
  cohortFilters: Operation;
  color: string;
}

const CDaveCard: React.FC<Readonly<CDaveCardProps>> = ({
  field,
  facetDefinition,
  data,
  updateFields,
  initialDashboardRender,
  cohortFilters,
  color,
}: CDaveCardProps) => {
  const [chartType, setChartType] = useState<ChartTypes>('histogram');
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [downloadType, setDownloadType] = useState<DownloadType>(null);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>();
  const displayDataDimension = useDataDimension(field);

  const [dataDimension, setDataDimension] = useState<DataDimension>(
    displayDataDimension && DATA_DIMENSIONS?.[field]?.toggleValue
      ? DATA_DIMENSIONS?.[field]?.toggleValue
      : (DATA_DIMENSIONS?.[field]?.unit ?? 'Unset'),
  );

  const continuous = CONTINUOUS_FACET_TYPES.includes(facetDefinition.type);

  let noData = true; // start off assuming no data
  if (data) {
    // check if we have enough data to display
    if (continuous) {
      noData = (data as Statistics)?.count === 0;
    } else {
      noData = (data as Buckets)?.buckets?.every(
        (bucket) => bucket.key === MISSING_KEY,
      );
    }
  }

  const fieldName = toDisplayName(field);

  useEffect(() => {
    if (!initialDashboardRender) {
      scrollIntoView();
    }
    // this should only happen on initial component mount
  }, []);

  const chartButtons: SegmentedControlItem[] = [
    {
      value: 'histogram',
      label: (
        <Tooltip
          label="Histogram"
          position="bottom-end"
          withArrow
          arrowSize={7}
        >
          <div
            data-testid="button-histogram-plot"
            role="button"
            aria-label={`Select ${fieldName} histogram plot`}
          >
            <BarChartIcon size={20} aria-hidden="true" />
          </div>
        </Tooltip>
      ),
    },
    {
      value: 'survival',
      label: (
        <Tooltip label={'Survival Plot'} withArrow arrowSize={7}>
          <div
            data-testid="button-survival-plot"
            role="button"
            aria-label={`Select ${fieldName} survival plot`}
          >
            <SurvivalChartIcon size={20} aria-hidden="true" />
          </div>
        </Tooltip>
      ),
    },
  ];

  if (continuous && !HIDE_QQ_BOX_FIELDS.includes(field)) {
    // TODO: Re-enable when API are completed
    /* ----
    chartButtons.push({
      value: "boxqq",
      label: (
        <Tooltip label={"Box/QQ Plot"} withArrow arrowSize={7}>
          <div
            className="opacity-50"
            data-testid="button-box-qq-plot"
            aria-disabled={true}
            aria-label={`Select ${fieldName} Box/QQ Plot`}
            style={{ cursor: "not-allowed" }}
          >
            <BoxPlotIcon size={20} className={"rotate-90"} aria-hidden="true" />
          </div>
        </Tooltip>
      ),
    });
     */
  }

  return (
    <Card
      data-testid={`${fieldName}-card`}
      padding="md"
      radius={0}
      ref={targetRef}
      className="border-1 border-base-lighter h-full flex flex-col relative"
    >
      <div className="flex justify-between mb-1">
        <h2 className="font-heading font-medium">{fieldName}</h2>
        <div className="flex gap-2 h-7 items-center">
          {displayDataDimension && (
            <SegmentedControl
              data={[
                DATA_DIMENSIONS?.[field]?.toggleValue ?? 'Unset',
                DATA_DIMENSIONS?.[field]?.unit,
              ]}
              onChange={(d) => setDataDimension(d as DataDimension)}
              disabled={noData || downloadInProgress}
              padding={1}
            />
          )}
          <SegmentedControl
            data={chartButtons}
            onChange={(c) => setChartType(c as ChartTypes)}
            disabled={noData || downloadInProgress}
            padding={1}
          />
          <Tooltip
            label="Remove Card"
            position="bottom-end"
            withArrow
            arrowSize={7}
          >
            <ActionIcon
              data-testid="button-remove-card"
              onClick={() => updateFields(field)}
              className="border-primary bg-white"
              aria-label={`Remove ${fieldName} card`}
            >
              <CloseIcon
                className="text-primary"
                aria-hidden="true"
                size="1rem"
              />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
      <DownloadProgressContext.Provider
        value={{ downloadInProgress, setDownloadInProgress }}
      >
        {noData ? (
          <div className="h-[32.1rem] w-full flex flex-col justify-start">
            <p className="mx-auto my-2">No data for this property</p>
          </div>
        ) : continuous ? (
          <ContinuousData
            initialData={data as Statistics}
            field={field}
            fieldName={fieldName}
            chartType={chartType}
            noData={noData}
            cohortFilters={cohortFilters}
            dataDimension={dataDimension}
          />
        ) : (
          <CategoricalData
            initialData={(data as Buckets)?.buckets}
            field={field}
            fieldName={fieldName}
            chartType={chartType}
            noData={noData}
            color={color}
          />
        )}
      </DownloadProgressContext.Provider>
    </Card>
  );
};

export default CDaveCard;
