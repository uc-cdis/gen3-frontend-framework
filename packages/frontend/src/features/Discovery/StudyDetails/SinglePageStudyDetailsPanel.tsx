/**
 * Non tabbed version of the StudyDetailsPanel
 */
import React, { ReactElement } from 'react';
import { JSONObject } from '@gen3/core';
import {
  DataAuthorization,
  StudyPageConfig,
  StudyDetailsField,
} from '../types';
import DetailsAuthorizationIcon from './DetailsAuthorizationIcon';
import { JSONPath } from 'jsonpath-plus';
import { toString } from 'lodash';
import { DiscoveryDetailsRenderer } from './RendererFactory';

const createStudyFieldRendererElement = (
  field: StudyDetailsField,
  data: JSONObject,
) => {
  const name = field.includeLabel ? field.label : '';
  const studyFieldRenderer = DiscoveryDetailsRenderer(field.contentType, field?.renderer  ?? 'default');
  return (
    <div className={'flex w-full justify-between'}>
      <span>{name}</span> {studyFieldRenderer(field, data as any)}
    </div>
  );
};

const StudyTitle = ({ title }: { title: string }): ReactElement => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

interface SinglePageStudyDetailsPanelProps {
  readonly data: JSONObject;
  readonly studyConfig?: StudyPageConfig;
  readonly authorization?: DataAuthorization;
}

const SinglePageStudyDetailsPanel = ({
  data,
  studyConfig,
  authorization,
}: SinglePageStudyDetailsPanelProps): ReactElement => {
  if (!studyConfig) {
    return <div>Study Details Panel not configured</div>;
  }

  let headerText = '';
  if (studyConfig?.header?.field) {
    const res: JSONObject = JSONPath({
      path: '$..'.concat(studyConfig.header.field),
      json: data,
    });
    headerText = data.length ? toString(res[0]) : '';
  }
  return (
    <div className="flex flex-col">
      <StudyTitle title={headerText} />
      {authorization !== undefined && authorization?.enabled ? (
        <DetailsAuthorizationIcon studyData={data} dataAccess={authorization} />
      ) : false}
      {studyConfig.fieldsToShow.map((field) => {
        return (
          <div
            key={`${field.fields.join('-')}-details`}
            className={`${
              field.groupWidth == 'full' || field.groupWidth === undefined
                ? 'w-full'
                : 'w-1/2'
            }`}
          >
            <div className="flex flex-col">
              <div className="text-lg font-bold">{field.groupName}</div>
              {field.fields.map((field) => {
                const fieldValue = JSONPath({
                  path: `$..${field.field}`,
                  json: data,
                });
                const isFieldValueEmpty =
                  !fieldValue ||
                  fieldValue.length === 0 ||
                  fieldValue.every((val: never) => val === '');
                // display nothing if selected study doesn't have this field
                // and this field isn't configured to show a default value
                if (isFieldValueEmpty && !field.includeIfNotAvailable) {
                  return null;
                }

                return (
                  <div
                    key={`${field.label}-${field.field}`}
                    className="bg-accent-lightest w-full p-1 mb-4"
                  >
                    <div>{createStudyFieldRendererElement(field, data as any)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SinglePageStudyDetailsPanel;
