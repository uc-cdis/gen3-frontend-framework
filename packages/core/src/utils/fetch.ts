import { selectCSRFToken } from '../features/user';
import { coreStore } from '../store';
import { GEN3_FENCE_API } from '../constants';
import { getCookie } from 'cookies-next';

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

interface DownloadFromFenceParameters {
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
}: DownloadFromFenceParameters) => {
  const csrfToken = selectCSRFToken(coreStore.getState());

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  let accessToken = undefined;
  if (process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = getCookie('credentials_token');
  }
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const url = `${GEN3_FENCE_API}/user/download/${guid}`;
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

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        onAbort?.();
      }
    }
    throw error;
  }
};
