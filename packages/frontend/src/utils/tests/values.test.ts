// values.test.ts

import { extractObjectKey } from '../values';

describe('extractObjectKey Function', () => {
  it('should return the first key of the object if it exists', () => {
    const testObj = { name: 'test', id: 1 };
    const result = extractObjectKey(testObj);
    expect(result).toEqual('name');
  });

  it('should return undefined if the object is empty', () => {
    const testObj: any = {};
    const result = extractObjectKey(testObj);
    expect(result).toBeUndefined();
  });

  it('should handle object that has number as a key', () => {
    const testObj: { [key: number]: string } = {
      1: 'one',
      2: 'two',
      3: 'three',
    };
    const result = extractObjectKey(testObj);
    expect(result).toEqual('1');
  });
});
