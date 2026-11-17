import { type ConfigPath, getIn } from './configPath';

export type ConfigIssueLevel = 'error' | 'warning';

export interface ConfigIssue {
  level: ConfigIssueLevel;
  path: ConfigPath;
  message: string;
}

const isNonEmptyString = (x: unknown): x is string =>
  typeof x === 'string' && x.trim().length > 0;

/**
 * Keys found in existing commons configs that the Discovery code does not
 * read. Each maps to the key the code actually uses.
 */
const RENAMED_KEYS: ReadonlyArray<{ legacy: ConfigPath; current: ConfigPath }> =
  [
    {
      legacy: ['features', 'pageTitle', 'title'],
      current: ['features', 'pageTitle', 'text'],
    },
    {
      legacy: ['minimalFieldMapping', 'tagsListFieldName'],
      current: ['minimalFieldMapping', 'tagsListField'],
    },
  ];

const REQUIRED_STRINGS: ReadonlyArray<ConfigPath> = [
  ['minimalFieldMapping', 'uid'],
  ['minimalFieldMapping', 'authzField'],
];

/**
 * Lightweight sanity checks for a single Discovery index config.
 * Intentionally not a full schema validator: it flags the mistakes that
 * silently break the page (missing required fields, ignored legacy keys,
 * duplicate/empty columns).
 */
export const checkDiscoveryIndexConfig = (config: unknown): ConfigIssue[] => {
  const issues: ConfigIssue[] = [];

  if (typeof config !== 'object' || config === null) {
    return [{ level: 'error', path: [], message: 'Config must be an object' }];
  }

  for (const path of REQUIRED_STRINGS) {
    if (!isNonEmptyString(getIn(config, path)))
      issues.push({
        level: 'error',
        path,
        message: `${path.join('.')} is required`,
      });
  }

  for (const { legacy, current } of RENAMED_KEYS) {
    if (
      getIn(config, legacy) !== undefined &&
      getIn(config, current) === undefined
    )
      issues.push({
        level: 'warning',
        path: legacy,
        message: `${legacy.join('.')} is ignored; use ${current.join('.')} instead`,
      });
  }

  const pageTitle = getIn(config, ['features', 'pageTitle']);
  if (pageTitle === undefined)
    issues.push({
      level: 'warning',
      path: ['features', 'pageTitle'],
      message: 'features.pageTitle is not set',
    });

  const columns = getIn(config, ['studyColumns']);
  if (!Array.isArray(columns) || columns.length === 0) {
    issues.push({
      level: 'error',
      path: ['studyColumns'],
      message: 'At least one study column is required',
    });
  } else {
    const seen = new Set<string>();
    columns.forEach((col: unknown, i) => {
      const field = getIn(col, ['field']);
      if (!isNonEmptyString(field)) {
        issues.push({
          level: 'error',
          path: ['studyColumns', i, 'field'],
          message: `studyColumns[${i}] has no field`,
        });
      } else if (seen.has(field)) {
        issues.push({
          level: 'warning',
          path: ['studyColumns', i, 'field'],
          message: `studyColumns[${i}] duplicates field "${field}"`,
        });
      } else seen.add(field);
    });
  }

  const searchBar = getIn(config, ['features', 'search', 'searchBar']);
  if (
    getIn(searchBar, ['enabled']) === true &&
    !(
      Array.isArray(getIn(searchBar, ['searchableTextFields'])) &&
      (getIn(searchBar, ['searchableTextFields']) as unknown[]).length > 0
    )
  )
    issues.push({
      level: 'warning',
      path: ['features', 'search', 'searchBar', 'searchableTextFields'],
      message: 'Search bar is enabled but has no searchableTextFields',
    });

  return issues;
};
