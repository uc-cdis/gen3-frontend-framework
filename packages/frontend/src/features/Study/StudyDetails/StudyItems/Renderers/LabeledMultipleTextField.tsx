import React, { ReactElement } from 'react';
import { JSONValue } from '@gen3/core';
import { isArray } from 'lodash';
import { FieldRendererFunction } from '../RendererFactory';
import { discoveryFieldStyle } from './utils';
import Label from './Label';
import TextField from './TextField';

/**
 * Renders multiple labeled text fields
 *
 * @param {JSONValue} fieldsText - JSON object containing the data from which the field's value is extracted
 * @param {string} labelText - Label for the text fields
 * @returns {ReactElement | null} Returns a label followed by multiple text fields
 */
const LabeledMultipleTextField: FieldRendererFunction = (
  fieldsText: JSONValue,
  labelText?: string,
): ReactElement => {
  return isArray(fieldsText) && fieldsText?.length ? (
    <div>
      {[
        // labeled first field
        <div className={discoveryFieldStyle} key={`study-details-${labelText}`}>
          {Label(labelText ?? '')} {TextField(fieldsText[0] as string)}
        </div>,
        // unlabeled subsequent fields
        ...fieldsText.slice(1).map((text, i) => (
          <div className={discoveryFieldStyle} key={`${text}-${i}`}>
            <div />
            {TextField(text)}
          </div>
        )),
      ]}
    </div>
  ) : (
    <React.Fragment />
  );
};

export default LabeledMultipleTextField;
