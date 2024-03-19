import React from 'react';
import { JSONObject } from '@gen3/core';
import { StudyPageConfig } from '../types';

interface StudyPageGroupProps {
    readonly studyDetails: JSONObject;
    readonly studyPageConfig: StudyPageConfig;
}

// TODO: Implement StudyPageGroup
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
