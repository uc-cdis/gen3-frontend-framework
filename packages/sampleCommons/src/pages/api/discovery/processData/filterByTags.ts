import { JSONObject } from '@gen3/core/dist';
import { DiscoveryIndexConfig, selectedTags } from '../types/discoveryApi';

const filterByTags = (
  studies: JSONObject[],
  selectedTags: selectedTags,
  config: DiscoveryIndexConfig,
): JSONObject[] => {
  // if no tags selected, show all studies
  if (Object.values(selectedTags).every((selected) => !selected)) {
    return studies;
  }
  const tagField = config.minimalFieldMapping.tagsListFieldName;
  return studies.filter((study) => {
    if (!study[tagField]) {
      return false;
    }
    return study[tagField].some((tag) => selectedTags[tag.name]);
  });
};

export default filterByTags;
