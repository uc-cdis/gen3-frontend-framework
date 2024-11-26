import { selectCSRFToken } from '../features/user';
import { coreStore } from '../store';
import { GEN3_FENCE_API } from '../constants';
import { getCookie } from 'cookies-next';

const prepareDownloadUrl = (apiUrl: string, guid: string) =>
  new URL(`${apiUrl}/data/download/${guid}`);

interface DownloadFromFenceParameters {
  guid: string;
  method?: 'GET' | 'POST';
  onStart?: () => void; // function to call when the download starts
  onDone?: (blob: Blob) => void; // function to call when the download is done
  onError?: (error: Error) => void; // function to call when the download fails
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
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  let accessToken = undefined;
  if (process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = getCookie('credentials_token');
  }
  if (csrfToken) headers.set('X-CSRF-Token', csrfToken);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const url = prepareDownloadUrl(`${GEN3_FENCE_API}/user`, guid);

  try {
    const response = await fetch(url.toString(), {
      method: method,
      headers: headers,
      ...(signal ? { signal: signal } : {}),
    } as RequestInit);

    const jsonData = await response.json();
    // convert the data to the specified format and return a Blob
    return jsonData;
  } catch (error: any) {
    // Abort is handle as an exception
    if (error.name == 'AbortError') {
      // handle abort()
      console.error('fetchFencePresignedURL error'); // TODO: add better error
      onAbort?.();
    }
    throw new Error(error);
  }
};
