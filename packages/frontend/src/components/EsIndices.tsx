'use client';
import React from 'react';
import { useGetStatus } from '@gen3/core';
import { Box } from '@mantine/core';

const Indicies = () => {
    const { data, error } = useGetStatus();
    return (
        <Box>

        </Box>
    );
};

export default Indicies;
