/**
 * Non tabbed version of the StudyDetailsPanel
 */
import React, { ReactElement } from 'react';
import { useDeepCompareMemo } from 'use-deep-compare';
import { JSONObject, JSONValue } from '@gen3/core';
import { DataAuthorization, StudyPageConfig } from '../types';
import DetailsAuthorizationIcon from './DetailsAuthorizationIcon';
import { JSONPath } from 'jsonpath-plus';
import { toString } from 'lodash';
import { createFieldRendererElement } from './StudyItems';
import DownloadLinksPanel from '../StudyPage/DownloadLinksPanel';

const StudyTitle = ({
  title,
  className = 'font-header text-lg font-semibold',
}: {
  title: string;
  className?: string;
}): ReactElement => {
  return (
    <div>
      <h1 className={className}>{title}</h1>
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
      path: studyConfig.header.field,
      json: data,
    });
    headerText = res.length ? toString(res[0]) : '';
  }

  const elements = useDeepCompareMemo(() => {
    if (studyConfig === undefined || studyConfig === null) {
      return <div>Study Details Panel not configured</div>;
    } else {
      return studyConfig?.fieldsToShow.map((field) => {
        return (
          <div
            key={`${field.fields.join('-')}-details`}
            className={`px-2 ${
              field.groupWidth == 'full' || field.groupWidth === undefined
                ? 'w-full'
                : 'w-1/2'
            }`}
          >
            <div className="flex flex-col">
              {field?.groupName ? (
                <div className="text-lg font-bold">{field.groupName}</div>
              ) : null}
              {field.fields.map((field) => {
                const element = createFieldRendererElement(
                  field,
                  data as JSONValue,
                );
                if (element !== null) {
                  return (
                    <div
                      key={`item-${field.field}`}
                      className={`flex w-full bg-base-lightest my-1 justify-between rounded-md py-1.5 px-1 text-sm ${
                        field?.classNames?.['root'] ?? ''
                      }`}
                    >
                      {element}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        );
      });
    }
  }, [studyConfig, data]);

  return (
    <div className="flex flex-col">
      <StudyTitle
        title={headerText}
        className={studyConfig?.header?.className}
      />
      {authorization !== undefined && authorization?.enabled ? (
        <DetailsAuthorizationIcon studyData={data} dataAccess={authorization} />
      ) : (
        false
      )}
      <div className="flex flex-wrap w-full">{elements}</div>
      {studyConfig?.downloadLinks && (
        <DownloadLinksPanel
          studyData={data}
          downloadLinks={studyConfig?.downloadLinks}
        />
      )}
    </div>
  );
};

export default SinglePageStudyDetailsPanel;
