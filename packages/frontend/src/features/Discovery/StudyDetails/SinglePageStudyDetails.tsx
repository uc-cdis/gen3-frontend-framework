/**
 * Non tabbed version of the StudyDetailsPanel
 */
import React, { ReactElement } from 'react';
import { JSONObject } from '@gen3/core';
import { DataAuthorization, accessibleFieldName, StudyPageConfig, DiscoveryResource } from '../types';
import DetailsAuthorizationIcon from './DetailsAuthorizationIcon';
import { JSONPath } from 'jsonpath-plus';
import { toString } from 'lodash';

const StudyTitle = ({ title } :  { title:string}) : ReactElement => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}


interface SinglePageStudyDetailsPanelProps {
  readonly data: DiscoveryResource;
  readonly studyConfig: StudyPageConfig;
  readonly authorization?: DataAuthorization;
}

const SinglePageStudyDetails = ({
  data,
  studyConfig,
  authorization,

}: SinglePageStudyDetailsPanelProps): ReactElement => {
  let headerText = '';
  if (studyConfig?.header?.field) {
    var res : JSONObject  = JSONPath({ path: "$..".concat(studyConfig.header.field), json: data });
    headerText = data.length ? toString(res[0]) : '';
  }
  return (
      <div className="flex flex-col">
        <StudyTitle title={headerText} />
        {authorization !== undefined && authorization?.enabled ? <DetailsAuthorizationIcon studyData={data as JSONObject} dataAccess={authorization} /> : false}
        {studyConfig.fieldsToShow.map((field) => {
          return (

            <div key={`${field.fields.join('-')}-details`}
                 className={`${field.groupWidth == "full" || field.groupWidth === undefined ? "w-full" : "w-1/2"}`}>
              <div className="flex flex-col">
                <div className="text-lg font-bold">{field.groupName}</div>
                {field.fields.map((fieldName) => {
                  const value = JSONPath({ path: `$..${fieldName.field}`, json: data });
                  return (
                    <div key={`${fieldName.name}-${fieldName.field}`} className="flex flex-row justify-between">
                      <div className="text-sm font-bold">{fieldName.name}</div>
                      <div className="text-sm">{value}</div>
                    </div>
                  );
                })}
              </div>
            </div>);
        })}
    </div>);
}
