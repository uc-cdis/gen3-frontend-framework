import { Datalist } from '@gen3/core';
import { nanoid } from '@reduxjs/toolkit';
import {
  fetchJSONDataFromURL,
  HTTPError,
  HTTPErrorMessages,
  HttpMethod,
} from '../../../utils/fetch';
import { GEN3_DATA_LIBRARY_API } from '../../../constants';
import { BuildLists } from '../utils';
import {
  isDataLibraryAPIResponse,
  ReturnStatus,
  StorageService,
} from './types';

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
            'Unknown Error',
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

const responseFromMutation = (
  responseReceived: FetchJSONResponse,
): ReturnStatus => {
  if (responseReceived.error) {
    console.error(`Error in getLists: ${responseReceived.error.message}`);
    return {
      isError: true,
      status: `DataLibraryAPI error: ${responseReceived.error.status} ${responseReceived.error.message}`,
    };
  }
  return {
    status: 'success',
  };
};

export class ApiService implements StorageService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl = `${GEN3_DATA_LIBRARY_API}`) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getLists(): Promise<ReturnStatus> {
    const { data, error } = await fetchFromDataLibraryAPI(this.apiBaseUrl);
    if (error) {
      return {
        isError: true,
        status: error.message,
      };
    }
    if (data && isDataLibraryAPIResponse(data)) {
      return {
        lists: BuildLists(data),
        status: 'success',
      };
    }
    return { lists: {}, status: 'no list returned' };
  }

  async addList(list?: Partial<Datalist>): Promise<ReturnStatus> {
    // If the list doesn't have an ID, generate one
    const listToAdd = {
      ...list,
      id: list?.id || nanoid(),
    };
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${listToAdd.id}`,
      HttpMethod.POST,
      JSON.stringify(listToAdd),
    );

    return responseFromMutation(response);
  }

  async updateList(list: Datalist): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${list.id}`,
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

  // Additional methods for more complex operations

  async setAllLists(lists: Record<string, Datalist>): Promise<ReturnStatus> {
    const response = await fetchFromDataLibraryAPI(
      this.apiBaseUrl,
      HttpMethod.POST,
      JSON.stringify({ lists: Object.values(lists) }),
    );
    return responseFromMutation(response);
  }

  // Method to handle specific API format if needed
  async getList(id: string): Promise<ReturnStatus> {
    const { data, error } = await fetchFromDataLibraryAPI(
      `${this.apiBaseUrl}/${id}`,
    );

    if (error) {
      throw new Error(`DataLibraryAPI error: ${error.status} ${error.message}`);
    }
    if (isDataLibraryAPIResponse(data)) {
      return {
        lists: BuildLists(data),
        status: 'success',
      };
    }
    return { lists: {}, status: 'no list returned' };
  }
}
