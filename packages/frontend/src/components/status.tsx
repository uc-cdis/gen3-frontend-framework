'use client';
import React from 'react';
import { useGetStatus } from '@gen3/core';
import { Code } from '@mantine/core';

const Status = () => {
    const { data } = useGetStatus();
    return (
        <div>
            <h1>Status</h1>
            <Code>{JSON.stringify(data)}</Code>
        </div>
    );
};

export default Status;
