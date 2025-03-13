import React, { ReactNode } from 'react';
import { JSONArray } from '@gen3/core';

export interface ChartTitleBarProps {
  readonly title?: ReactNode;
  readonly filename: string;
  readonly divId: string;
  readonly jsonData?: JSONArray;
}

const ChartTitleBar: React.FC<ChartTitleBarProps> = ({
  divId,
  title,
  filename,
  jsonData,
}: ChartTitleBarProps) => {
  return <div className="flex justify-between items-center">{title}</div>;
};

export default ChartTitleBar;
