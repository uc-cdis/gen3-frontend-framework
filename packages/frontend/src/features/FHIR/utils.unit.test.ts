import { hostOf, readableUrl, toAbsoluteUrl } from './utils';

describe('toAbsoluteUrl', () => {
  it('prefixes the origin to a relative URL', () => {
    expect(toAbsoluteUrl('/fhir/Patient', 'https://qa.example.org')).toBe(
      'https://qa.example.org/fhir/Patient',
    );
  });

  it('leaves an absolute URL alone', () => {
    expect(
      toAbsoluteUrl('http://localhost:3000/fhir/Patient', 'https://other.org'),
    ).toBe('http://localhost:3000/fhir/Patient');
  });
});

describe('hostOf', () => {
  it('returns the host, including any port', () => {
    expect(hostOf('http://localhost:3000/fhir/Patient?x=1')).toBe(
      'localhost:3000',
    );
    expect(hostOf('https://qa.example.org/fhir')).toBe('qa.example.org');
  });

  it('returns an empty string for a relative URL', () => {
    expect(hostOf('/fhir')).toBe('');
  });
});

describe('readableUrl', () => {
  it('shows FHIR separators as typed', () => {
    expect(
      readableUrl(
        '/fhir/Observation?code=http%3A%2F%2Floinc.org%7C8480-6&language=fr%2Cen&x=a%24b',
      ),
    ).toBe(
      '/fhir/Observation?code=http://loinc.org|8480-6&language=fr,en&x=a$b',
    );
  });

  it('keeps characters that change how the URL splits encoded', () => {
    // A&B=C#D, then a typed "%2C" which arrives as %252C
    const url = '/fhir/Patient?name=A%26B%3DC%23D&family=%252C';
    expect(readableUrl(url)).toBe(url);
  });
});
