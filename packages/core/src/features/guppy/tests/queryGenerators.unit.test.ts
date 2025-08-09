import { customQueryStrForField } from '../queryGenerators';

describe('customQueryStrForEachField', () => {
  it('should return the correct query string for a single field', () => {
    const field = 'name';
    const query = 'eq "John"';
    const result = customQueryStrForField(field, query);
    expect(result).toBe('name eq "John"');
  });

  it('should return the correct nested query string for a field with multiple levels', () => {
    const field = 'user.address.city';
    const query = 'eq "New York"';
    const result = customQueryStrForField(field, query);
    expect(result).toBe(`user {
  address {
    city eq "New York"
  }
}`);
  });

  it('should return the correct query string for a two-level nested field', () => {
    const field = 'user.name';
    const query = 'contains "Jane"';
    const result = customQueryStrForField(field, query);
    expect(result).toBe(`user {
  name contains "Jane"
}`);
  });

  it('should handle an empty field and return the query as is', () => {
    const field = '';
    const query = 'exists';
    const result = customQueryStrForField(field, query);
    expect(result).toBe(' exists');
  });

  it('should handle a field with only one level correctly', () => {
    const field = 'email';
    const query = 'endsWith "@example.com"';
    const result = customQueryStrForField(field, query);
    expect(result).toBe('email endsWith "@example.com"');
  });
});
