import * as React from 'react';
import SimpleTable from './Tables/SimpleTable';
import { Box } from '@mui/material';
import BorderComponent from './BorderComponent';


interface TableComponentProp {
    title: string,
    rows: ReadonlyArray<Record<string, unknown>>,
    columns: Array<Record<string, unknown>>,
}

const TableComponent = ({ title, rows, columns }: TableComponentProp) => (
    <BorderComponent title={title} >
        <Box style={{ height: 300}} >
            <SimpleTable
                data={rows}
                columns={columns}
                itemsPerPage={5}
                justify="center"
            />
        </Box>
    </BorderComponent>
);

export default TableComponent;
