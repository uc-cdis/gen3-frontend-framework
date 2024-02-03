import React from 'react';
import { JSONObject } from '@gen3/core';
import { StudyPageConfig } from '../types';

interface StudyPageGroupProps {
    readonly studyDetails: JSONObject;
    readonly studyPageConfig: StudyPageConfig;
}

const StudyPageGroup = ({
                            studyDetails,
                            studyPageConfig,
} : StudyPageGroupProps) => {
    return (
        <div>

        </div>
    );
};

export default StudyPageGroup;
