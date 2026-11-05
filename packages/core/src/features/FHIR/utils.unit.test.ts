import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import { GEN3_FHIR_API } from '../../constants';
import type { Bundle } from './types';
import {
  fhirSearchUrl,
  nextPageOf,
  serializeFhirParams,
  toSearchResponse,
} from './utils';

// Shaped like the server's real cursors: long, opaque, already URL-encoded
const TOKEN = 'ARKNszFiht79VY7ib6Bh%2BqG6n%2Fx%3D%3D';

describe('nextPageOf', () => {
  const withLinks = (...link: { relation: string; url: string }[]): Bundle => ({
    resourceType: 'Bundle',
    link,
  });

  it("keeps the next link's query string exactly, token and all", () => {
    const bundle = withLinks(
      { relation: 'self', url: 'https://fhir.example.org/fhir/Patient/' },
      {
        relation: 'next',
        url: `https://fhir.example.org/fhir/Patient/?gender=female&_page_token=${TOKEN}`,
      },
    );
    expect(nextPageOf(bundle)).toBe(`?gender=female&_page_token=${TOKEN}`);
  });

  it('returns undefined on the last page', () => {
    expect(
      nextPageOf(
        withLinks({ relation: 'self', url: 'https://x/fhir/Patient' }),
      ),
    ).toBeUndefined();
    expect(nextPageOf({ resourceType: 'Bundle' })).toBeUndefined();
  });

  it('treats a malformed link as no next page', () => {
    const bundle = withLinks({
      relation: 'next',
      url: 'http://fhir.example.org:None/Patient/?_page_token=abc',
    });
    expect(nextPageOf(bundle)).toBeUndefined();
  });
});

describe('toSearchResponse', () => {
  const bundle: Bundle = { resourceType: 'Bundle', total: 1 };

  it('keeps the HTTP status next to the bundle', () => {
    const meta = {
      request: {} as Request,
      response: { status: 200 } as Response,
    } satisfies FetchBaseQueryMeta;
    expect(toSearchResponse(bundle, meta)).toEqual({ bundle, status: 200 });
  });

  it('leaves the status out when there is no response', () => {
    expect(toSearchResponse(bundle)).toEqual({ bundle, status: undefined });
  });
});

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

  it("uses a later page's query string as is, instead of the params", () => {
    const page = `?gender=female&_page_token=${TOKEN}`;
    expect(fhirSearchUrl('Patient', { gender: 'female' }, page)).toBe(
      `${GEN3_FHIR_API}/Patient${page}`,
    );
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
