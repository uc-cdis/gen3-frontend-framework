import { GraphQLClient } from 'graphql-request';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const callGraphQLApi = async <T = any>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> => {
  const endpoint = 'https://api.example.com/guppy/graphql'; // Replace with your actual API endpoint

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as GraphQLResponse<T>;

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }

    if (!result.data) {
      throw new Error('No data returned from the API');
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('GraphQL API call failed:', error.message);
      throw error;
    } else {
      console.error('An unexpected error occurred:', error);
      throw new Error('An unexpected error occurred during the API call');
    }
  }
};

const createDiverisityQuery = (
  fields: Record<string, string> = {
    age_at_index: 'age_at_index',
    sex: 'sex',
    ethnicity: 'ethnicity',
    race: 'race',
  },
) => {
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
    variables: `
    {
  "filter_0_4": {
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
}`,
  };
};


const queryDiversityData = async (fields: Record<string, string>) => {
  const query = createDiverisityQuery(fields);
  try {
   const results =  callGraphQLApi(query.query, JSON.parse(query.variables));
  } catch (error) {
    if (error instanceof Error) {
      console.error('GraphQL API call failed:', error.message);
    }
}
