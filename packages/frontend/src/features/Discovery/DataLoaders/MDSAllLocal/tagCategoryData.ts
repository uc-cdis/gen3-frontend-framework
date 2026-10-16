import { JSONObject } from '@gen3/core';
import { categoryObject } from '../../types';
import { isTagInfoArray, TagsConfig } from '../../../Study/types';

const defaultCategoryDisplayName = (name: string): string => {
  const words = name.split('_').map((x) => x.toLowerCase());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ');
};

/**
 * Builds the data for the tag filter dropdown: one entry per configured tag
 * category with `display: true`, listing the (sorted) tags found in the studies.
 * @param studies - all studies, before any search or filtering
 * @param tagsConfig - the `tags` section of the discovery config
 * @param tagsField - name of the field holding each study's list of tags
 */
const buildTagCategoryData = (
  studies: JSONObject[],
  tagsConfig: TagsConfig | undefined,
  tagsField: string | undefined,
): categoryObject[] => {
  if (!tagsConfig?.tagCategories || !tagsField || !studies?.length) return [];

  return tagsConfig.tagCategories
    .filter((category) => category.display)
    .map((category) => {
      const tags = new Set<string>();
      studies.forEach((study) => {
        const studyTags = study[tagsField];
        if (!isTagInfoArray(studyTags)) return;
        studyTags.forEach((tag) => {
          if (tag.category === category.name) tags.add(tag.name);
        });
      });
      return {
        categoryDisplayName:
          category.displayName ?? defaultCategoryDisplayName(category.name),
        color: category.color,
        tags: Array.from(tags).sort((a, b) => a.localeCompare(b)),
      };
    });
};

export default buildTagCategoryData;
