import React from 'react';
import { Card, Text, Group, Stack, ScrollArea, Table } from '@mantine/core';
import { HistogramDataArray } from '@gen3/core';

// Compute statistics
const computeStatistics = (
  baseData: HistogramDataArray,
  comparisonData: HistogramDataArray,
) => {
  const buckets = baseData.map((item) =>
    typeof item.key !== 'string'
      ? `${item.key[0]} to ${item.key[1]}`
      : item.key,
  );
  const baseValues = baseData.map((item) => item.count);
  const cmpValues = comparisonData.map((item) => item.count);

  // Mean Absolute Error (MAE)
  const mae =
    baseValues.reduce(
      (sum, value, index) => sum + Math.abs(value - cmpValues[index]),
      0,
    ) / buckets.length;

  // Root Mean Square Error (RMSE)
  const rmse = Math.sqrt(
    baseValues.reduce(
      (sum, value, index) => sum + Math.pow(value - cmpValues[index], 2),
      0,
    ) / buckets.length,
  );

  // Pearson Correlation Coefficient
  const baseAve =
    baseValues.reduce((sum, value) => sum + value, 0) / buckets.length;
  const cmpAvg =
    cmpValues.reduce((sum, value) => sum + value, 0) / buckets.length;
  const numerator = baseValues.reduce(
    (sum, value, index) =>
      sum + (value - baseAve) * (cmpValues[index] - cmpAvg),
    0,
  );
  const denominator = Math.sqrt(
    baseValues.reduce((sum, value) => sum + Math.pow(value - baseAve, 2), 0) *
      cmpValues.reduce((sum, value) => sum + Math.pow(value - cmpAvg, 2), 0),
  );
  const correlation = numerator / denominator;

  // Chi-Square Statistic
  const chiSquare = baseValues.reduce((sum, value, index) => {
    const expected = value;
    const observed = cmpValues[index];
    return sum + Math.pow(observed - expected, 2) / expected;
  }, 0);

  const robustChiSquare = baseValues.reduce((sum, expected, index) => {
    const observed = cmpValues[index];
    if (expected === 0 && observed === 0) {
      return sum; // Both expected and observed are 0, no contribution to chi-square
    } else if (expected === 0) {
      return sum + observed; // Add observed value to chi-square when expected is 0
    } else {
      return sum + Math.pow(observed - expected, 2) / expected;
    }
  }, 0);

  // Chi-Square Contributions
  const chiSquareContributions = buckets.map((group, index) => {
    const expected = baseValues[index];
    const observed = cmpValues[index];
    let contribution = 0;
    if (expected === 0 && observed === 0) {
      contribution = 0;
    } else if (expected === 0) {
      contribution = observed;
    } else {
      contribution = Math.pow(observed - expected, 2) / expected;
    }
    return { group, contribution };
  });

  return { mae, rmse, correlation, robustChiSquare, chiSquareContributions };
};

interface LabeledValueProps {
  label: string;
  value: string;
}

const LabeledValueRow: React.FC<LabeledValueProps> = ({ label, value }) => {
  return (
    <Group justify="space-between">
      <Text fw={600} size="sm" className="uppercase">
        {label}
      </Text>
      <Text size="sm" c="primary">
        {value}
      </Text>
    </Group>
  );
};

interface StatisticsCardProps {
  title: string;
  baseData: HistogramDataArray;
  comparisonData: HistogramDataArray;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  baseData,
  comparisonData,
}) => {
  const metrics = computeStatistics(baseData, comparisonData);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="lg" fw={700} mb="md">
        {title}
      </Text>

      <Stack gap="xs">
        <LabeledValueRow
          label="Mean Absolute Error (MAE)"
          value={metrics.mae.toFixed(4)}
        />
        <LabeledValueRow
          label="Root Mean Square Error (RMSE)"
          value={metrics.rmse.toFixed(4)}
        />
        <LabeledValueRow
          label="Pearson Correlation Coefficient"
          value={metrics.correlation.toFixed(4)}
        />
        <LabeledValueRow
          label="Robust Chi-Square Statistic"
          value={metrics.robustChiSquare.toFixed(4)}
        />
        <Text fw={600} size="sm" className="uppercase">
          Chi-Square Contributions by Group
        </Text>
        <ScrollArea h={300}>
          <Table
            striped
            withTableBorder
            withColumnBorders
            stickyHeader
            stickyHeaderOffset={0}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Group</Table.Th>
                <Table.Th>Contribution</Table.Th>
              </Table.Tr>
            </Table.Thead>
            {metrics.chiSquareContributions.map(({ group, contribution }) => (
              <Table.Tr key={group}>
                <Table.Td>{group}</Table.Td>
                <Table.Td>{contribution.toFixed(4)}</Table.Td>
              </Table.Tr>
            ))}
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
  );
};

export default StatisticsCard;
