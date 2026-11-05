import { IndexAndField } from '../guppy/types';

/**
 * The type of facet
 * Drives which facet UI control is rendered and how values are formatted.
 *
 * @category Facets
 */
export type FacetType =
  | 'enum'
  | 'exact'
  | 'range'
  | 'age'
  | 'age_in_years'
  | 'year'
  | 'years'
  | 'days'
  | 'percent'
  | 'numeric_range'
  | 'datetime'
  | 'toggle'
  | 'multiselect'
  | 'upload';

/**
 * Sort order for enum facet values.
 *
 * @category Facets
 */
export type FacetSortType =
  'value-asc' | 'value-dsc' | 'label-asc' | 'label-desc';

/**
 * The inclusive numeric bounds a range facet may filter within.
 *
 * @category Facets
 */
export interface AllowableRange {
  /** Lowest selectable value. */
  readonly minimum: number;
  /** Highest selectable value. */
  readonly maximum: number;
  /**
   * Increment between selectable values on the range control.
   *
   * @defaultValue `1`
   */
  readonly step?: number;
}

/**
 * Describes a single facet: the field it filters, its classified type, and the
 * options that control how it is displayed and which values are shown.
 *
 * @category Facets
 */
export interface FacetDefinition {
  /**
   * Human-readable description sourced from the Elasticsearch `_mapping`.
   */
  readonly description?: string;
  /**
   * Fully-qualified name of the field this facet filters.
   */
  readonly field: string;
  /**
   * @deprecated Use {@link FacetDefinition.field} instead.
   */
  readonly dataField?: string;
  /**
   * Index (data type) this facet belongs to.
   */
  readonly index: string;
  /**
   * Classified facet type used to pick the rendering control.
   *
   * @remarks Derived from the field's data type and name — e.g. `age`,
   * `year`, `enum`.
   */
  readonly type: FacetType;
  /**
   * Allowed bounds for range-style facets.
   *
   * @remarks Only meaningful when {@link FacetDefinition.type} is a range kind.
   */
  readonly range?: AllowableRange;
  /**
   * Whether this facet currently has any data to display.
   */
  readonly hasData?: boolean;
  /**
   * Display label shown in the UI; falls back to the field name when unset.
   */
  readonly label?: string;
  /**
   * Other indices this filter is denormalized across, so a selection applies
   * consistently everywhere the field appears.
   */
  readonly sharedWithIndices?: Array<IndexAndField>;
  /**
   * Values pinned to the bottom of the facet's value list.
   */
  readonly moveValuesToBottom?: Array<string>;
  /**
   * Values omitted from the facet entirely.
   */
  readonly excludeValues?: Array<string>;
  /**
   * Initial sort order for the facet's values.
   *
   * @defaultValue `value-dsc`
   */
  readonly defaultSort?: FacetSortType;
  /**
   * Whether an enum facet lets users choose how multiple selected values are
   * combined: match any (`or`) or match all (`and`).
   *
   * @remarks Only meaningful when {@link FacetDefinition.type} is `enum`.
   * @defaultValue `false`
   */
  readonly showMatchModeSelector?: boolean;
  /**
   * Overrides the per-value label rendered for this facet when set.
   */
  readonly valueLabel?: string;
}
