import { nanoid } from '@reduxjs/toolkit';
import {
  fetchJSONDataFromURL,
  HTTPError,
  HTTPErrorMessages,
  HttpMethod,
} from '../../../utils/fetch';
import { GEN3_DATA_LIBRARY_API } from '../../../constants';
import { ReturnStatus, StorageService } from './types';
import {
  UpdateDataLibraryListParams,
  isDataLibraryAPIResponse,
  DataLibrary,
  DataLibraryAPI,
  DatalistAsAPIItems,
} from '../types';

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
      status: `DataLibraryAPI error: ${responseReceived.error.status} ${responseReceived.error.message}`,
    };
  }
  return {
    lists: responseReceived.data as unknown as T,
    status: 'success',
  };
};

export class APIStorageService implements StorageService<DataLibraryAPI> {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl = `${GEN3_DATA_LIBRARY_API}`) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getLists(): Promise<ReturnStatus<DataLibraryAPI>> {
    const { data, error } = await fetchFromDataLibraryAPI(`${this.apiBaseUrl}`);
    if (error) {
      return {
        isError: true,
        status: error.message,
      };
    }
    if (data && isDataLibraryAPIResponse(data)) {
      return {
        lists: data.lists,
        status: 'success',
      };
    }
    return { lists: {}, status: 'no list returned' };
  }

  async addList(
    list: DatalistAsAPIItems,
  ): Promise<ReturnStatus<DataLibraryAPI>> {
    const listToAdd = {
      ...list,
      id: nanoid(),
    };
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}`,
      HttpMethod.PUT,
      JSON.stringify(listToAdd),
    );

    return responseFromMutation(response);
  }

  async updateList(
    list: UpdateDataLibraryListParams,
  ): Promise<ReturnStatus<DataLibraryAPI>> {
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${list.id}`,
      HttpMethod.PUT,
      JSON.stringify(list),
    );
    return responseFromMutation(response);
  }

  async deleteList(id: string): Promise<ReturnStatus<DataLibraryAPI>> {
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${id}`,
      HttpMethod.DELETE,
    );

    return responseFromMutation(response);
  }

  async clearLists(): Promise<ReturnStatus<DataLibraryAPI>> {
    const response = await fetchFromDataLibraryAPI(
      this.apiBaseUrl,
      HttpMethod.DELETE,
    );
    return responseFromMutation(response);
  }

  // Additional methods for more complex operations

  async setAllLists(
    lists: Array<DatalistAsAPIItems>,
  ): Promise<ReturnStatus<DataLibraryAPI>> {
    const response = await fetchFromDataLibraryAPI(
      this.apiBaseUrl,
      HttpMethod.POST,
      JSON.stringify({ lists: Object.values(lists) }),
    );
    return responseFromMutation(response);
  }

  async getList(id: string): Promise<ReturnStatus<DataLibraryAPI>> {
    const { data, error } = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${id}`,
    );

    if (error) {
      return {
        isError: true,
        status: error.message,
      };
    }
    if (isDataLibraryAPIResponse(data)) {
      return {
        lists: data.lists,
        status: 'success',
      };
    }
    return {
      isError: true,
      status: 'Unknown error',
    };
  }
}
