import React from 'react';

interface ChartContentProps {
  chart: string;
  dataHook: string;
  parameters: Record<string, any>;
  width?: string;
}

const ChartContent = ({
  chart,
  dataHook,
  parameters,
  width = 'w-1/2',
}: ChartContentProps) => {

  const

  return (
    <div className={`flex justify-center pt-2 items-center m-2 ${width ?? ''}`}>
      <div
        data-testid={dataHook}
        data-chart={chart}
        data-parameters={JSON.stringify(parameters)}
      />
    </div>
  );
};
