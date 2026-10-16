import type { ResourceDef } from '@gen3/core';
import {
  addAnother,
  addRows,
  canRepeat,
  newRow,
  paramsFor,
  removeRow,
  rowsToParams,
  setAllEnabled,
  updateRow,
  type ParamRow,
} from './params';

const row = (overrides: Partial<ParamRow>): ParamRow => ({
  id: 'x',
  name: 'gender',
  type: 'token',
  value: '',
  enabled: true,
  ...overrides,
});

describe('newRow', () => {
  it('starts empty and checked', () => {
    expect(newRow({ name: 'gender', type: 'token' })).toMatchObject({
      name: 'gender',
      type: 'token',
      value: '',
      enabled: true,
    });
  });

  it('gives date rows the eq prefix', () => {
    expect(newRow({ name: 'birthdate', type: 'date' }).prefix).toBe('eq');
    expect(newRow({ name: 'gender', type: 'token' }).prefix).toBeUndefined();
  });

  it('gives each row its own id', () => {
    const param = { name: 'birthdate', type: 'date' } as const;
    expect(newRow(param).id).not.toBe(newRow(param).id);
  });

  it('keeps only the key when made from an existing row (the + button)', () => {
    const existing = row({
      id: 'a',
      name: 'birthdate',
      type: 'date',
      prefix: 'ge',
      value: '1980-01-01',
      enabled: false,
    });
    const next = newRow(existing);
    expect(next).toMatchObject({
      name: 'birthdate',
      type: 'date',
      value: '',
      enabled: true,
      prefix: 'eq',
    });
    expect(next.id).not.toBe('a');
  });
});

describe('canRepeat', () => {
  it('allows any search param, whatever its type', () => {
    expect(canRepeat({ name: 'birthdate', type: 'date' })).toBe(true);
    expect(canRepeat({ name: 'language', type: 'token' })).toBe(true);
    expect(canRepeat({ name: 'name', type: 'string' })).toBe(true);
  });

  it('blocks _count and _id', () => {
    expect(canRepeat({ name: '_count', type: 'number' })).toBe(false);
    expect(canRepeat({ name: '_id', type: 'token' })).toBe(false);
  });
});

describe('addAnother', () => {
  const rows = [row({ id: 'a', name: 'birthdate' }), row({ id: 'b' })];
  const added = row({ id: 'new', name: 'birthdate' });

  it('puts the new row right below the clicked one', () => {
    expect(addAnother(rows, 'a', added).map((r) => r.id)).toEqual([
      'a',
      'new',
      'b',
    ]);
  });

  it('leaves the rows alone for an unknown id', () => {
    expect(addAnother(rows, 'nope', added)).toBe(rows);
  });
});

describe('addRows', () => {
  it('puts the new rows after the existing ones', () => {
    const next = addRows(
      [row({ id: 'a' })],
      [row({ id: 'b' }), row({ id: 'c' })],
    );
    expect(next.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('updateRow', () => {
  const rows = [row({ id: 'a' }), row({ id: 'b', name: 'name' })];

  it('merges the changes into the matching row only', () => {
    const next = updateRow(rows, 'a', { value: 'female' });
    expect(next[0]).toEqual({ ...rows[0], value: 'female' });
    expect(next[1]).toBe(rows[1]);
  });
});

describe('removeRow', () => {
  it('drops the matching row and keeps the rest', () => {
    const rows = [row({ id: 'a' }), row({ id: 'b' }), row({ id: 'c' })];
    expect(removeRow(rows, 'b').map((r) => r.id)).toEqual(['a', 'c']);
  });
});

describe('setAllEnabled', () => {
  it('checks or unchecks every row', () => {
    const rows = [row({ id: 'a', enabled: false }), row({ id: 'b' })];
    expect(setAllEnabled(rows, true).every((r) => r.enabled)).toBe(true);
    expect(setAllEnabled(rows, false).some((r) => r.enabled)).toBe(false);
  });
});

describe('paramsFor', () => {
  const capability: ResourceDef[] = [
    {
      type: 'Patient',
      params: [
        { name: 'name', type: 'string' },
        { name: 'birthdate', type: 'date' },
        { name: 'code-value-date', type: 'composite' },
      ],
    },
  ];

  it('puts the extras first, then the server params A to Z, without composites', () => {
    expect(paramsFor(capability, 'Patient')?.map((p) => p.name)).toEqual([
      '_count',
      '_id',
      'birthdate',
      'name',
    ]);
  });

  it('returns undefined for a type the server does not list', () => {
    expect(paramsFor(capability, 'Observation')).toBeUndefined();
  });

  it('returns undefined before the capability loads', () => {
    expect(paramsFor(undefined, 'Patient')).toBeUndefined();
  });
});

describe('rowsToParams', () => {
  it('turns rows into params', () => {
    expect(rowsToParams([row({ value: 'female' })])).toEqual({
      gender: ['female'],
    });
  });

  it('leaves out unchecked rows and rows without a value', () => {
    expect(
      rowsToParams([
        row({ value: 'female', enabled: false }),
        row({ name: 'name', type: 'string', value: '  ' }),
      ]),
    ).toEqual({});
  });

  it('puts the prefix in front of date values', () => {
    expect(
      rowsToParams([
        row({
          name: 'birthdate',
          type: 'date',
          prefix: 'ge',
          value: '1980-01-01',
        }),
      ]),
    ).toEqual({ birthdate: ['ge1980-01-01'] });
  });

  it('groups repeated keys so they are sent as AND', () => {
    expect(
      rowsToParams([
        row({
          name: 'birthdate',
          type: 'date',
          prefix: 'ge',
          value: '1980-01-01',
        }),
        row({ value: 'female' }),
        row({
          name: 'birthdate',
          type: 'date',
          prefix: 'lt',
          value: '1990-01-01',
        }),
      ]),
    ).toEqual({
      birthdate: ['ge1980-01-01', 'lt1990-01-01'],
      gender: ['female'],
    });
  });
});
