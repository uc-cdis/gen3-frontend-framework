import { FacetDefinition, stringToFacetType } from './types';

interface SchemaProperty {
  type?: string;
  enum?: string[];
  oneOf?: Array<{ type?: string; minimum?: number; maximum?: number }>;
  anyOf?: Array<{ type?: string; minimum?: number; maximum?: number }>;
  description?: string;
  minimum?: number;
  maximum?: number;
}

interface SchemaNode {
  category: string;
  description: string;
  properties: Record<string, SchemaProperty>;
}

interface Schema {
  [key: string]: SchemaNode;
}

interface FacetProperty {
  facet_filter: string;
  facet_type: string;
  label: string;
  description: string;
  enum?: string[];
  oneOf?: any;
  minimum?: number;
  maximum?: number;
  property_type?: string;
}

interface CategoryResults {
  [key: string]: Record<string, FacetProperty>;
}

interface TooltipData {
  dictionary: CategoryResults;
}

// Configuration constants
const SUBCAT_REMAP: Record<string, string> = {};
//const REMAP_FILTER_NAMES: Record<string, string> = {};
//const CLINICAL_ALL: string[] = [];
const CATEGORY_SKIP = ['internal'];
//const REMAP_CATEGORIES: Record<string, string> = { data_file: 'downloadable' };
const TYPE_LIST = ['enum', 'type', 'anyOf', 'oneOf'];
const SKIP_ROOT = ['_definitions', '_settings', '_terms', 'metaschema'];

export const convertFacetPropertyToFacetDefinitions = (
  facets: Record<string, FacetProperty>,
): FacetDefinition[] => {
  const results: FacetDefinition[] = [];

  for (const [key, value] of Object.entries(facets)) {
    const facet: FacetDefinition = {
      field: key,
      dataField: key.split('.')?.slice(-1)[0] ?? key,
      label: value.label,
      description: value.description,
      type: stringToFacetType(value.facet_type),
      index: null,
    };
    results.push(facet);
  }
  return results;
};

/**
 * Converts a camelCase string to a space-separated string
 */
const camelCaseToSpaces = (text: string): string => {
  return text.replace(/([A-Z][a-z]+)/g, '$1').trim();
};

/**
 * Processes a label by converting underscores to spaces and applying title case
 */
const processLabel = (text: string): string => {
  const remap: Record<string, string> = {};

  let result = text
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/\bOr\b/g, 'or')
    .replace(/\bAnd\b/g, 'and')
    .replace(/\bOf\b/g, 'of')
    .replace(/\bAt\b/g, 'at');

  // Apply any remapping
  result = remap[result] || result;

  // Apply camelCase to spaces conversion
  result = camelCaseToSpaces(result);

  return result;
};

/**
 * Builds tooltip data from the schema
 */
export const buildTooltipData = (schema: Schema): TooltipData => {
  const results: CategoryResults = {};

  for (const [key, value] of Object.entries(schema)) {
    console.log('key', key);

    if (SKIP_ROOT.includes(key)) {
      continue;
    }

    const categoryName = value.category;
    if (CATEGORY_SKIP.includes(categoryName)) {
      continue;
    }

    if (!(categoryName in results)) {
      results[categoryName] = {};
    }

    const category = results[categoryName];
    let processedKey = key;

    if (!(processedKey in category)) {
      if (processedKey in SUBCAT_REMAP) {
        processedKey = SUBCAT_REMAP[processedKey];
      }
      results[categoryName][processedKey] = {} as any;
    }

    const subCat = results[categoryName][processedKey] as any;
    subCat.description = value.description;

    // Process properties
    for (const [pname, property] of Object.entries(value.properties)) {
      const filterName = `${processedKey}.${pname}`;

      if (filterName.includes('metadata')) {
        continue; // skip metadata
      }

      const label = processLabel(pname);
      const propertyKeys = Object.keys(property);
      const typeIntersection = propertyKeys.filter((k) =>
        TYPE_LIST.includes(k),
      );
      let ptype = typeIntersection[0] || 'string';

      if (ptype === 'type') {
        ptype = property.type || 'string';
      }

      const prevPtype = ptype;

      if (ptype !== 'enum' && ptype !== 'boolean') {
        if (label.includes('Age')) {
          ptype = 'age';
        }
        if (pname.includes('Days')) {
          ptype = 'days';
        }
        if (label.includes('Year')) {
          ptype = 'year';
        }
        if (label.includes('Percent')) {
          ptype = 'percent';
        }
        if (pname.includes('Years')) {
          ptype = prevPtype;
        }

        // Sanity check
        if (prevPtype === 'enum' && ptype !== 'enum') {
          console.log('filter_name: ', filterName);
        }
      }

      const facetProperty: FacetProperty = {
        facet_filter: filterName,
        facet_type: ptype,
        label: label,
        description: property.description || 'no description',
      };

      if (property.enum) {
        facetProperty.enum = property.enum;
      }

      if (property.oneOf) {
        facetProperty.oneOf = property.oneOf[0];
        if (property.oneOf[0]?.minimum !== undefined) {
          facetProperty.minimum = property.oneOf[0].minimum;
        }
        if (property.oneOf[0]?.maximum !== undefined) {
          facetProperty.maximum = property.oneOf[0].maximum;
        }
        if (property.oneOf[0]?.type) {
          facetProperty.property_type = property.oneOf[0].type;
        }
      }

      if (property.minimum !== undefined) {
        facetProperty.minimum = property.minimum;
      }
      if (property.maximum !== undefined) {
        facetProperty.maximum = property.maximum;
      }
      if (property.type) {
        facetProperty.property_type = property.type;
      }

      if (filterName.includes('age_at_index')) {
        facetProperty.facet_type = 'years';
      }

      subCat[pname] = facetProperty;
    }
  }

  // Flatten the results structure
  for (const [key, value] of Object.entries(results)) {
    const allResults: Record<string, FacetProperty> = {};

    for (const [subkey, subvalue] of Object.entries(value)) {
      if (subkey === 'All') {
        continue;
      }

      const subObj = subvalue as any;
      if (subObj.description) {
        delete subObj.description;
      }

      Object.assign(allResults, subObj);
    }

    results[key] = allResults;
    console.log(Object.keys(results));
  }

  return { dictionary: results };
};
