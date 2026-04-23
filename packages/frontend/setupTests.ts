import '@testing-library/jest-dom';
import { loadEnvConfig } from '@next/env';

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

window.URL.createObjectURL = (_input: Blob | MediaSource) => '';

loadEnvConfig(__dirname, true, { info: () => null, error: console.error });

jest.mock('url-join', () => ({
  urlJoin: jest.fn(),
}));
