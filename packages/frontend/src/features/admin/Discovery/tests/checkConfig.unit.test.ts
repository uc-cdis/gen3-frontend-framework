import { checkDiscoveryIndexConfig } from '../checkConfig';

const valid = {
  features: {
    pageTitle: { enabled: true, text: 'Discover' },
    search: { searchBar: { enabled: true, searchableTextFields: ['name'] } },
  },
  minimalFieldMapping: {
    uid: '_hdp_uid',
    authzField: 'authz',
    tagsListField: 'tags',
  },
  studyColumns: [{ name: 'Name', field: 'name' }],
};

describe('checkDiscoveryIndexConfig', () => {
  test('a valid config has no issues', () => {
    expect(checkDiscoveryIndexConfig(valid)).toEqual([]);
  });

  test('flags legacy keys that the code ignores', () => {
    const cfg = {
      ...valid,
      features: { ...valid.features, pageTitle: { enabled: true, title: 'x' } },
      minimalFieldMapping: {
        uid: 'u',
        authzField: 'a',
        tagsListFieldName: 'tags',
      },
    };
    const messages = checkDiscoveryIndexConfig(cfg).map((i) => i.message);
    expect(messages).toEqual([
      'features.pageTitle.title is ignored; use features.pageTitle.text instead',
      'minimalFieldMapping.tagsListFieldName is ignored; use minimalFieldMapping.tagsListField instead',
    ]);
  });

  test('flags missing required fields, empty and duplicate columns', () => {
    const cfg = {
      ...valid,
      minimalFieldMapping: {},
      studyColumns: [{ field: 'a' }, { field: 'a' }, { name: 'no field' }],
    };
    const issues = checkDiscoveryIndexConfig(cfg);
    expect(issues.filter((i) => i.level === 'error').length).toBe(3);
    expect(issues.filter((i) => i.level === 'warning').length).toBe(1);
  });

  test('flags enabled search bar with no fields', () => {
    const cfg = {
      ...valid,
      features: { ...valid.features, search: { searchBar: { enabled: true } } },
    };
    expect(checkDiscoveryIndexConfig(cfg).map((i) => i.message)).toEqual([
      'Search bar is enabled but has no searchableTextFields',
    ]);
  });
});
