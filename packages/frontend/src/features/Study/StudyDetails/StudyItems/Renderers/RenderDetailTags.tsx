import React, { ReactElement } from 'react';
import { RenderTagsCell } from '../../../TableRenderers/CellRenderers';
import { StudyResource } from '../../../types';
import { FieldRendererFunction } from '../RendererFactory';
import { JSONValue } from '@gen3/core';

/**
 * Renders multiple tags *
 * @param {JSONValue} fieldValue - JSON object containing the data from which the field's value is extracted
 * @param {string} _label - Label for the tags
 * @param {Record<string, any>} [fieldConfig] - Configuration for rendering tags.
 * @returns {ReactElement | null} Returns tags cells
 */
const RenderDetailTags: FieldRendererFunction = (
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

export default RenderDetailTags;
