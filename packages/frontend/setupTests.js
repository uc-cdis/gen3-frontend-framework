require('@testing-library/jest-dom');
const { loadEnvConfig } = require('@next/env');

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

window.URL.createObjectURL = function(input) {
  return '';
};

loadEnvConfig(__dirname, true, { info: function() { return null; }, error: console.error });

jest.mock('url-join', function() {
  return {
    urlJoin: jest.fn(),
  };
});
