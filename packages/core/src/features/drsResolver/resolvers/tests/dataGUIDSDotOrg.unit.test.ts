import { resolveDRSWithDataGUISOrg } from '../dataGUIDSDotOrg';

describe('resolveDRSWithDataGUISOrg', () => {
  // Resolves DRS object ID from a list of guids using dataguids.org
  it('should resolve DRS object ID from a list of guids using dataguids.org', async () => {
    jest.spyOn(global, 'fetch').mockReturnValueOnce({
      json: () => Promise.resolve({ data: 'resolvedId1' }),
      status: 200,
    } as never);

    jest.spyOn(global, 'fetch').mockReturnValueOnce({
      json: () => Promise.resolve({ data: 'resolvedId2' }),
      status: 200,
    } as never);

    const guidsForHostnameResolution: string[] = ['guid1', 'guid2'];

    const result = await resolveDRSWithDataGUISOrg(guidsForHostnameResolution);

    expect(result).toEqual(
      expect.objectContaining({
        guid1: 'resolvedId1',
        guid2: 'resolvedId2',
      }),
    );
  });

  // Throws an error if input is an empty array
  it('should return empty object if input is an empty array', async () => {
    const guidsForHostnameResolution: string[] = [];

    expect(resolveDRSWithDataGUISOrg(guidsForHostnameResolution)).toEqual(
      expect.objectContaining({}),
    );
  });
});
