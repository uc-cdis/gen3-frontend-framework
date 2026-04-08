import React, { ReactElement } from 'react';
import { isArray } from 'lodash';
import { JSONPath } from 'jsonpath-plus';
import {
  StudyDetailsField,
  StudyResource,
  StudyTabTagField,
} from '../../types';
import { RenderTagsCell } from '../../TableRenderers/CellRenderers';
import {
  FieldRendererFunction,
  FieldRendererFunctionMap,
  StudyDetailsRenderer,
  StudyFieldRendererFactory,
} from './RendererFactory';
import { fieldNameToLabel, JSONValue } from '@gen3/core';
import {
  BlockTextField,
  LabeledSingleLinkField,
  LabeledNumberField,
  LabeledMultipleLinkField,
  LabeledMultipleTextField,
  LabeledSingleTextField,
  LabeledParagraph,
  UnlabeledMultipleLinkField,
  LabeledYearOfBirthRestricted,
  AccessDescriptor,
  DataDownloadListField,
  RenderDetailTags,
} from './Renderers';

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
    yearOfBirthRestricted: LabeledYearOfBirthRestricted,
  },
  dataDownloadList: { default: DataDownloadListField },
  link: { default: LabeledSingleLinkField },
  textList: { default: LabeledMultipleTextField },
  linkList: {
    default: LabeledMultipleLinkField,
    linkWithTitle: UnlabeledMultipleLinkField,
  },
  block: { default: BlockTextField },
  accessDescriptor: { default: AccessDescriptor },
  tags: { default: RenderDetailTags },
  number: { default: LabeledNumberField },
  paragraphs: { default: LabeledParagraph },
};

StudyFieldRendererFactory.registerFieldRendererCatalog(
  DefaultGen3StudyDetailsFieldsRenderers,
);
