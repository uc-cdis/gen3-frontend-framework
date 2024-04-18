import React, { useMemo } from 'react';
import {
  MantineReactTable,
  MRT_Cell,
  type MRT_SortingState,
  type MRT_PaginationState,
  useMantineReactTable,
} from 'mantine-react-table';
import StudyDetails from '../../Discovery/StudyDetails/StudyDetails';
import { LoadingOverlay } from '@mantine/core';

const ProjectTable = () => {



  return (
    <React.Fragment>
      <StudyDetails />
      <div className="grow w-auto inline-block overflow-x-scroll">
        <LoadingOverlay visible={ dataRequestStatus.isLoading} />
        <MantineReactTable table={table} />
      </div>
    </React.Fragment>
  );
}
