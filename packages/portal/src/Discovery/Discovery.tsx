import React from 'react';
import { PropsWithChildren, useEffect, useState } from "react";
import { useGetMetadataQuery } from '@gen3/core';

const Discovery : React.FC<unknown> = () => {
    const { data, error, isLoading } = useGetMetadataQuery("")
    console.log("data");
    return (
        <div className="w-100 bg-gray-200" >
            Content
        </div>
    )
}

export default Discovery;
