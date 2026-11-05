import {
  isArray,
  isNotDefined,
  isObject,
  nextPageOf,
  type Bundle,
  type FhirSearchArgs,
  type FhirSearchParams,
  type FhirSearchResponse,
} from '@gen3/core';

// An earlier page, for Back
export interface PageStop {
  page?: string;
  offset: number;
}

export interface Step {
  // What we sent. The params may have changed since.
  sent: FhirSearchArgs;
  trail: PageStop[];
  // Results before this page
  offset: number;
}

export interface TabResult extends Step {
  bundle?: Bundle;
  // The next link's query string
  nextPage?: string;
  // HTTP status, or e.g. 'FETCH_ERROR'
  status?: number | string;
  ms?: number;
  error?: unknown;
  loading: boolean;
  // While loading: whether the page on screen showed the pager
  paged?: boolean;
}

// More than one page, so the pager shows. While loading it stays as it was:
// the new trail and the old nextPage describe two different pages.
export const showsPager = (result: TabResult): boolean =>
  result.loading
    ? !!result.paged
    : result.trail.length > 0 || !!result.nextPage;

export const firstPage = (
  resource: string,
  params: FhirSearchParams,
): Step => ({ sent: { resource, params }, trail: [], offset: 0 });

// Undefined on the last page
export const nextStep = (result: TabResult): Step | undefined =>
  result.nextPage
    ? {
        sent: { ...result.sent, page: result.nextPage },
        trail: [
          ...result.trail,
          { page: result.sent.page, offset: result.offset },
        ],
        offset: result.offset + (result.bundle?.entry?.length ?? 0),
      }
    : undefined;

// Undefined on page 1
export const backStep = (result: TabResult): Step | undefined => {
  const previous = result.trail.at(-1);
  return previous
    ? {
        sent: { ...result.sent, page: previous.page },
        trail: result.trail.slice(0, -1),
        offset: previous.offset,
      }
    : undefined;
};

// A copy: the race check tells requests apart by `sent`
export const retryStep = (result: TabResult): Step => ({
  sent: { ...result.sent },
  trail: result.trail,
  offset: result.offset,
});

const isRecord = (x: unknown): x is Record<string, unknown> =>
  !isNotDefined(x) && isObject(x);

// entry and link are optional, but a bad one would throw later, in
// nextPageOf or EntryList
const isListOfRecords = (x: unknown): boolean =>
  isNotDefined(x) || (isArray(x) && x.every(isRecord));

const isBundle = (x: unknown): x is Bundle =>
  isRecord(x) &&
  x.resourceType === 'Bundle' &&
  isListOfRecords(x.entry) &&
  isListOfRecords(x.link);

// RTK calls an HTML error page PARSING_ERROR, with the real status in
// originalStatus
const statusOf = (error: unknown): number | string | undefined => {
  if (!isRecord(error)) return undefined;
  const { status, originalStatus } = error;
  if (
    status === 'PARSING_ERROR' &&
    typeof originalStatus === 'number' &&
    originalStatus >= 400
  )
    return originalStatus;
  return typeof status === 'number' || typeof status === 'string'
    ? status
    : undefined;
};

export const toReply = (
  data?: FhirSearchResponse,
  error?: unknown,
): Pick<TabResult, 'bundle' | 'nextPage' | 'status' | 'error'> => {
  // A failed re-Send also returns the old data, so error goes first
  if (error) return { error, status: statusOf(error) };
  // The server's JSON is unchecked. Empty or non-FHIR becomes an error.
  const bundle: unknown = data?.bundle;
  if (!isBundle(bundle)) {
    const unreadable = { status: 'PARSING_ERROR', data: bundle ?? null };
    return { error: unreadable, status: unreadable.status };
  }
  return { bundle, nextPage: nextPageOf(bundle), status: data?.status };
};
