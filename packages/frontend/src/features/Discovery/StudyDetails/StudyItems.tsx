import React, { ReactElement } from 'react';
import Link from 'next/link';
import { JSONPath } from 'jsonpath-plus';
import { Alert, Text } from '@mantine/core';
import {
  accessibleFieldName,
  DiscoveryResource,
  AccessLevel,
  StudyDetailsField,
  StudyTabTagField,
} from '../types';
import { RenderTagsCell } from '../TableRenderers/CellRenderers';
import {
  StudyFieldRendererFactory,
  FieldRendererFunction,
  FieldRendererFunctionMap,
  DiscoveryDetailsRenderer,
} from './RendererFactory';
import { JSONArray, JSONValue } from '@gen3/core';

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
    return <ul>{value.map((v, i) => <li key={i}>{jsonValueToElement(v)}</li>)}</ul>;
  } else if (typeof value === 'object' && value !== null) {
    // if JSONValue is an object (excluding null), display each property in its own line,
    // using a recursive call to display the value of each property
    return (
      <ul>
        {Object.entries(value).map(([k, v], i) =>
          <li key={i}><strong>{k}:</strong> {jsonValueToElement(v)}</li>
        )}
      </ul>
    )
  } else {
    // if JSONValue is null, or otherwise unhandled, return an empty fragment
    return <React.Fragment />;
  }
};

const discoveryFieldStyle = 'flex px-0.5 justify-between whitespace-pre-wrap';

const blockTextField = (text: JSONValue) => (
  <div className={discoveryFieldStyle}>{jsonValueToElement(text)}</div>
);

const label = (text?: string) => text ? <Text className={discoveryFieldStyle}>{text}</Text> : <span />;

const textField = (text: string) => <span>{text}</span>;

const linkField = (text: string, _ = undefined) => (
  <Link href={text} target="_blank" rel="noreferrer">
    {text}
  </Link>
);

const linkFieldWithTitle = (title: string, link: string) => (
  <Link href={link} target="_blank" rel="noreferrer">
    {title}
  </Link>
);

const subHeading = (text: string) => (
  <h3 className="discovery-subheading">{text}</h3>
);

const labeledSingleLinkField = (labelText: string | undefined, linkText: string) => (
  <div className={discoveryFieldStyle} key={labelText}>
    {label(labelText)} {linkField(linkText)}
  </div>
);

const labeledNumberField = (labelText: string | undefined, value: number | string) => (
  <div className={discoveryFieldStyle} key={labelText}>
    {label(labelText)} {value?.toLocaleString()}
  </div>
);

const labeledMultipleLinkField = (labelText: string, linksText: string[]) => {
  return (
  linksText.length ? (
    <div>
      {[
        // labeled first field
        <div className={discoveryFieldStyle} key={labelText}>
          {label(labelText)} {linkField(linksText[0])}
        </div>,
        // unlabeled subsequent fields
        ...linksText.slice(1).map((linkText, i) => (
          <div className={discoveryFieldStyle} key={`${linkText}-${i}`}>
            {label(labelText)}{linkField(linkText)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  ));
};

interface LinkWithTitle {
  title: string;
  link: string;
}

const unlabeledMultipleLinkField = (fieldName:string, fieldData: JSONArray ) => {
  const links = fieldData[0] as unknown as LinkWithTitle[];

  return (
    <div className="flex flex-col" key={`${fieldName}-links`}>
      {
        links.map((link) => linkFieldWithTitle(link.title, link.link))
      }
    </div>
  );
};

const labeledSingleTextField = (labelText: string | undefined | StudyDetailsField, fieldText: string) => {
  return (
    <div
      className={discoveryFieldStyle}
      key={`study-details-${labelText}-${fieldText}`}
    >
      {label(labelText)} {textField(fieldText)}
    </div>
  );
};

const labeledMultipleTextField = (
  labelText?: string,
  fieldsText?: string[],
): ReactElement =>
  fieldsText?.length ? (
    <div>
      {[
        // labeled first field
        <div className={discoveryFieldStyle} key={`study-details-${labelText}`}>
          {label(labelText ?? '')} {textField(fieldsText[0])}
        </div>,
        // unlabeled subsequent fields
        ...fieldsText.slice(1).map((text, i) => (
          <div className={discoveryFieldStyle} key={`${text}-${i}`}>
            <div /> {textField(text)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  );

const accessDescriptor = (
  _: string | undefined,
  resource: DiscoveryResource,
) => {
  if (resource[accessibleFieldName] === AccessLevel.ACCESSIBLE) {
    return <Alert color="green">You have access to this study.</Alert>;
  }
  if (resource[accessibleFieldName] === AccessLevel.UNACCESSIBLE) {
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

const renderDetailTags = (
  fieldConfig: StudyTabTagField,
  resource: DiscoveryResource,
): ReactElement => {
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

export const createFieldRendererElement = (
  field: StudyDetailsField | StudyTabTagField,
  resource: DiscoveryResource,
) => {

  // determine the value of the field
  let resourceFieldValue =
    field.field && JSONPath({ json: resource, path: field.field });
  if (!resourceFieldValue) {
    if (!field.includeIfNotAvailable) return null;
    if (field.valueIfNotAvailable)
      resourceFieldValue = field.valueIfNotAvailable;
  }

  const label = field.includeLabel === undefined || field?.includeLabel ? field.label : undefined;

  const studyFieldRenderer = DiscoveryDetailsRenderer(field.contentType, field?.renderer  ?? 'default');
  switch (field.contentType) {
    case 'accessDescriptor': {
      return studyFieldRenderer(label, resource, field.params);
    }
    case 'tags': {
      return studyFieldRenderer(label, resource, field.params);
    }
    default:
      if (
        resourceFieldValue &&
        resourceFieldValue.length > 0 &&
        resourceFieldValue[0].length !== 0 &&
        resourceFieldValue.every( (val : any ) => typeof val === 'string')
      ) {
        resourceFieldValue =
          formatResourceValuesWhenNestedArray(resourceFieldValue);
        return studyFieldRenderer(label, resourceFieldValue,  field.params);
      } else if (resourceFieldValue)
        return studyFieldRenderer(label, resourceFieldValue, field.params);

  }

  return <React.Fragment />;
};

const DefaultGen3StudyDetailsFieldsRenderers: Record<
  string,
  FieldRendererFunctionMap
> = {
  text: { default: labeledSingleTextField},
  string: { default: labeledSingleTextField },
  link: { default: labeledSingleLinkField as FieldRendererFunction },
  textList: { default: labeledMultipleTextField as FieldRendererFunction },
  linkList: { default: labeledMultipleLinkField as FieldRendererFunction, linkWithTitle: unlabeledMultipleLinkField as FieldRendererFunction },
  block: { default: blockTextField as FieldRendererFunction },
  accessDescriptor: { default: accessDescriptor as FieldRendererFunction },
  tags: { default: renderDetailTags as FieldRendererFunction },
  number: { default: labeledNumberField  as FieldRendererFunction  },
  paragraphs: { default: labeledSingleTextField as FieldRendererFunction },
};

StudyFieldRendererFactory.registerFieldRendererCatalog(
  DefaultGen3StudyDetailsFieldsRenderers,
);
