import type { Bundle } from '@gen3/core';
import {
  canRetry,
  countLabel,
  errorMessage,
  hostOf,
  pageLabel,
  readableUrl,
  statusLabel,
  toAbsoluteUrl,
} from './utils';

describe('errorMessage', () => {
  it('explains the statuses this server sends', () => {
    expect(errorMessage(404)).toMatch(/value it doesn't accept/);
    expect(errorMessage(401)).toMatch(/session has expired/);
    expect(errorMessage('FETCH_ERROR')).toMatch(/Couldn't reach the server/);
  });

  it('treats every 5xx as the server being down', () => {
    expect(errorMessage(502)).toMatch(/isn't responding/);
    expect(errorMessage(599)).toMatch(/isn't responding/);
  });

  it('falls back to a general message', () => {
    expect(errorMessage(418)).toBe('Something went wrong with this search.');
    expect(errorMessage()).toBe('Something went wrong with this search.');
  });
});

describe('canRetry', () => {
  it('only offers Retry where trying again can help', () => {
    expect(canRetry(502)).toBe(true);
    expect(canRetry('FETCH_ERROR')).toBe(true);
    expect(canRetry(404)).toBe(false);
    expect(canRetry(401)).toBe(false);
    expect(canRetry()).toBe(false);
  });
});

describe('pageLabel', () => {
  it('shows the range, the total and the page', () => {
    expect(pageLabel(2, 100, 100, 1175)).toBe(
      'Showing 101–200 of 1,175 · page 2',
    );
  });

  it('leaves the total out when there is none', () => {
    expect(pageLabel(1, 0, 37)).toBe('Showing 1–37 · page 1');
  });

  it('says so when a page came back empty', () => {
    expect(pageLabel(3, 200, 0, 250)).toBe('No results · page 3');
  });
});

describe('statusLabel', () => {
  it('adds the text to an HTTP status', () => {
    expect(statusLabel(200)).toBe('200 OK');
    expect(statusLabel(404)).toBe('404 Not Found');
  });

  it('shows just the number for a status it has no text for', () => {
    expect(statusLabel(418)).toBe('418');
  });

  it('names requests that got no HTTP answer', () => {
    expect(statusLabel('FETCH_ERROR')).toBe('Network error');
    expect(statusLabel('CUSTOM_ERROR')).toBe('CUSTOM_ERROR');
  });
});

describe('countLabel', () => {
  const page = (total?: number): Bundle => ({
    resourceType: 'Bundle',
    total,
    entry: [{}, {}, {}],
  });

  it('uses the total, with thousands separators', () => {
    expect(countLabel(page(475343))).toBe('475,343 resources found');
    expect(countLabel(page(1))).toBe('1 resource found');
  });

  it('says how many came back when there is no total', () => {
    expect(countLabel(page())).toBe('3 shown');
  });
});

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
