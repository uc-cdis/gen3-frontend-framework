import { combineManifests, getDisabledState } from '../utils';

jest.mock('@gen3/core', () => ({
  GEN3_DOMAIN: 'commons1.gen3.org',
}));

describe('combineManifests', () => {
  it('should return an empty array when selectedResources is empty', () => {
    const result = combineManifests([], 'files');
    expect(result).toEqual([]);
  });

  it('should return combined data objects for selected studies', () => {
    const studies = [
      {
        id: 'study-1',
        files: [{ file_id: 'f1', size: 100 }],
      },
      {
        id: 'study-2',
        files: [{ file_id: 'f2', size: 200 }],
      },
      {
        id: 'study-3',
        // missing files field
      },
    ];

    const result = combineManifests(studies, 'files');
    expect(result).toEqual([
      { file_id: 'f1', size: 100 },
      { file_id: 'f2', size: 200 },
    ]);
  });

  it('should inject commons_url from study when commons_url is not in GEN3_DOMAIN', () => {
    const studies = [
      {
        id: 'study-external',
        commons_url: 'external-commons.org',
        files: [
          { file_id: 'f1' },
          { file_id: 'f2', commons_url: 'specific-commons.org' },
        ],
      },
      {
        id: 'study-internal',
        commons_url: 'commons1.gen3.org',
        files: [{ file_id: 'f3' }],
      },
    ];

    const result = combineManifests(studies, 'files');
    expect(result).toEqual([
      { file_id: 'f1', commons_url: 'external-commons.org' },
      { file_id: 'f2', commons_url: 'specific-commons.org' },
      { file_id: 'f3' },
    ]);
  });
});

describe('getDisabledState', () => {
  it('should return disabled if login is required and user is not authenticated', () => {
    const state = getDisabledState(false, 2, true, 'manifest');
    expect(state.disabled).toBe(true);
    expect(state.disabledReason).toBe(
      'You must be logged in to download a manifest',
    );
  });

  it('should return disabled if no resources are selected', () => {
    const state = getDisabledState(true, 0, false, 'manifest');
    expect(state.disabled).toBe(true);
    expect(state.disabledReason).toBe(
      'You must select at least one study to download a manifest',
    );
  });

  it('should return enabled when authenticated and resources are selected', () => {
    const state = getDisabledState(true, 3, true, 'manifest');
    expect(state.disabled).toBe(false);
    expect(state.disabledReason).toBeUndefined();
  });
});
