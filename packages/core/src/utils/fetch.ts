import { selectCSRFToken } from '../features/user';
import { coreStore } from '../store';
import { GEN3_FENCE_API, GEN3_API } from '../constants';
import { getCookie } from 'cookies-next';

const DEFAULT_METHOD = 'GET';
const CONTENT_TYPE_HEADER = 'Content-Type';
const CONTENT_TYPE_JSON = 'application/json';

export const HTTPErrorMessages: Record<number, string> = {
  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // 5xx Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

/**
 * Represents an error that occurs during an HTTP request.
 * Extends the built-in `Error` class to provide additional information
 * about the HTTP status code and optional response data.
 */
export class HTTPError extends Error {
  constructor(
    public status: number,
    message: string,
    public responseData?: any,
  ) {
    super(message);
    this.name = 'HTTPError';
  }
}

interface FetchFencePresignedURLParameters {
  guid: string;
  method?: 'GET' | 'POST';
  onStart?: () => void; // function to call when the download starts
  onDone?: (blob: Blob) => void; // function to call when the download is done
  onError?: (error: Error | HTTPError) => void; // function to call when the download fails
  onAbort?: () => void; // function to call when the download is aborted
  signal?: AbortSignal; // AbortSignal to use for the request
}

export const fetchFencePresignedURL = async ({
  guid,
  method = 'GET',
  onAbort = () => null,
  signal = undefined,
}: FetchFencePresignedURLParameters) => {
  const csrfToken = selectCSRFToken(coreStore.getState());

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  if (process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    const accessToken = getCookie('credentials_token');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);

  const url = `${GEN3_FENCE_API}/user/data/download/${guid}`;
  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      ...(signal ? { signal: signal } : {}),
    } as RequestInit);

    // Check if the response is ok before proceeding
    if (!response.ok) {
      let errorMessage: string;
      let errorData: any;

      try {
        // Attempt to parse error response as JSON
        errorData = await response.json();
        errorMessage = errorData.message || response.statusText;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText;
      }
      throw new HTTPError(response.status, errorMessage, errorData);
    }
    return (await response.json())['url'];
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onAbort?.();
      }
    }
    throw error;
  }
};

/**
 * Retrieves a CSRF token from the server.
 *
 * This asynchronous function sends a GET request to the server's status endpoint
 * to fetch the CSRF token in the response. The token is expected to be included
 * in the JSON response under the `csrf_token` field.
 *
 * @returns {Promise<string | null>} A promise that resolves to the CSRF token as a string if successfully retrieved,
 * or null if the token is not present in the response.
 * @throws {HTTPError} Throws an HTTPError if the server response is not successful.
 */
const getCSRFToken = async (): Promise<string | null> => {
  const requestHeaders = new Headers({
    [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
  });
  const response = await fetch(`${GEN3_API}/_status`, {
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }

  const { csrf_token: csrfToken } = await response.json();
  return csrfToken || null;
};

/**
 * Fetches JSON data from a specified URL using the Fetch API.
 *
 * @param {string} url - The URL to fetch the JSON data from.
 * @param {boolean} [requiresCSRF=false] - Indicates whether a CSRF token is required for the request.
 *                                         If true, the CSRF token will be added to the request headers.
 * @param {string} [method=DEFAULT_METHOD] - The HTTP method to use for the request (e.g., 'GET', 'POST').
 * @param {unknown} [body=undefined] - The request body to send, applicable when using methods like 'POST'.
 *
 * @returns {Promise<any>} A promise that resolves to the parsed JSON data from the response.
 *
 * @throws {HTTPError} Throws an error if the HTTP response status indicates a failure.
 */
export const fetchJSONDataFromURL = async (
  url: string,
  requiresCSRF: boolean = false,
  method: string = DEFAULT_METHOD,
  body: unknown = undefined,
): Promise<any> => {
  const requestHeaders = new Headers({
    [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
  });

  if (requiresCSRF) {
    const csrfToken = await getCSRFToken();
    if (csrfToken) {
      requestHeaders.set('X-CSRF-Token', csrfToken);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const accessToken = getCookie('credentials_token');
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: method === 'POST' ? JSON.stringify(body) : null,
  } as RequestInit);

  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }

  return response.json();
};
