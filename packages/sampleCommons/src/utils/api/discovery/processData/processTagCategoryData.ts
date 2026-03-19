import { JSONObject } from '@gen3/core';
import { DiscoveryIndexConfig } from '../types/discoveryApi';

interface category {
  name: string;
  displayName?: string;
  display: boolean;
  color: string;
}
interface categoryData {
  categoryDisplayName: string;
  color: string;
  tags: string[];
}
interface tag {
  category: string;
  name: string;
}

const processTagCategoryData = (
  data: Array<JSONObject>,
  discoveryConfig: DiscoveryIndexConfig,
) => {
  const allCategoryData: categoryData[] = [];
  const getTagsInCategory = (category: category) => {
    if (!data || !data.length) {
      return [];
    }
    const tagMap: { [key: string]: number } = {};
    const tagField = discoveryConfig.minimalFieldMapping.tagsListFieldName;
    data.forEach((study) => {
      if (study[tagField]) {
        (study[tagField] as []).forEach((tag: tag) => {
          if (tag.category === category.name) {
            tagMap[tag.name] = 1;
          }
        });
      }
    });
    const tagArray = Object.keys(tagMap).sort((a, b) => a.localeCompare(b));
    return tagArray;
  };

  discoveryConfig.tags.tagCategories.map((category: category) => {
    let categoryDisplayName = category.displayName;
    if (!categoryDisplayName) {
      // Capitalize category name
      const categoryWords = category.name
        .split('_')
        .map((x) => x.toLowerCase());
      categoryWords[0] =
        categoryWords[0].charAt(0).toUpperCase() + categoryWords[0].slice(1);
      categoryDisplayName = categoryWords.join(' ');
    }
    const tagsInCategory = getTagsInCategory(category);
    const categoryData = {
      categoryDisplayName: categoryDisplayName,
      color: category.color,
      tags: tagsInCategory,
    };
    if (category.display) {
      allCategoryData.push(categoryData);
    }
  });
  return allCategoryData;
};

export default processTagCategoryData;
