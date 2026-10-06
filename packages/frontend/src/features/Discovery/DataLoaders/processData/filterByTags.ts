import type { JSONObject } from '@gen3/core/server';
import type { DiscoveryIndexConfig, SelectedTags } from '../../types';

const filterByTags = (
  studies: JSONObject[],
  selectedTags: SelectedTags,
  config: DiscoveryIndexConfig,
): JSONObject[] => {
  // check if tagsListField is defined in config
  const tagField = config?.minimalFieldMapping?.tagsListField;
  if (!tagField) {
    return studies;
  }

  // if no tags selected, show all studies
  if (Object.values(selectedTags).every((selected) => !selected)) {
    return studies;
  }

  return studies.filter((study) => {
    if (!study[tagField]) {
      return false;
    }
    if (!Array.isArray(study[tagField])) {
      return false;
    }
    return study[tagField].some((tag: any) => selectedTags[tag.name]);
  });
};

export default filterByTags;
