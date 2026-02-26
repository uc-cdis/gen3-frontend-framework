import React, { useRef, useState } from 'react';
import { useDeepCompareEffect, useDeepCompareMemo } from 'use-deep-compare';
import {
  Accessibility,
  FilterSet,
  NumericFromTo,
  Statistics,
  useCustomRangeQuery,
} from '@gen3/core';
import CDaveHistogram from './CDaveHistogram';
import CDaveTable from './CDaveTable';
// import ClinicalSurvivalPlot from './ClinicalSurvivalPlot';
import CardControls from './CardControls';
import { isArray } from 'lodash';
import {
  ChartTypes,
  ClinicalDataFacet,
  ClinicalDataFacetProps,
  CustomInterval,
  DataDimension,
  DisplayData,
  NamedFromTo,
  SelectedFacet,
} from '../types';
import { MISSING_KEY, SURVIVAL_PLOT_MIN_COUNT } from '../constants';
import {
  convertDataDimension,
  createBuckets,
  isInterval,
  parseContinuousBucket,
  roundContinuousValue,
} from '../utils';
import ContinuousBinningModal from '../ContinuousBinningModal/ContinuousBinningModal';
import BoxQQSection from './BoxQQSection';
import { JSONPath } from 'jsonpath-plus';
import { labelToPlural } from '../../../utils/labels';

const EmptyContinuousStats = {
  min: 0,
  max: 0,
  mean: 0,
  median: 0,
  stddev: 0,
  std_dev: 0,
  iqrL: 0,
  q1L: 0,
  q3: 0,
  q1: 0,
  iqr: 0,
};
const processContinuousResultData = (
  data: Record<string, any>,
  customBinnedData: NumericFromTo[],
  facet: ClinicalDataFacet,
  dataDimension: DataDimension,
): DisplayData => {
  // convert data to buckets
  const countByRangeBucket = Object.values(
    data?.data?._aggregation ?? {},
  ).reduce((acc: Record<string, number>, value, idx) => {
    const r = customBinnedData[idx];
    const bucket = `${r.from}-${r.to}`;

    const valueData = JSONPath({
      json: value as any,
      path: '$..count',
      resultType: 'value',
    });

    const countValue = isArray(valueData) ? valueData[0] : valueData;
    if (acc[bucket]) {
      acc[bucket] += countValue;
    } else acc[bucket] = countValue;

    return acc;
  }, {});

  return Object.entries(countByRangeBucket).map(([k, v]) => ({
    displayName: toBucketDisplayName(
      k,
      facet,
      dataDimension,
      customBinnedData !== null,
    ),
    key: k,
    count: v,
  }));
};

const toBucketDisplayName = (
  bucket: string,
  facet: ClinicalDataFacet,
  dataDimension: DataDimension,
  hasCustomBins: boolean,
): string => {
  const [fromValue, toValue] = parseContinuousBucket(bucket);
  const originalDataDimension = facet.dataDimension?.unit ?? 'Unset';
  return `${roundContinuousValue(
    convertDataDimension(
      Number(fromValue),
      originalDataDimension,
      dataDimension,
    ),
    facet,
    hasCustomBins,
  )?.toLocaleString()} to <${roundContinuousValue(
    convertDataDimension(Number(toValue), originalDataDimension, dataDimension),
    facet,
    hasCustomBins,
  )?.toLocaleString()}`;
};

interface ContinuousDataProps {
  initialData: Statistics;
  facet: ClinicalDataFacetProps;
  chartType: ChartTypes;
  noData: boolean;
  cohortFilters: FilterSet;
  dataDimension: DataDimension;
  index: string;
  indexPrefix?: string;
  accessLevel?: Accessibility;
  fieldsAreFlat?: boolean;
  color: string;
}

const ContinuousData: React.FC<Readonly<ContinuousDataProps>> = ({
  initialData,
  facet,
  chartType,
  noData,
  cohortFilters,
  dataDimension,
  index,
  indexPrefix = '',
  accessLevel = Accessibility.ALL,
  fieldsAreFlat = true,
  color,
}: ContinuousDataProps) => {
  const [customBinnedData, setCustomBinnedData] = useState<
    CustomInterval | NamedFromTo[] | null
  >(null);
  const [binningModalOpen, setBinningModalOpen] = useState(false);
  const [selectedSurvivalPlots, setSelectedSurvivalPlots] = useState<string[]>(
    [],
  );
  const [selectedFacets, setSelectedFacets] = useState<SelectedFacet[]>([]);
  const [yTotal, setYTotal] = useState(0);
  const dataDimensionRef = useRef(dataDimension);
  const hasCustomBins = customBinnedData !== null;

  const ranges = useDeepCompareMemo(
    () =>
      isInterval(customBinnedData)
        ? createBuckets(
            customBinnedData.min,
            customBinnedData.max,
            customBinnedData.interval,
          )
        : isArray(customBinnedData) && customBinnedData?.length > 0
          ? customBinnedData.map((d) => ({
              to: d.to,
              from: d.from,
            }))
          : createBuckets(initialData?.min ?? 0, initialData?.max ?? 100),
    [customBinnedData, initialData],
  );

  const {
    data: rangeData,
    isFetching,
    isSuccess,
  } = useCustomRangeQuery({
    field: facet.field,
    ranges: ranges as Array<NumericFromTo>,
    filters: cohortFilters,
    index,
    indexPrefix: indexPrefix,
    accessibility: accessLevel,
    isNested: !fieldsAreFlat,
    asTextHistogram: true,
    rangeBaseName: 'range',
  });

  const statsData = null; // TODO: enable stats data

  const unitLabel = labelToPlural(facet.dataTypename);

  const displayedData = useDeepCompareMemo(
    () =>
      processContinuousResultData(
        isSuccess ? rangeData : {},
        ranges,
        facet,
        dataDimension,
      ),
    [isSuccess, rangeData, customBinnedData, facet, dataDimension],
  );

  useDeepCompareEffect(() => {
    if (dataDimensionRef.current !== dataDimension) {
      dataDimensionRef.current = dataDimension;
    } else {
      setSelectedSurvivalPlots(
        displayedData
          .filter(
            ({ count, key }) =>
              key !== MISSING_KEY && count >= SURVIVAL_PLOT_MIN_COUNT,
          )
          .sort((a, b) => b.count - a.count)
          .map(({ key }) => key)
          .slice(0, 2),
      );
    }

    console.log('displayedData', displayedData);
    if (customBinnedData === null) {
      setYTotal(displayedData.reduce((a, b) => a + (b?.count ?? 0), 0));
    }

    setSelectedFacets([]);
  }, [dataDimension, displayedData, customBinnedData]);

  return (
    <>
      {chartType === 'boxqq' ? (
        <BoxQQSection
          facet={facet}
          displayName={facet?.label ?? facet.field}
          data={statsData ?? EmptyContinuousStats}
          dataDimension={dataDimension}
          hasCustomBins={hasCustomBins}
          color={color}
        />
      ) : (
        <>
          <div className="flex-grow">
            {chartType === 'histogram' ? (
              <CDaveHistogram
                data={displayedData}
                field={facet.field}
                yTotal={yTotal}
                isFetching={isFetching}
                hideYTicks={displayedData.every((val) => val.count === 0)}
                noData={noData}
                color={color}
                unitLabel={unitLabel}
              />
            ) : null}
          </div>
          <CardControls
            continuous={true}
            facet={facet}
            displayedData={displayedData}
            yTotal={yTotal}
            setBinningModalOpen={setBinningModalOpen}
            customBinnedData={customBinnedData}
            setCustomBinnedData={setCustomBinnedData}
            selectedFacets={selectedFacets}
            dataDimension={dataDimension}
          />
          <CDaveTable
            facet={facet}
            yTotal={yTotal}
            displayedData={displayedData}
            hasCustomBins={customBinnedData !== null}
            survival={chartType === 'survival'}
            selectedSurvivalPlots={selectedSurvivalPlots}
            setSelectedSurvivalPlots={setSelectedSurvivalPlots}
            selectedFacets={selectedFacets}
            setSelectedFacets={setSelectedFacets}
            dataDimension={dataDimension}
            unitLabel={facet.dataDimension?.unit ?? 'Unset'}
          />
        </>
      )}

      <ContinuousBinningModal
        opened={binningModalOpen}
        setModalOpen={setBinningModalOpen}
        facet={facet}
        stats={initialData}
        updateBins={setCustomBinnedData}
        customBins={customBinnedData}
        dataDimension={dataDimension}
      />
    </>
  );
};

export default ContinuousData;
