import React from 'react';
import { JSONValue } from '@gen3/core';
import { isArray } from 'lodash';
import LabeledSingleLinkField from './LabeledSingleLinkField';

interface LinkWithTitle {
  title: string;
  link: string;
}
const UnlabeledMultipleLinkField = (
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

export default UnlabeledMultipleLinkField;
