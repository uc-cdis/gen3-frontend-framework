import type { Bundle } from '@gen3/core';

// Adds the origin to a relative URL. An absolute one is left as is.
export const toAbsoluteUrl = (url: string, origin: string): string =>
  /^https?:\/\//.test(url) ? url : `${origin}${url}`;

// The URL's host, port included
export const hostOf = (url: string): string =>
  url.replace(/^https?:\/\//, '').split('/')[0];

// For display only: shows FHIR's separators (, | : / $) as typed. Characters
// that change how the URL splits, like & and =, stay encoded.
export const readableUrl = (url: string): string =>
  url.replace(/%(2C|7C|3A|2F|24)/gi, (code) => decodeURIComponent(code));

// HTTP/2 sends no status text, so we keep our own
const STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

// RTK's names for requests that got no HTTP answer
const NO_ANSWER: Record<string, string> = {
  FETCH_ERROR: 'Network error',
  TIMEOUT_ERROR: 'Timed out',
  PARSING_ERROR: 'Unreadable response',
};

export const statusLabel = (status: number | string): string =>
  typeof status === 'number'
    ? `${status} ${STATUS_TEXT[status] ?? ''}`.trim()
    : (NO_ANSWER[status] ?? status);

const numbers = new Intl.NumberFormat('en-US');

// `total` is optional in FHIR. Without it, say how many came back.
export const countLabel = (bundle: Bundle): string => {
  if (bundle.total === undefined) return `${bundle.entry?.length ?? 0} shown`;
  const noun = bundle.total === 1 ? 'resource' : 'resources';
  return `${numbers.format(bundle.total)} ${noun} found`;
};

// "Showing 101–200 of 1,175 · page 2"
export const pageLabel = (
  page: number,
  offset: number,
  shown: number,
  total?: number,
): string => {
  const of = total === undefined ? '' : ` of ${numbers.format(total)}`;
  // An empty page can still have a total, and the response line shows it
  if (!shown)
    return total
      ? `Showing 0${of} · page ${page}`
      : `No results · page ${page}`;
  const range = `${numbers.format(offset + 1)}–${numbers.format(offset + shown)}`;
  return `Showing ${range}${of} · page ${page}`;
};

// For a page with no entries. It must agree with countLabel's total.
export const emptyMessage = (resource: string, total?: number): string =>
  total
    ? `${numbers.format(total)} ${resource} found, but this page is empty.`
    : `No ${resource} matches these params.`;

// The server's error body is always {"detail":"Not Found"}, so the message
// has to come from the status
const ERROR_MESSAGES: Record<string, string> = {
  400: 'The server rejected this search. Check the values.',
  401: 'Your session has expired. Log in again to search.',
  403: "You don't have access to FHIR data on this server.",
  404: "The server couldn't run this search. Usually a value it doesn't accept, like gender=males or a malformed date.",
  FETCH_ERROR:
    "Couldn't reach the server. Check your connection and try again.",
  TIMEOUT_ERROR: 'The search took too long. Try again.',
  PARSING_ERROR: "The server sent a reply this page can't read.",
};

const isServerError = (status?: number | string) =>
  typeof status === 'number' && status >= 500;

export const errorMessage = (status?: number | string): string => {
  if (status !== undefined && ERROR_MESSAGES[status])
    return ERROR_MESSAGES[status];
  if (isServerError(status))
    return "The FHIR server isn't responding right now. Try again in a moment.";
  return 'Something went wrong with this search.';
};

// Only where trying again can help. A 404 or 400 gives the same answer again.
export const canRetry = (status?: number | string): boolean =>
  isServerError(status) ||
  status === 'FETCH_ERROR' ||
  status === 'TIMEOUT_ERROR';
