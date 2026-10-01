import type { DiscoveryIndexConfig } from '../../types';
import type { TagInfo } from '../../../Study/types';
import { isTagInfoArray } from '../../../Study/types';
import type { JSONObject } from '@gen3/core';

const filterByTags = (
  studies: JSONObject[],
  selectedTags: any,
  config: DiscoveryIndexConfig,
): JSONObject[] => {
  const tagField = config?.minimalFieldMapping?.tagsListFieldName;
  if (!tagField) {
    return studies;
  }
  // if no tags selected, show all studies
  if (Object.values(selectedTags).every((selected) => !selected)) {
    return studies;
  }

  return studies.filter((study) => {
    if (!isTagInfoArray(study[tagField])) return false;
    if (!study[tagField]) {
      return false;
    }

    return (study[tagField] as unknown as TagInfo[]).some(
      (tag: TagInfo) => selectedTags[tag.name],
    );
  });
};

export default filterByTags;
