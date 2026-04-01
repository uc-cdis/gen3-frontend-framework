import React, { ReactElement, useId } from 'react';
import Link from 'next/link';
import { isArray, toString } from 'lodash';
import { JSONPath } from 'jsonpath-plus';
import { Alert, Text } from '@mantine/core';
import { StudyDetailsField, StudyResource, StudyTabTagField } from '../types';
import { accessibleFieldName, AccessLevel } from '../../../utils';
import { RenderTagsCell } from '../TableRenderers/CellRenderers';
import {
  FieldRendererFunction,
  FieldRendererFunctionMap,
  StudyDetailsRenderer,
  StudyFieldRendererFactory,
} from './RendererFactory';
import { fieldNameToLabel, JSONObject, JSONValue } from '@gen3/core';
import DataDownloadList from './DataDownload/DataDownloadList';
import DownloadButtonsRow from './DataDownload/DownloadButtonsRow/DownloadButtonsRow';

/**
 * Converts a JSON value into a React element.
 *
 * @param {JSONValue} value - The JSON value to convert.
 * @returns {ReactElement} The React element representing the JSON value.
 */
const jsonValueToElement = (value: JSONValue): ReactElement => {
  if (typeof value === 'string') {
    // if JSONValue is a string, display it inside a span
    return <span>{value}</span>;
  } else if (typeof value === 'boolean') {
    // if JSONValue is a boolean, display it inside a span
    return <span>{value.toString()}</span>;
  } else if (typeof value === 'number') {
    // if JSONValue is a number, display it inside a span
    return <span>{value}</span>;
  } else if (Array.isArray(value)) {
    // if JSONValue is an array, map each item into a list element and wrap them in a ul
    return (
      <ul>
        {value.map((v, i) => (
          <li key={i}>{jsonValueToElement(v)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === 'object' && value !== null) {
    // if JSONValue is an object (excluding null), display each property in its own line,
    // using a recursive call to display the value of each property
    return (
      <ul>
        {Object.entries(value).map(([k, v], i) => (
          <li key={i}>
            <strong>{k}:</strong> {jsonValueToElement(v)}
          </li>
        ))}
      </ul>
    );
  } else {
    // if JSONValue is null, or otherwise unhandled, return an empty fragment
    return <React.Fragment />;
  }
};

/**
 * Default style for discovery field.
 */
const discoveryFieldStyle = 'flex w-full justify-between px-1 no-wrap gap-x-2';

/**
 * Renders a block of text.
 *
 * @param {JSONValue} fieldValue - The value to render.
 * @returns {ReactElement} The rendered block of text.
 */
const blockTextField = (fieldValue: JSONValue): ReactElement => (
  <div className={discoveryFieldStyle}>{jsonValueToElement(fieldValue)}</div>
);

/**
 * Renders a label for a field. If the label text is undefined, returns an empty fragment.
 * @param labelText - the label text to render.
 */
const label = (labelText?: string): ReactElement =>
  labelText ? (
    <Text
      tt="uppercase"
      fw="700"
      size="sm"
      className="p-0.75 whitespace-pre-wrap break-words"
    >
      {labelText}
    </Text>
  ) : (
    <React.Fragment />
  );

/**
 * Renders a text field component.
 *
 * @param {string} fieldValue - The value to be displayed in the text field.
 * @returns {React.Element} - The rendered text field component.
 */
const textField = (fieldValue: JSONValue, style = ''): ReactElement => (
  <span
    className={`text-left overflow-hidden p-0.75 whitespace-pre-wrap break-words ${style}`}
  >
    <Text size="sm">{toString(fieldValue)}</Text>
  </span>
);

/**
 * Represents a link field component that generates a hyperlink with an optional text label.
 *
 * @param linkValue - The target URL for the hyperlink.
 * @param linkText - The optional text label for the hyperlink. If not provided, the linkValue will be used as the label.
 * @returns A JSX element containing the generated hyperlink.
 */
const linkFieldWithOptionalLabel = (
  linkValue: string,
  linkText?: string,
): ReactElement => (
  <Link href={linkValue} target="_blank" rel="noreferrer">
    {linkText ?? linkValue}
  </Link>
);

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
    <Text color="utility.0" className="underline">
      {linkValue}
    </Text>
  </Link>
);

const subHeading = (text: string) => (
  <h3 className="discovery-subheading">{text}</h3>
);

const labeledSingleLinkField = (
  linkValue: JSONValue,
  labelText?: string,
  parans?: Record<string, any>,
) =>
  typeof linkValue !== 'string' ? (
    <React.Fragment />
  ) : (
    <div className={discoveryFieldStyle} key={labelText}>
      {label(labelText)} {linkField(linkValue)}
    </div>
  );

const labeledNumberField = (fieldValue: JSONValue, labelText?: string) => {
  if (typeof fieldValue !== 'number' && typeof fieldValue !== 'string')
    return <React.Fragment />;
  return (
    <div className={discoveryFieldStyle} key={labelText}>
      {label(labelText)} {fieldValue?.toLocaleString()}
    </div>
  );
};

const labeledMultipleLinkField = (value: JSONValue, labelText?: string) => {
  const linksText = isArray(value) ? value : [toString(value)];
  return linksText.length ? (
    <div>
      {[
        // labeled first field
        <div className={discoveryFieldStyle} key={labelText}>
          {label(labelText)} {linkField(linksText[0] as string)}
        </div>,
        // unlabeled subsequent fields
        ...linksText.slice(1).map((linkText, i) => (
          <div className={discoveryFieldStyle} key={`${linkText}-${i}`}>
            {label(labelText)}
            {linkField(linkText as string)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  );
};

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
      {links.map((link) => labeledSingleLinkField(link.link, link.title))}
    </div>
  );
};

const labeledSingleTextField: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
  params?: Record<string, any>,
) => {
  let stringFieldValue = '';
  if (typeof fieldValue === 'number') {
    stringFieldValue = fieldValue.toLocaleString();
  } else if (typeof fieldValue !== 'string') return <React.Fragment />;

  stringFieldValue = fieldValue as string;
  const id = useId();
  return (
    <div
      className={discoveryFieldStyle}
      key={`study-details-${fieldLabel}-${stringFieldValue}-${id}`}
    >
      {label(fieldLabel)} {textField(stringFieldValue, params?.style ?? '')}
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

const labeledParagraph: FieldRendererFunction = (
  fieldValue: JSONValue,
  fieldLabel?: string,
) => {
  if (typeof fieldValue !== 'string') return <React.Fragment />;

  const stringFieldValue = fieldValue as string;
  return (
    <div
      className={`${discoveryFieldStyle}`}
      key={`study-details-${fieldLabel}-${stringFieldValue}`}
    >
      {fieldLabel ? (
        <Text
          tt="uppercase"
          fw="500"
          className="p-0.75 mr-4 whitespace-pre-wrap break-words"
        >
          {fieldLabel}
        </Text>
      ) : (
        <React.Fragment />
      )}

      <div>
        <Text className="pl-4 text-left p-0.75 whitespace-pre-wrap break-words">
          {toString(fieldValue)}
        </Text>
      </div>
    </div>
  );
};

const labeledMultipleTextField: FieldRendererFunction = (
  fieldsText: JSONValue,
  labelText?: string,
): ReactElement => {
  return isArray(fieldsText) && fieldsText?.length ? (
    <div>
      {[
        // labeled first field
        <div className={discoveryFieldStyle} key={`study-details-${labelText}`}>
          {label(labelText ?? '')} {textField(fieldsText[0] as string)}
        </div>,
        // unlabeled subsequent fields
        ...fieldsText.slice(1).map((text, i) => (
          <div className={discoveryFieldStyle} key={`${text}-${i}`}>
            <div />
            {textField(text)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  );
};

const dataDownloadList: FieldRendererFunction = (
  resource: JSONValue,
  _: string | undefined,
) => {
  console.log('Ln 343 StudyItems. _:', _, ' Resource: ', resource);
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
      console.log('line 490');
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
  text: { default: labeledSingleTextField },
  string: {
    default: labeledSingleTextField,
    yearOfBirthRestricted: labeledYearOfBirthRestricted,
  },
  dataDownloadList: { default: dataDownloadList },
  link: { default: labeledSingleLinkField },
  textList: { default: labeledMultipleTextField },
  linkList: {
    default: labeledMultipleLinkField,
    linkWithTitle: unlabeledMultipleLinkField,
  },
  block: { default: blockTextField },
  accessDescriptor: { default: accessDescriptor },
  tags: { default: renderDetailTags },
  number: { default: labeledNumberField },
  paragraphs: { default: labeledParagraph },
};

StudyFieldRendererFactory.registerFieldRendererCatalog(
  DefaultGen3StudyDetailsFieldsRenderers,
);
