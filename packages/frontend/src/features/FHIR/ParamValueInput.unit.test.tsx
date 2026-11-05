import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/testing/render';
import ParamValueInput from './ParamValueInput';
import type { ParamRow } from './params';

const birthdate: ParamRow = {
  id: 'x',
  name: 'birthdate',
  type: 'date',
  value: '',
  enabled: true,
  prefix: 'ge',
};

const count: ParamRow = {
  id: 'y',
  name: '_count',
  type: 'number',
  value: '',
  enabled: true,
};

// Holds the row the way QueryParams does
const Row = ({ start }: { start: ParamRow }) => {
  const [row, setRow] = useState(start);
  return (
    <ParamValueInput
      row={row}
      onChange={(changes) => setRow((prev) => ({ ...prev, ...changes }))}
    />
  );
};

const DateRow = ({ value = '' }: { value?: string }) => (
  <Row start={{ ...birthdate, value }} />
);

const dateBox = () => screen.getByLabelText('birthdate date');
const countBox = () => screen.getByLabelText('_count value');

describe('ParamValueInput, _count', () => {
  it('hints at the max while empty', () => {
    render(<Row start={count} />);
    expect(countBox()).toHaveAttribute(
      'placeholder',
      'Results per page (default 100, max 1000). Large pages are slow.',
    );
  });

  it('flags a page size over the max', async () => {
    render(<Row start={count} />);
    await userEvent.type(countBox(), '2000');
    expect(
      screen.getByText("Max 1000 per page (the server's limit)"),
    ).toBeInTheDocument();
  });

  it('takes the max itself', async () => {
    render(<Row start={count} />);
    await userEvent.type(countBox(), '1000');
    expect(screen.queryByText(/Max 1000|whole number/)).toBeNull();
  });
});

describe('ParamValueInput, date rows', () => {
  it('keeps a partial date as typed', async () => {
    render(<DateRow />);
    await userEvent.type(dateBox(), '1990');
    await userEvent.tab();
    expect(dateBox()).toHaveValue('1990');
    expect(screen.queryByText(/YYYY|real date/)).toBeNull();
  });

  it('flags a date that does not exist instead of changing it', async () => {
    render(<DateRow />);
    await userEvent.type(dateBox(), '2020-02-30');
    expect(dateBox()).toHaveValue('2020-02-30');
    expect(screen.getByText('Not a real date')).toBeInTheDocument();
  });

  it('flags a date in the wrong shape', async () => {
    render(<DateRow />);
    await userEvent.type(dateBox(), '1990-5');
    expect(
      screen.getByText('Use YYYY, YYYY-MM or YYYY-MM-DD'),
    ).toBeInTheDocument();
  });

  it('fills in a full date from the calendar, opened on the typed month', async () => {
    render(<DateRow value="1990-05" />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Pick birthdate from a calendar' }),
    );
    expect(screen.getByText('May 1990')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^14 May 1990/ }));
    expect(dateBox()).toHaveValue('1990-05-14');
    expect(screen.queryByText('May 1990')).toBeNull();
  });
});
