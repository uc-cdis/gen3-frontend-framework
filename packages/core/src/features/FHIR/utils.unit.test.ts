import { GEN3_FHIR_API } from '../../constants';
import { fhirSearchUrl, serializeFhirParams } from './utils';

describe('fhirSearchUrl', () => {
  it('builds the search path with no trailing slash', () => {
    expect(fhirSearchUrl('Patient')).toBe(`${GEN3_FHIR_API}/Patient`);
  });

  it('adds the query string when there are params', () => {
    expect(
      fhirSearchUrl('Patient', { birthdate: ['ge1990-01-01', 'lt2000-01-01'] }),
    ).toBe(
      `${GEN3_FHIR_API}/Patient?birthdate=ge1990-01-01&birthdate=lt2000-01-01`,
    );
  });

  it('leaves off the ? when params are empty', () => {
    expect(fhirSearchUrl('Patient', {})).toBe(`${GEN3_FHIR_API}/Patient`);
  });
});

describe('serializeFhirParams', () => {
  it('writes a single value as key=value', () => {
    expect(serializeFhirParams({ gender: 'female' })).toBe('gender=female');
  });

  it('repeats the key for each array value, which FHIR reads as AND', () => {
    expect(serializeFhirParams({ given: ['jane', 'marie'] })).toBe(
      'given=jane&given=marie',
    );
  });

  it('handles a date range as two prefixed values on the same key', () => {
    expect(
      serializeFhirParams({ birthdate: ['ge1990-01-01', 'lt2000-01-01'] }),
    ).toBe('birthdate=ge1990-01-01&birthdate=lt2000-01-01');
  });

  it('keeps key order across mixed single and array values', () => {
    expect(
      serializeFhirParams({ given: ['jane', 'marie'], gender: 'female' }),
    ).toBe('given=jane&given=marie&gender=female');
  });

  it('keeps a comma inside one value, which FHIR reads as OR', () => {
    expect(serializeFhirParams({ given: 'jane,marie' })).toBe(
      'given=jane%2Cmarie',
    );
  });

  it('encodes modifiers, spaces and token separators', () => {
    expect(
      serializeFhirParams({
        'name:exact': 'Jane Doe',
        code: 'http://loinc.org|8867-4',
      }),
    ).toBe('name%3Aexact=Jane%20Doe&code=http%3A%2F%2Floinc.org%7C8867-4');
  });

  it('returns an empty string when there is nothing to send', () => {
    expect(serializeFhirParams({})).toBe('');
    expect(serializeFhirParams({ given: [] })).toBe('');
  });

  // The UI should drop empty filter rows before searching
  it('sends an empty value as-is', () => {
    expect(serializeFhirParams({ gender: '' })).toBe('gender=');
  });
});
