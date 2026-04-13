import React from 'react';
import Label from './Label';
import LinkField from './LinkField';
import { discoveryFieldStyle } from './utils';
import { isArray, toString } from 'lodash';
import { JSONValue } from '@gen3/core';
import LinkFieldWithOptionalLabel from './LinkFieldWithOptionalLabel';

type LinkTitle = { link: string; title: string };

/**
 * Renders an UI of multiple labeled links
 *
 * @param {JSONValue | LinkTitle[]} value - JSON object containing the data from which the field's value is extracted,
 * or an array of LinkTitle when the field is represented as link titles.
 * @returns {ReactElement | null} Returns a Labeled multiple link field formated either as with labels for the items
 */
const LabeledMultipleLinkField = (
  value: JSONValue | LinkTitle[],
  labelText?: string,
) => {
  const isLinkTitle = (obj: any): boolean => {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      typeof (obj as any).link === 'string' &&
      typeof (obj as any).title === 'string'
    );
  };
  const isArrayOfLinkTitle = (arr: LinkTitle[]): boolean => {
    return Array.isArray(arr) && arr.every(isLinkTitle);
  };
  const linksText = isArray(value) ? value : [toString(value)];

  if (!value) return <></>;
  // Return for when data is in format {link:'',title:''}
  if (isArrayOfLinkTitle(value as LinkTitle[])) {
    return (
      <>
        {(value as LinkTitle[]).map((linkTitle: LinkTitle, i: number) => (
          <div
            className={`${discoveryFieldStyle} mb-5`}
            key={`${linkTitle.link}-${i}`}
          >
            {LinkFieldWithOptionalLabel(linkTitle.link, linkTitle.title)}
          </div>
        ))}
      </>
    );
  }
  // Output for all other formats
  return linksText.length ? (
    <div>
      {[
        // labeled first field
        <div className={discoveryFieldStyle} key={labelText}>
          {Label(labelText)} {LinkField(linksText[0] as string)}
        </div>,
        // unlabeled subsequent fields
        ...linksText.slice(1).map((linkText: any, i: number) => (
          <div className={discoveryFieldStyle} key={`${linkText}-${i}`}>
            {Label(labelText)}
            {LinkField(linkText)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  );
};

export default LabeledMultipleLinkField;
