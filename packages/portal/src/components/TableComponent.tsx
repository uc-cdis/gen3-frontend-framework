import * as React from 'react';
import SimpleTable, { StyledColumn } from './Tables/SimpleTable';
import { Box } from '@mantine/core';
import BorderComponent from './BorderComponent';

interface TableComponentProp {
    title: string,
    rows: ReadonlyArray<object>,
    columns: ReadonlyArray<StyledColumn>,
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
