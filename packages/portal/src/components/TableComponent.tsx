import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import BorderComponent from './BorderComponent';

/* eslint-disable  @typescript-eslint/no-explicit-any */

interface TableComponentProp {
    title: string,
    rows: Array<any>,
    columns: Array<GridColDef>,
}

const TableComponent = ({ title, rows, columns }: TableComponentProp) => (
    <BorderComponent title={title} >
        <Box height={300}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableColumnMenu
            />
        </Box>
    </BorderComponent>
);

export default TableComponent;
