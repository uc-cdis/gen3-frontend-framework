'use client';
import React from 'react';
import { useGetStatus } from '@gen3/core';
import { Code } from '@mantine/core';

/**
 * Gets the status of guppy service via the useGetStatus hook defined in
 * ./core/src/features/guppy/guppySlice.ts
 * @returns - a div containing a status heading and the status JSON response
 */
const Status = () => {
    const { data, error } = useGetStatus();
    return (
        <div>
            <h1>Status</h1>
            <Code>{JSON.stringify(data)}</Code>
        </div>
    );
};

export default Status;
