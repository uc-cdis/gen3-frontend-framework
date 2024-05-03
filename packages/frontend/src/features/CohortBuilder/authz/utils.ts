

// if true, means user has unaccessible fields in aggsData
import { JSONValue, JSONObject, isJSONValueArray, isHistogramData } from '@gen3/core';
import { difference, isArray } from 'lodash';

export function checkForAnySelectedUnaccessibleField(
  aggsData: any,
  accessibleFieldObject: any,
  fieldToCheck: string) {
  let accessValuesInAggregationList = [];
  if (!accessibleFieldObject || !accessibleFieldObject[fieldToCheck]) {
    return false;
  }

  const accessibleValues = accessibleFieldObject[fieldToCheck];
  if (aggsData
    && aggsData[fieldToCheck]
    && 'histogram' in aggsData[fieldToCheck]
    && aggsData[fieldToCheck].histogram
    && isHistogramData(aggsData[fieldToCheck])) {
    accessValuesInAggregationList = aggsData[fieldToCheck].histogram.map((entry:any) => entry.key);
    const outOfScopeValues = difference(accessValuesInAggregationList, accessibleValues);
    if (outOfScopeValues.length > 0) { // trying to get inaccessible data is forbidden
      return true;
    }
    return false;
  }
  return false;
}

// if true, means user don't have access to any project
export function checkForNoAccessibleProject(
  accessibleFieldObject:JSONObject,
  fieldToCheck:string) {
  if (!accessibleFieldObject || !(fieldToCheck in accessibleFieldObject)) {
    return false;
  }
  // if (isJSONValueArray(accessibleFieldObject[fieldToCheck])) {
  //  return (accessibleFieldObject[fieldToCheck].length === 0);
  // }
  return false;
}

// if true, means user have full access to all projects
export function checkForFullAccessibleProject(
  unaccessibleFieldObject:JSONObject,
  fieldToCheck:string) {
  if (!unaccessibleFieldObject || !unaccessibleFieldObject[fieldToCheck]) {
    return false;
  }
  //return (unaccessibleFieldObject[fieldToCheck].length === 0);
  return false;
}
