import { GQLFilter } from '../filters';

export interface Buckets {
  buckets: ReadonlyArray<Bucket>;
}

export interface Bucket {
  readonly count: number;
  readonly key: string;
}

export interface Stats {
  readonly stats: Statistics;
}

export interface Statistics {
  readonly count: number;
  readonly min?: number;
  readonly max?: number;
  readonly avg?: number;
  readonly sum?: number;
}

export interface Pagination {
  readonly count: number;
  readonly total: number;
  readonly size: number;
  readonly from: number;
  readonly sort: string;
  readonly page: number;
  readonly pages: number;
}

export interface SortBy {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export type UnknownJson = Record<string, unknown>;

export interface Gen3AnalysisApiData<H> {
  readonly hits: ReadonlyArray<H>;
  readonly aggregations?: Record<string, Buckets | Stats>;
  readonly pagination: Pagination;
}

export interface Gen3AnalysisApiResponse<H = UnknownJson> {
  readonly data: Gen3AnalysisApiData<H>;
  readonly warnings: Record<string, string>;
}

/**
 * The request for requesting data from the Gen3 Analysis API
 * @property filters - A FilterSet object
 * @property cohort_filters - A FilterSet object
 * @property fields - An array of fields to return
 * @property expand - An array of fields to expand
 * @property format - The format of the response
 * @property size - The number of cases to return
 * @property from - The offset from which to return cases
 * @property sortBy - An array of fields to sort by
 * @property facets - An array of fields to facet by
 * @category MMRF API
 */
export interface Gen3AnalysisApiRequest {
  readonly filters?: GQLFilter;
  readonly cohort_filters?: GQLFilter;
  readonly fields?: ReadonlyArray<string>;
  readonly expand?: ReadonlyArray<string>;
  readonly format?: 'JSON' | 'TSV' | 'XML';
  readonly size?: number;
  readonly from?: number;
  readonly facets?: ReadonlyArray<string>;
}

export interface GdcApiData<H> {
  readonly hits: ReadonlyArray<H>;
  readonly aggregations?: Record<string, Buckets | Stats>;
  readonly pagination: Pagination;
}

export interface EndpointRequestProps {
  readonly request: Gen3AnalysisApiRequest;
  readonly fetchAll?: boolean;
}
