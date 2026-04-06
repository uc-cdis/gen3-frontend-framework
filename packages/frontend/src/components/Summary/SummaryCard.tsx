import React, { JSX } from "react";
import { HeaderTitle } from "../tailwindComponents";
import { HorizontalTable, HorizontalTableProps } from "../HorizontalTable";

export interface SummaryCardProps {
  readonly title?: string;
  readonly tableData: HorizontalTableProps["tableData"];
  readonly customDataTestID?: string;
  readonly enableSync?: boolean;
  readonly ref?: React.RefObject<HTMLTableElement>;
}

export const SummaryCard = (
  {
    ref,
    title = "Summary",
    tableData,
    customDataTestID,
    enableSync = false
  }: SummaryCardProps
): JSX.Element => {
  return (
    <div className="flex flex-col gap-2 flex-grow">
      {title !== "" ? (
        <HeaderTitle>{title}</HeaderTitle>
      ) : (
        <div className="h-7" />
      )}

      <HorizontalTable
        customDataTestID={customDataTestID}
        tableData={tableData}
        enableSync={enableSync}
        ref={ref}
      />
    </div>
  );
};
