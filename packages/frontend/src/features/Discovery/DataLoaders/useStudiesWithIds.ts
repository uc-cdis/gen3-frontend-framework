import { useEffect, useMemo } from 'react';
import type { JSONObject } from '@gen3/core';

const NO_STUDIES: JSONObject[] = [];

/**
 * Drops studies that have no value in uidField, since they can't be searched,
 * selected or linked to, and warns with the number dropped.
 * Pass a stable `studies` reference (e.g. RTK Query data or a useMemo result).
 * @param studies - study objects, or undefined while loading
 * @param uidField - field holding each study's unique id
 * @returns the studies with ids and the count of studies dropped
 */
export const useStudiesWithIds = (
  studies: ReadonlyArray<JSONObject> | undefined,
  uidField: string,
): { studiesWithIds: JSONObject[]; missingIdCount: number } => {
  const result = useMemo(() => {
    if (!studies) return { studiesWithIds: NO_STUDIES, missingIdCount: 0 };
    const studiesWithIds = studies.filter((study) => !!study[uidField]);
    return {
      studiesWithIds,
      missingIdCount: studies.length - studiesWithIds.length,
    };
  }, [studies, uidField]);

  useEffect(() => {
    if (result.missingIdCount > 0) {
      console.warn(
        `Discovery: ignoring ${result.missingIdCount} study record(s) without a "${uidField}" field`,
      );
    }
  }, [result.missingIdCount, uidField]);

  return result;
};
