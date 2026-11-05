import { parseCapability } from './capability';
import fixture from './mocks/capability.json';

describe('parseCapability', () => {
  const defs = parseCapability(fixture);

  it('drops Resource and DomainResource and keeps the rest in order', () => {
    expect(defs.map((d) => d.type)).toEqual(['Binary', 'Patient']);
  });

  it('keeps only name and type for each search param', () => {
    expect(defs.find((d) => d.type === 'Patient')?.params).toEqual([
      { name: 'birthdate', type: 'date' },
      { name: 'gender', type: 'token' },
      { name: 'name', type: 'string' },
    ]);
  });

  it('gives an empty params list to a type with no searchParam', () => {
    expect(defs.find((d) => d.type === 'Binary')?.params).toEqual([]);
  });

  it.each([
    ['{}', {}],
    ['null', null],
    ['undefined', undefined],
    ['{ rest: [] }', { rest: [] }],
    ['{ rest: [{}] }', { rest: [{}] }],
    ['a non-object', 'metadata'],
  ])('returns [] for malformed input: %s', (_label, input) => {
    expect(parseCapability(input)).toEqual([]);
  });

  it('skips malformed entries instead of throwing', () => {
    const cs = {
      rest: [
        {
          resource: [
            null,
            { type: 42 },
            {
              type: 'Patient',
              searchParam: [
                { name: 'gender', type: 'token' },
                { name: 'weird', type: 'special' },
                { type: 'string' },
                null,
              ],
            },
          ],
        },
      ],
    };
    expect(parseCapability(cs)).toEqual([
      { type: 'Patient', params: [{ name: 'gender', type: 'token' }] },
    ]);
  });
});
