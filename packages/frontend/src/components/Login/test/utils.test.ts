import { appendParameterToUrl } from '../utils';

describe('appendParameterToUrl', () => {
  it('should add a parameter to a URL without any existing query parameters', () => {
    const url = 'https://example.com';
    const paramName = 'key';
    const paramValue = 'value';
    const result = appendParameterToUrl(url, paramName, paramValue);
    expect(result).toBe('https://example.com?key=value');
  });

  it('should add a parameter to a URL with existing query parameters', () => {
    const url = 'https://example.com?existing=value1';
    const paramName = 'key';
    const paramValue = 'value';
    const result = appendParameterToUrl(url, paramName, paramValue);
    expect(result).toBe('https://example.com?existing=value1&key=value');
  });

  it('should encode the parameter value properly', () => {
    const url = 'https://example.com';
    const paramName = 'key';
    const paramValue = 'value with spaces';
    const result = appendParameterToUrl(url, paramName, paramValue);
    expect(result).toBe('https://example.com?key=value%20with%20spaces');
  });

  it('should handle URLs with existing hash fragments properly', () => {
    const url = 'https://example.com#section';
    const paramName = 'key';
    const paramValue = 'value';
    const result = appendParameterToUrl(url, paramName, paramValue);
    expect(result).toBe('https://example.com?key=value#section');
  });

  it('should handle URLs with existing query parameters and hash fragments', () => {
    const url = 'https://example.com?existing=value1#section';
    const paramName = 'key';
    const paramValue = 'value';
    const result = appendParameterToUrl(url, paramName, paramValue);
    expect(result).toBe(
      'https://example.com?existing=value1&key=value#section',
    );
  });
});
