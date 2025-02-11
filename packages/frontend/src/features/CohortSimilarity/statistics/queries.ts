import { AggregationsData } from '@gen3/core';
import { JSONPath } from 'jsonpath-plus';

export const processQueryResponse = (data: Record<string, any>) => {};

const convertToValidJSON = (inputString: string): string => {
  // Remove all newline characters and extra spaces
  let cleanedString = inputString.replace(/\s+/g, ' ').trim();

  // Add quotes around property names that aren't already quoted
  cleanedString = cleanedString.replace(/(\w+):/g, '"$1":');

  // Replace single quotes with double quotes (if any)
  cleanedString = cleanedString.replace(/'/g, '"');

  return cleanedString;
};

export const createSimilarityQuery = (
  fields: Record<string, string> = {
    age_at_index: 'age_at_index',
    sex: 'sex',
    ethnicity: 'ethnicity',
    race: 'race',
  },
) => {
  // TODO refactor to make this usable for all facets
  return {
    query: `
  query ($filter_0_4: JSON, $filter_5_11: JSON, $filter_12_15: JSON, $filter_16_17: JSON, $filter_18_29: JSON, $filter_30_39: JSON, $filter_40_49: JSON, $filter_50_64: JSON, $filter_65_74: JSON, $filter_75_84: JSON, $filter_85_plus: JSON) {
  _aggregation {
    case {
          _totalCount
          ${fields['sex']} {
            histogram {
              key
              count
            }
          }
          ${fields['ethnicity']} {
            histogram {
              key
              count
            }
          },
          ${fields['race']} {
            histogram {
              key
              count
            }
          }
    }
    case_0_4: case(filter: $filter_0_4, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_5_11: case(filter: $filter_5_11, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_12_15: case(filter: $filter_12_15, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_16_17: case(filter: $filter_16_17, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_18_29: case(filter: $filter_18_29, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_30_39: case(filter: $filter_30_39, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_40_49: case(filter: $filter_40_49, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_50_64: case(filter: $filter_50_64, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_65_74: case(filter: $filter_65_74, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_75_84: case(filter: $filter_75_84, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
    case_85_plus: case(filter: $filter_85_plus, filterSelf: true, accessibility: all) {
      ${fields['age_at_index']} {
        histogram {
          key
          count
        }
      }
    }
  }
}`,
    variables: convertToValidJSON(`{ "filter_0_4": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 0
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 4
        }
      }
    ]
  },
  "filter_5_11": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 5
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 11
        }
      }
    ]
  },
  "filter_12_15": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 12
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 15
        }
      }
    ]
  },
  "filter_16_17": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 16
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 17
        }
      }
    ]
  },
  "filter_18_29": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 18
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 29
        }
      }
    ]
  },
  "filter_30_39": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 30
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 39
        }
      }
    ]
  },
  "filter_40_49": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 40
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 49
        }
      }
    ]
  },
  "filter_50_64": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 50
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 64
        }
      }
    ]
  },
  "filter_65_74": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 65
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 74
        }
      }
    ]
  },
  "filter_75_84": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 75
        }
      },
      {
        "<=": {
          ${fields['age_at_index']}: 84
        }
      }
    ]
  },
  "filter_85_plus": {
    "AND": [
      {
        ">=": {
          ${fields['age_at_index']}: 85
        }
      }
    ]
  }
}`),
  };
};
