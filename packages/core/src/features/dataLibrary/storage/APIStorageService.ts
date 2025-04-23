import {
  fetchJSONDataFromURL,
  HTTPError,
  HTTPErrorMessages,
  HttpMethod,
} from '../../../utils/fetch';
import { GEN3_DATA_LIBRARY_API } from '../../../constants';
import { ReturnStatus, StorageService } from './types';
import {
  isDataLibraryAPIResponse,
  DataLibrary,
  DatalistAsAPIItems,
} from '../types';
import { BuildLists } from '../utils';

interface FetchJSONResponse {
  data?: unknown;
  error?: {
    status: number;
    message: string;
  };
}

export const fetchFromDataLibraryAPI = async (
  url: string,
  method: HttpMethod = HttpMethod.GET,
  body: unknown = undefined,
): Promise<FetchJSONResponse> => {
  try {
    return {
      data: await fetchJSONDataFromURL(url, true, method, body),
    };
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      return {
        error: {
          status: error.status,
          message:
            HTTPErrorMessages[error.status] ||
            error.responseData?.message ||
            'No HTTP Error Message',
        },
      };
    } else {
      return {
        error: {
          status: 500,
          message: 'Unknown Error',
        },
      };
    }
  }
};

const responseFromMutation = <T = DataLibrary>(
  responseReceived: FetchJSONResponse,
): ReturnStatus<T> => {
  if (responseReceived.error) {
    return {
      isError: true,
      ...responseReceived.error,
    };
  }
  return {
    lists: responseReceived.data as unknown as T,
    message: 'success',
    status: 200,
  };
};

export class APIStorageService implements StorageService<DataLibrary> {
  private readonly apiBaseUrl: string;
  private pendingRequests: Map<string, Promise<FetchJSONResponse>> = new Map();

  constructor(apiBaseUrl = `${GEN3_DATA_LIBRARY_API}`) {
    this.apiBaseUrl = apiBaseUrl;
  }

  private async dedupedRequest(
    url: string,
    method: HttpMethod = HttpMethod.GET,
    body: unknown = undefined,
  ): Promise<FetchJSONResponse> {
    // Create a unique key for this request
    const requestKey = `${method}:${url}:${body ? JSON.stringify(body) : ''}`;

    // If this exact request is already in progress, return the pending promise
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    // Otherwise, make the request and store the promise
    const requestPromise = fetchFromDataLibraryAPI(url, method, body);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      // Wait for the request to complete
      const result = await requestPromise;
      return result;
    } finally {
      // Remove the request from pending requests after it completes
      this.pendingRequests.delete(requestKey);
    }
  }

  async getLists(): Promise<ReturnStatus> {
    const { data, error } = await this.dedupedRequest(`${this.apiBaseUrl}`);
    if (error) {
      return {
        isError: true,
        ...error,
      };
    }
    if (data && isDataLibraryAPIResponse(data)) {
      const datalists = BuildLists(data);
      return {
        lists: datalists,
        status: 200,
        message: 'success',
      };
    }
    return { lists: {}, status: 200, message: 'no list returned' };
  }

  async addList(list: DatalistAsAPIItems): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}`,
      HttpMethod.PUT,
      JSON.stringify({
        lists: [list],
      }),
    );

    return responseFromMutation(response);
  }

  async updateList(
    id: string,
    list: DatalistAsAPIItems,
  ): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${id}`,
      HttpMethod.PUT,
      JSON.stringify(list),
    );
    return responseFromMutation(response);
  }

  async deleteList(id: string): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${id}`,
      HttpMethod.DELETE,
    );

    return responseFromMutation(response);
  }

  async clearLists(): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      this.apiBaseUrl,
      HttpMethod.DELETE,
    );
    return responseFromMutation(response);
  }

  async setAllLists(lists: Array<DatalistAsAPIItems>): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      this.apiBaseUrl,
      HttpMethod.POST,
      JSON.stringify({ lists: Object.values(lists) }),
    );
    return responseFromMutation(response);
  }

  async getList(id: string): Promise<ReturnStatus<DataLibrary>> {
    const { data, error } = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${id}`,
    );

    if (error) {
      return {
        isError: true,
        ...error,
      };
    }
    if (isDataLibraryAPIResponse(data)) {
      const datalists = BuildLists(data);
      return {
        lists: datalists,
        status: 200,
        message: 'success',
      };
    }
    return {
      isError: true,
      status: 500,
      message: `Unknown error getting list ${id}`,
    };
  }
}
