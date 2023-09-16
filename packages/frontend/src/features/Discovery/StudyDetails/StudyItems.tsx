import React, { ReactElement } from 'react';
import Link from 'next/link';
import { JSONPath } from 'jsonpath-plus';
import { Alert } from '@mantine/core';
import {
  accessibleFieldName,
  DiscoveryResource,
  AccessLevel,
  StudyTabField,
  StudyTabTagField,
} from '../types';
import { RenderTagsCell } from '../TableRenderers/CellRenderers';
import {
  StudyFieldRendererFactory,
  FieldRendererFunction,
  FieldRendererFunctionMap,
  DiscoveryDetailsRenderer,
} from './RendererFactory';

const discoveryFieldStyle = 'flex px-0.5 justify-between whitespace-pre-wrap';

const blockTextField = (_: string, text = undefined) => (
  <div className={discoveryFieldStyle}>{text}</div>
);

const label = (text: string) => <b className={discoveryFieldStyle}>{text}</b>;

const textField = (text: string) => <span>{text}</span>;

const linkField = (text: string, _ = undefined) => (
  <Link href={text} target="_blank" rel="noreferrer">
    {text}
  </Link>
);

const subHeading = (text: string) => (
  <h3 className="discovery-subheading">{text}</h3>
);

const labeledSingleLinkField = (labelText: string, linkText: string) => (
  <div className="flex bg-red-500 px-0.5 justify-between whitespace-pre-wrap">
    {label(labelText)} {linkField(linkText)}
  </div>
);

const labeledMultipleLinkField = (labelText: string, linksText: string[]) =>
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
            <div /> {linkField(linkText)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  );

const labeledSingleTextField = (labelText: string, fieldText: string) => {
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
  console.log('accessDescriptor: resource: ', resource);
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
  if (fieldConfig.type === 'tags') {
    const tags = fieldConfig.categories
      ? (resource.tags || []).filter((tag) =>
          fieldConfig.categories?.includes(tag.category),
        )
      : resource.tags;
    return (
      <div key={`detail-tag-${fieldConfig.sourceField}`}>
        {RenderTagsCell({ value: tags })}
      </div>
    );
  }
  return <React.Fragment />;
};

export const createFieldRendererElementOrig = (
  field: StudyTabField | StudyTabTagField,
  resource: DiscoveryResource,
) => {
  let resourceFieldValue =
    field.sourceField && JSONPath({ json: resource, path: field.sourceField });
  if (
    resourceFieldValue &&
    resourceFieldValue.length > 0 &&
    resourceFieldValue[0].length !== 0
  ) {
    resourceFieldValue =
      formatResourceValuesWhenNestedArray(resourceFieldValue);

    switch (field.type) {
      case 'text': {
        return labeledSingleTextField(field.label, resourceFieldValue);
      }
      case 'link': {
        return labeledSingleLinkField(field.label, resourceFieldValue);
      }
      case 'textList': {
        return labeledMultipleTextField(field.label, resourceFieldValue);
      }
      case 'linkList': {
        return labeledMultipleLinkField(field.label, resourceFieldValue);
      }
      case 'block': {
        return blockTextField(field.label, resourceFieldValue);
      }
    }
  } else {
    switch (field.type) {
      case 'accessDescriptor': {
        console.log('accessDescriptor: resource: ', resource);
        return accessDescriptor(field.label, resource);
      }
      case 'tags': {
        console.log('tags: resource: ', resource);
        return renderDetailTags(field, resource);
      }
    }
  }
};

export const createFieldRendererElement = (
  field: StudyTabField | StudyTabTagField,
  resource: DiscoveryResource,
) => {
  let resourceFieldValue =
    field.sourceField && JSONPath({ json: resource, path: field.sourceField });
  const studyFieldRenderer = DiscoveryDetailsRenderer(field.type, 'default');
  if (
    resourceFieldValue &&
    resourceFieldValue.length > 0 &&
    resourceFieldValue[0].length !== 0
  ) {
    resourceFieldValue =
      formatResourceValuesWhenNestedArray(resourceFieldValue);
    return studyFieldRenderer(field.label, resourceFieldValue);
  } else {
    switch (field.type) {
      case 'accessDescriptor': {
        console.log('accessDescriptor: resource: ', resource);
        return studyFieldRenderer(field.label, resource);
      }
      case 'tags': {
        console.log('tags: resource: ', resource);
        return studyFieldRenderer(field, resource);
      }
    }
  }
};

const DefaultGen3StudyDetailsFieldsRenderers: Record<
  string,
  FieldRendererFunctionMap
> = {
  text: { default: labeledSingleTextField as FieldRendererFunction },
  link: { default: linkField as FieldRendererFunction },
  textList: { default: labeledMultipleTextField as FieldRendererFunction },
  linkList: { default: labeledMultipleLinkField as FieldRendererFunction },
  block: { default: blockTextField as FieldRendererFunction },
  accessDescriptor: { default: accessDescriptor as FieldRendererFunction },
  tags: { default: renderDetailTags as FieldRendererFunction },
};

StudyFieldRendererFactory.registerFieldRendererCatalog(
  DefaultGen3StudyDetailsFieldsRenderers,
);
