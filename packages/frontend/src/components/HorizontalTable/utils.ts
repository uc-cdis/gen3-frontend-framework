import { IndexObject, JSONObject } from '@gen3/core';
import { get } from 'lodash';
import { HorizontalTableProps } from './index';

/*
formatDataForHorizontalTable searches for data in an object and applies any modifiers provided to the located data. It then outputs data ready for the HorizontalTable component to use
*/
export const formatDataForHorizontalTable = (
  tableData: JSONObject | IndexObject,
  headersConfig: ReadonlyArray<{
    readonly field: string;
    readonly name: string;
    readonly modifier?: (value: any) => any;
  }>,
): HorizontalTableProps['tableData'] => {

  //match headers with available properties
  return headersConfig.reduce((output: any, obj) => {
    let value = get(tableData, obj.field);
    //run modifier if provided on value
    if (obj.modifier && value !== undefined && value !== null) {
      value = obj.modifier(value);
    }
    output.push({
      headerName: obj.name,
      values: [value ? value : '--'],
    });
    return output;
  }, []);
};`:w
`
