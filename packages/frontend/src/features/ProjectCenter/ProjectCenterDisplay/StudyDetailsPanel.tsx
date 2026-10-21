import React from 'react';
import type { ReactElement } from 'react';
import type { JSONObject, JSONValue } from '@gen3/core';
import { ProjectCenterDetailsConfig } from '../types';
import { JSONPath } from 'jsonpath-plus';
import { toString, isArray } from 'lodash';
import { getTagInfo } from '../../Study/utils';
import { StudyDetailsField, TagData } from '../../Study/types';
import { accessibleFieldName, AccessLevel, DataAuthorization } from '../../../utils';
import DownloadLinksPanel from './DownloadLinksPanel';
import { Alert, Divider, Anchor, Text, DataList, Group, Title, Badge, Tabs } from '@mantine/core';
import { Icon } from '@iconify-icon/react';

const StudyTitle = ({
  title,
  className = 'font-header text-xl font-bold text-accent',
}: {
  title: string;
  className?: string;
}): ReactElement => {
  return (<h1 className={className}>{title}</h1>);
};

interface DetailsAccessProps {
  dataAccess: boolean;
}

const DetailsAuthorizationIcon = ({
  dataAccess,
}: DetailsAccessProps) => {
  const icon = <Icon icon="gen3:error-outline" size={24} />;
  if (dataAccess) {
    return (
      <Alert
        variant="light"
        color="green.0"
        icon={icon}
        classNames={{
          root:"border-green-400 p-1 px-2 my-auto flex-none",
          icon: "m-auto"
        }}
      >
        You have access to this data.
      </Alert>);
  } else {
    return (
      <Alert
        variant="light"
        color="gray"
        icon={icon}
        classNames={{
          root:"border-gray-300 p-1 px-2 my-auto flex-none",
          icon: "m-auto"
        }}
      >
        You do not have access to this data.
      </Alert>);
  }
};

interface SinglePageStudyDetailsPanelProps {
  readonly value: string; // Tabs.Panel value, matches the Tabs.Tab value
  readonly data: any;
  readonly studyConfig?: ProjectCenterDetailsConfig;
  readonly authorization?: DataAuthorization;
}

const StudyDetailsPanel = ({
  value,
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

  const detailsAuthorized = authorization?.enabled && data[accessibleFieldName] &&
      data[accessibleFieldName] === AccessLevel.ACCESSIBLE;

  const returnDataToRender = (
    field: StudyDetailsField,
    data: JSONValue,
  ): string | null => {
    const found = field.field ? JSONPath({ json: data, path: field.field }) : undefined;
    if (!isArray(found) || found.length === 0 || found[0] === null) {
      if (field.includeIfNotAvailable === false) return null;
      return field.valueIfNotAvailable !== undefined
        ? toString(field.valueIfNotAvailable)
        : '';
    }
    return toString(found[0]);
  };

  const renderDataToContentType = (field: StudyDetailsField, dataString: string) => {
    switch (field.contentType) {
      case "link":
        return (<Anchor href={dataString} target="_blank">{dataString}</Anchor>);
      case "string":
      case "paragraph":
      default:
        return (<Text>{dataString}</Text>);
    }
  };

  const renderRow = (field: StudyDetailsField, count: number) => {
    const dataToRender = returnDataToRender(field, data as JSONValue);
    if (dataToRender === null) return null;

    return (
      <DataList.Item key={count}>
        <DataList.ItemLabel>{field.name}</DataList.ItemLabel>
        <DataList.ItemValue>{renderDataToContentType(field, dataToRender)}</DataList.ItemValue>
      </DataList.Item>
    );
  };

  const renderTag = (tag: TagData, count: number): ReactElement[] => {
    const { color, display, label } = getTagInfo(tag, studyConfig?.tags);
    if (display && label) {
      return [
        <Badge key={`tag-${count}`} variant="outline" color={color} radius="sm" className='mt-2 mr-2 text-black font-normal border-2 h-6 normal-case'>{label}</Badge>,
      ];
    }
    return [];
  };
  const renderTagArea = () => {
    if (data?.tags && Array.isArray(data.tags)) {
      const outputTags = (data.tags as TagData[]).flatMap(renderTag);
      if (outputTags.length > 0) {
        return (
          <div>
            <Title order={3} size={14} className='uppercase pt-8'>{studyConfig?.tags?.title ?? 'Data Categories'}</Title>
            <Group>
              {outputTags}
            </Group>
          </div>
        );
      }
    }
  }

  return (
  <Tabs.Panel value={value}>
      <div className="flex flex-col p-5">
        <div className="flex justify-between">
          <StudyTitle
            title={headerText}
            className={studyConfig?.header?.className}
          />
          {authorization !== undefined && authorization?.enabled ? (
            <DetailsAuthorizationIcon dataAccess={detailsAuthorized} />
          ) : (
            false
          )}
        </div>
        <Divider size="sm" my="md" />
        {(studyConfig === undefined || studyConfig === null)? (
          <div>Study Details Panel not configured</div>
        ):(
          <div className="flex w-full gap-8 items-start">
            <DataList orientation="horizontal" withDivider classNames={{
              root: "border rounded-lg flex-nowrap flex-none",
              item: "!m-0 !p-0 items-center first:rounded-tl-lg",
              itemLabel: "bg-base-light text-black font-bold uppercase p-4 min-w-32 w-min content-center rounded-tl-[inherit] self-stretch",
              itemValue: "p-2 pr-4 max-w-96 self-center"
            }}>
                {studyConfig?.dataTableFields?.map(renderRow)}
            </DataList>
            <div className="">
              <DataList orientation="vertical" classNames={{
                root: "",
                item: "",
                itemLabel: "text-black font-bold uppercase pb-4",
                itemValue: ""
              }}>
                {studyConfig?.rightOfTableFields?.map(renderRow)}
              </DataList>
              {renderTagArea()}
            </div>
          </div>
        )}
        {studyConfig?.downloadLinks && (
          <DownloadLinksPanel
            studyData={data}
            downloadLinks={studyConfig?.downloadLinks}
            downloadLinkFields={studyConfig?.downloadLinkFields}
            disabled={!!authorization?.enabled && !detailsAuthorized}
          />
        )}
      </div>
  </Tabs.Panel>
  );
};

export default StudyDetailsPanel;
