import type { Bundle } from '@gen3/core';
import {
  backStep,
  firstPage,
  nextStep,
  retryStep,
  toReply,
  type TabResult,
} from './search';

const bundle = (ids: number, next?: string): Bundle => ({
  resourceType: 'Bundle',
  total: 250,
  entry: Array.from({ length: ids }, () => ({})),
  link: next
    ? [
        {
          relation: 'next',
          url: `https://fhir.example.org/fhir/Patient/${next}`,
        },
      ]
    : [],
});

// Page 2 of a search, with a page 3 to go to
const page2: TabResult = {
  sent: { resource: 'Patient', params: { gender: 'female' }, page: '?t=B' },
  trail: [{ offset: 0 }],
  offset: 100,
  bundle: bundle(100),
  nextPage: '?t=C',
  loading: false,
};

describe('firstPage', () => {
  it('starts with no trail at offset 0', () => {
    expect(firstPage('Patient', { gender: 'female' })).toEqual({
      sent: { resource: 'Patient', params: { gender: 'female' } },
      trail: [],
      offset: 0,
    });
  });
});

describe('nextStep', () => {
  it('asks for the next page and remembers this one', () => {
    expect(nextStep(page2)).toEqual({
      sent: { resource: 'Patient', params: { gender: 'female' }, page: '?t=C' },
      trail: [{ offset: 0 }, { page: '?t=B', offset: 100 }],
      offset: 200,
    });
  });

  it('is undefined on the last page', () => {
    expect(nextStep({ ...page2, nextPage: undefined })).toBeUndefined();
  });
});

describe('backStep', () => {
  it('returns to the page before', () => {
    expect(backStep(page2)).toEqual({
      sent: {
        resource: 'Patient',
        params: { gender: 'female' },
        page: undefined,
      },
      trail: [],
      offset: 0,
    });
  });

  it('is undefined on page 1', () => {
    expect(backStep({ ...page2, trail: [] })).toBeUndefined();
  });
});

describe('retryStep', () => {
  it('repeats the request as a new object', () => {
    const step = retryStep(page2);
    expect(step).toEqual({ sent: page2.sent, trail: page2.trail, offset: 100 });
    expect(step.sent).not.toBe(page2.sent);
  });
});

describe('toReply', () => {
  it('takes the bundle, status and next page from a success', () => {
    const data = { bundle: bundle(100, '?t=X'), status: 200 };
    expect(toReply(data)).toEqual({
      bundle: data.bundle,
      nextPage: '?t=X',
      status: 200,
    });
  });

  it('lets the error win over old data', () => {
    const error = { status: 404, data: { detail: 'Not Found' } };
    expect(toReply({ bundle: bundle(1), status: 200 }, error)).toEqual({
      error,
      status: 404,
    });
  });

  it('has no status for an error without one', () => {
    expect(toReply(undefined, { message: 'boom' }).status).toBeUndefined();
  });

  it("uses the real status of an error page that isn't JSON", () => {
    const error = {
      status: 'PARSING_ERROR',
      originalStatus: 502,
      data: '<html>Bad Gateway</html>',
    };
    expect(toReply(undefined, error)).toEqual({ error, status: 502 });
  });

  it("keeps PARSING_ERROR for a success it couldn't read", () => {
    const error = { status: 'PARSING_ERROR', originalStatus: 200, data: '{' };
    expect(toReply(undefined, error).status).toBe('PARSING_ERROR');
  });

  it('treats a reply that is not a Bundle as an error', () => {
    // An empty 200 body comes back as null
    const reply = toReply({ bundle: null as unknown as Bundle, status: 200 });
    expect(reply).toEqual({
      error: { status: 'PARSING_ERROR', data: null },
      status: 'PARSING_ERROR',
    });
  });

  it('treats no reply at all as an error', () => {
    expect(toReply().status).toBe('PARSING_ERROR');
  });

  it('treats a Bundle with a malformed entry or link as an error', () => {
    const malformed = [
      { link: {} },
      { link: [null] },
      { entry: 'x' },
      { entry: [null] },
    ];
    for (const shape of malformed) {
      const bundle = { resourceType: 'Bundle', ...shape } as unknown as Bundle;
      expect(toReply({ bundle, status: 200 }).status).toBe('PARSING_ERROR');
    }
  });
});
