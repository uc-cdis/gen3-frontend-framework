// write  test for this downloadApi.ts
import React, { ReactNode } from "react";
import * as misc from '../../../utils/testing';
import { Provider } from "react-redux";
import { coreStore }  from "../../../store";
import { CoreContext } from '../../../hooks';
import { renderHook } from '@testing-library/react';

function Wrapper(props: { children: ReactNode }) {
  return <Provider store={coreStore} context={CoreContext}>{props.children}</Provider>;
}


import {
  useGetJobListQuery,
} from '../downloadApi';


const mockFetch = (
  status: number,
  data?: Record<string, string> | Array<Record<string, string>>,
) => {
  const response = { status, json: () => Promise.resolve(data) };
  const window = jest.spyOn(misc, 'getGlobalObject');
  window.mockReturnValue({ fetch: () => Promise.resolve(response) });
};

describe('useGetDownloadStatusQuery', () => {
  test('renders download status', async () => {


    mockFetch(200, [
      {
        uid: '5f0feef7-1392-41a0-b45c-c93e57e7d6fd',
        name: 'batch-export-qzahz',
        status: 'Running',
      },
    ]);

    const { result } = renderHook(() => useGetJobListQuery(), { wrapper : Wrapper });
    expect(result).toEqual([]);

  });
});
