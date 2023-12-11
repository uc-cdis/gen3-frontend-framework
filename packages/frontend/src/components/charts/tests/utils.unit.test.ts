import { capitalize } from '../utils';

describe('capitalize', () => {

  // Should capitalize the first letter of each word in a string
  it('should capitalize the first letter of each word in a string', () => {
    const result = capitalize('hello world');
    expect(result).toBe('Hello World');
  });

  // Should return an empty string when given an empty string
  it('should return an empty string when given an empty string', () => {
    const result = capitalize('');
    expect(result).toBe('');
  });

  // Should throw an error when given undefined
  it('should throw an error when given undefined', () => {
    expect(() => {
      // need to ignore this error because we are testing the error
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      capitalize(undefined);
    }).toThrowError('capitalize: original is undefined');
  });

  // Should handle strings with only spaces
  it('should handle strings with only spaces', () => {
    const result = capitalize('   ');
    expect(result).toBe('   ');
  });

});
