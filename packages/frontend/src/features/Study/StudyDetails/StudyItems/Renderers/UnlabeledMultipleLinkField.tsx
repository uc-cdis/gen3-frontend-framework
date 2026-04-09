import React, { useId } from 'react';
import { JSONValue } from '@gen3/core';
import { isArray } from 'lodash';
import LabeledSingleLinkField from './LabeledSingleLinkField';

interface LinkWithTitle {
  title: string;
  link: string;
}
/**
 * Renders multiple unlabeled text fields
 *
 * @param {JSONValue} fieldData - JSON object containing the data from which the field's value is extracted
 * @param {string} fieldName - Used to generate a stable React key identifier
 * @returns {ReactElement | null} Returns multiple unlabeled links
 */
const UnlabeledMultipleLinkField = (
  fieldData: JSONValue,
  fieldName?: string,
) => {
  if (!isArray(fieldData) || fieldData.length === 0) return <React.Fragment />;
  const links = fieldData[0] as unknown as LinkWithTitle[];
  const id = useId();
  return (
    <div className="flex flex-col" key={`${fieldName}-links-${id}`}>
      {links.map((link) => LabeledSingleLinkField(link.link, link.title))}
    </div>
  );
};

export default UnlabeledMultipleLinkField;
