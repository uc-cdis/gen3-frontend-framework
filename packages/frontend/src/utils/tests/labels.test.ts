// tests/labels.test.ts

import { labelToPlural } from '../labels';

describe('labelToPlural', () => {
  it('should pluralize a singular noun', () => {
    expect(labelToPlural('car')).toBe('cars');
  });

  it('should return the same word if it is already plural', () => {
    expect(labelToPlural('cars')).toBe('cars');
  });

  it('should handle irregular plural forms', () => {
    expect(labelToPlural('child')).toBe('children');
  });

  it('should handle uncountable nouns gracefully', () => {
    expect(labelToPlural('rice')).toBe('rice');
  });

  it('should correctly handle empty strings', () => {
    expect(labelToPlural('')).toBe('');
  });

  it('should pluralize nouns ending with "y" correctly', () => {
    expect(labelToPlural('city')).toBe('cities');
  });

  it('should pluralize nouns ending with "s" correctly', () => {
    expect(labelToPlural('bus')).toBe('buses');
  });

  it('should pluralize nouns ending with "s" correctly', () => {
    expect(labelToPlural('Imaging Study')).toBe('Imaging Studies');
  });
});
