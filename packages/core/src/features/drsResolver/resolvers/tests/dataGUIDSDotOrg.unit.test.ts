import { resolveDRSWithDataGUISOrg } from '../dataGUIDSDotOrg';


global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ test: 100 }),
    }),
) as jest.Mock;

describe('resolveDRSWithDataGUISOrg', () => {

  // Resolves DRS object ID from a list of guids using dataguids.org
  it('should resolve DRS object ID from a list of guids using dataguids.org', async () => {
    const guidsForHostnameResolution: string[] = ['guid1', 'guid2'];

    const result = await resolveDRSWithDataGUISOrg(guidsForHostnameResolution);

    expect(result).toEqual(expect.arrayContaining(['resolvedId1', 'resolvedId2']));
  });

  // Returns an array of resolved DRS object IDs
  it('should return an array of resolved DRS object IDs', async () => {
    const guidsForHostnameResolution: string[] = ['guid1', 'guid2'];

    const result = await resolveDRSWithDataGUISOrg(guidsForHostnameResolution);

    expect(result).toEqual(expect.arrayContaining(['resolvedId1', 'resolvedId2']));
  });

  // Throws an error if input is an empty array
  it('should throw an error if input is an empty array', async () => {
    const guidsForHostnameResolution: string[] = [];

    await expect(resolveDRSWithDataGUISOrg(guidsForHostnameResolution)).rejects.toThrowError('Invalid input: guidsForHostnameResolution must be an array of strings');
  });

});
