import React, { ReactElement, useId } from 'react';
import Link from 'next/link';
import { isArray, toString } from 'lodash';
import { JSONPath } from 'jsonpath-plus';
import { Alert, Text } from '@mantine/core';
import {
  StudyDetailsField,
  StudyResource,
  StudyTabTagField,
} from '../../types';
import { accessibleFieldName, AccessLevel } from '../../../../utils';
import { RenderTagsCell } from '../../TableRenderers/CellRenderers';
import {
  FieldRendererFunction,
  FieldRendererFunctionMap,
  StudyDetailsRenderer,
  StudyFieldRendererFactory,
} from './RendererFactory';
import { fieldNameToLabel, JSONObject, JSONValue } from '@gen3/core';
import DataDownloadList from '../DataDownload/DataDownloadList';
import {
  BlockTextField,
  LabeledSingleLinkField,
  LabeledNumberField,
  LabeledMultipleLinkField,
  LabeledMultipleTextField,
  LabeledSingleTextField,
  LabeledParagraph,
} from './Renderers';

const linkFieldOnly = (linkValue: string, _?: string) => (
  <Link href={linkValue} target="_blank" rel="noreferrer">
    {linkValue}
  </Link>
);

/**
 * Represents a link field component that generates a hyperlink with an optional text label.
 *
 * @param linkValue - The target URL for the hyperlink.
 * @returns A JSX element containing the generated hyperlink.
 */
const linkField = (linkValue: string) => (
  <Link href={linkValue} target="_blank" rel="noreferrer">
    <Text c="utility.0" className="underline">
      {linkValue}
    </Text>
  </Link>
);

const subHeading = (text: string) => (
  <h3 className="discovery-subheading">{text}</h3>
);

interface LinkWithTitle {
  title: string;
  link: string;
}

const unlabeledMultipleLinkField = (
  fieldData: JSONValue,
  fieldName?: string,
) => {
  if (!isArray(fieldData) || fieldData.length === 0) return <React.Fragment />;
  const links = fieldData[0] as unknown as LinkWithTitle[];
  return (
    <div className="flex flex-col" key={`${fieldName}-links`}>
      {links.map((link) => LabeledSingleLinkField(link.link, link.title))}
    </div>
  );
};

const labeledYearOfBirthRestricted: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
) => {
  let stringFieldValue = '';
  if (typeof fieldValue === 'number') {
    stringFieldValue = fieldValue.toLocaleString();
  } else if (typeof fieldValue !== 'string') return <React.Fragment />;

  stringFieldValue = fieldValue as string;

  let displayContent;
  if (
    typeof stringFieldValue === 'string' &&
    !isNaN(Number(stringFieldValue)) &&
    Number(stringFieldValue) < 1935
  ) {
    displayContent = '1935';
  } else if (isArray(stringFieldValue)) {
    displayContent = stringFieldValue
      .map((item) => {
        if (
          typeof item === 'string' &&
          !isNaN(Number(item)) &&
          Number(item) < 1935
        ) {
          return '1935';
        }
        return item;
      })
      .join(', ');
  } else {
    displayContent = stringFieldValue;
  }

  return (
    <div
      className={discoveryFieldStyle}
      key={`study-details-${fieldLabel}-${displayContent}`}
    >
      {label(fieldLabel)} {textField(displayContent)}
    </div>
  );
};

const dataDownloadList: FieldRendererFunction = (
  resource: JSONValue,
  _: string | undefined,
) => {
  return (
    <>
      <DataDownloadList data={resource as JSONObject} />
    </>
  );
};

const accessDescriptor: FieldRendererFunction = (
  resource: JSONValue,
  _: string | undefined,
) => {
  if (
    resource === null ||
    typeof resource !== 'object' /*
    COMMENTING THIS OUT WILL BE IMPLEMENTED UNTIL HP-2378
    ||
    !(accessibleFieldName in resource) */
  ) {
    return <></>;
  }

  if (
    (resource as JSONObject)[accessibleFieldName] === AccessLevel.ACCESSIBLE
  ) {
    return <Alert color="green">You have access to this study.</Alert>;
  }
  if (
    (resource as JSONObject)[accessibleFieldName] === AccessLevel.UNACCESSIBLE
  ) {
    return <Alert color="red">You do not have access to this study.</Alert>;
  }
  return (
    <Alert color="yellow">
      This study does not include data access authorization details.
    </Alert>
  );
};

const formatResourceValuesWhenNestedArray = (
  resourceFieldValue: string[],
): string | string[] => {
  if (
    Array.isArray(resourceFieldValue) &&
    Array.isArray(resourceFieldValue[0])
  ) {
    return resourceFieldValue[0].join(', ');
  }
  return resourceFieldValue;
};

const renderDetailTags: FieldRendererFunction = (
  fieldValue: JSONValue,
  _label: string | undefined,
  fieldConfig?: Record<string, any>,
): ReactElement => {
  //TODO - fix this type
  const resource = fieldValue as StudyResource;

  if (fieldConfig === undefined) {
    return <React.Fragment />;
  }
  if (fieldConfig?.categories === undefined) {
    return <React.Fragment />;
  }

  if (fieldConfig.contentType === 'tags') {
    const tags = fieldConfig.categories
      ? (resource.tags || []).filter((tag) =>
          fieldConfig.categories?.includes(tag.category),
        )
      : resource.tags;

    return (
      <div key={`detail-tag-${fieldConfig.field}`}>
        {RenderTagsCell({ value: tags })}
      </div>
    );
  }
  return <React.Fragment />;
};

/**
 * Renders a field element based on the provided field configuration and resource data.
 *
 * @param {StudyDetailsField | StudyTabTagField} field - Field configuration that determines how the data should be rendered. This includes:
 *   @property {string} [field.field] - A JSONPath expression used to extract the field's value from the resource object.
 *   @property {boolean} [field.includeLabel] - Indicates whether to include a label for the rendered field.
 *   @property {string} [field.label] - Custom label to use for the field. If not provided, a default label is derived.
 *   @property {boolean} [field.includeIfNotAvailable] - Determines whether the field should be rendered if its value is not available.
 *   @property {JSONValue} [field.valueIfNotAvailable] - Fallback value to use when the desired value is unavailable.
 *   @property {string} field.contentType - Specifies the type of content to render (e.g., 'accessDescriptor', 'tags').
 *   @property {string} [field.renderer] - Specifies the rendering method. Defaults to 'default' if not provided.
 *   @property {object} [field.params] - Additional parameters to customize the field rendering.
 *
 * @param {JSONValue} resource - JSON object containing the data from which the field's value is extracted.
 *
 * @returns {ReactElement | null} A React element representing the rendered field, or null if the field should not be rendered.
 */
export const createFieldRendererElement = (
  field: StudyDetailsField | StudyTabTagField,
  resource: JSONValue,
): ReactElement | null => {
  // determine the value of the field
  let resourceFieldValue =
    field.field && JSONPath({ json: resource, path: field.field });

  if (
    !isArray(resourceFieldValue) ||
    resourceFieldValue.length == 0 ||
    resourceFieldValue[0] === null
  ) {
    if (field.includeIfNotAvailable === false) return null;
    if (field.valueIfNotAvailable) {
      resourceFieldValue = field.valueIfNotAvailable as JSONValue;
    } else {
      resourceFieldValue = '';
    }
  } else {
    resourceFieldValue = resourceFieldValue[0];
  }

  // This is a change from the original
  const hideLabel = field?.includeLabel !== undefined && !field?.includeLabel;

  const label = !hideLabel
    ? (field?.label ?? fieldNameToLabel(field.field ?? ''))
    : undefined;

  const studyFieldRenderer = StudyDetailsRenderer(
    field.contentType,
    field?.renderer ?? 'default',
  );
  switch (
    field.contentType // These are handled differently since these require the resource itself and not it's value
  ) {
    // the value
    case 'accessDescriptor': {
      return studyFieldRenderer(resource, label, field.params);
    }
    case 'tags': {
      return studyFieldRenderer(resource, label, { ...field.params, ...field });
    }
    case 'dataDownloadList': {
      return studyFieldRenderer(resource, label, field.params);
    }
    default:
      if (
        resourceFieldValue &&
        isArray(resourceFieldValue) &&
        resourceFieldValue.length > 0 &&
        resourceFieldValue[0].length !== 0 &&
        resourceFieldValue.every((val: unknown) => typeof val === 'string')
      ) {
        resourceFieldValue =
          formatResourceValuesWhenNestedArray(resourceFieldValue);
        return studyFieldRenderer(resourceFieldValue, label, field.params);
      } else if (
        resourceFieldValue !== undefined ||
        resourceFieldValue !== null
      )
        return studyFieldRenderer(resourceFieldValue, label, field.params);
  }

  return null;
};

const DefaultGen3StudyDetailsFieldsRenderers: Record<
  string,
  FieldRendererFunctionMap
> = {
  text: { default: LabeledSingleTextField },
  string: {
    default: LabeledSingleTextField,
    yearOfBirthRestricted: labeledYearOfBirthRestricted,
  },
  dataDownloadList: { default: dataDownloadList },
  link: { default: LabeledSingleLinkField },
  textList: { default: LabeledMultipleTextField },
  linkList: {
    default: LabeledMultipleLinkField,
    linkWithTitle: unlabeledMultipleLinkField,
  },
  block: { default: BlockTextField },
  accessDescriptor: { default: accessDescriptor },
  tags: { default: renderDetailTags },
  number: { default: LabeledNumberField },
  paragraphs: { default: LabeledParagraph },
};

StudyFieldRendererFactory.registerFieldRendererCatalog(
  DefaultGen3StudyDetailsFieldsRenderers,
);
