/**
 * Non tabbed version of the StudyDetailsPanel
 */
import React, { ReactElement, useMemo } from 'react';
import { JSONObject, JSONValue } from '@gen3/core';
import {
  DataAuthorization,
  StudyPageConfig,
  StudyDetailsField,
} from '../types';
import DetailsAuthorizationIcon from './DetailsAuthorizationIcon';
import { JSONPath } from 'jsonpath-plus';
import { toString } from 'lodash';
import { createFieldRendererElement } from './StudyItems';
import { DiscoveryDetailsRenderer } from './RendererFactory';
import { useMenuContext } from '@mantine/core/lib/Menu/Menu.context';


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


  let headerText = '';
  if (studyConfig?.header?.field) {
    const res: JSONObject = JSONPath({
      path: '$..'.concat(studyConfig.header.field),
      json: data,
    });
    headerText = data.length ? toString(res[0]) : '';
  }

  const elements = useMemo(() => {
    if (!studyConfig) {
      return <div>Study Details Panel not configured</div>;
    }
    return studyConfig?.fieldsToShow.map((field) => {
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

              return (
                <div
                  key={`${field.label}-${field.field}`}
                  className="bg-accent-lightest w-full p-1 mb-4"
                >
                  <div>{createFieldRendererElement(field, data as JSONValue)}</div>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  }, [studyConfig, data]);

  return (
    <div className="flex flex-col">
      <StudyTitle title={headerText} />
      {authorization !== undefined && authorization?.enabled ? (
        <DetailsAuthorizationIcon studyData={data} dataAccess={authorization} />
      ) : false}
      {elements}
    </div>
  );
};

export default SinglePageStudyDetailsPanel;
