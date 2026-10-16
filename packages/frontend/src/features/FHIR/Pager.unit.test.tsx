import React from 'react';
import { screen } from '@testing-library/react';
import { render } from '../../utils/testing/render';
import Pager from './Pager';
import type { TabResult } from './search';

// Page 2 of 250 results, with a page 3 to go to
const page2: TabResult = {
  sent: { resource: 'Patient', page: '?t=B' },
  trail: [{ offset: 0 }],
  offset: 100,
  bundle: {
    resourceType: 'Bundle',
    total: 250,
    entry: Array.from({ length: 100 }, () => ({})),
  },
  nextPage: '?t=C',
  loading: false,
};

describe('Pager', () => {
  it('is hidden when there is only one page', () => {
    render(
      <Pager
        result={{ ...page2, trail: [], nextPage: undefined }}
        stale={false}
      />,
    );
    expect(screen.queryByRole('button', { name: /next/i })).toBeNull();
  });

  it('shows the range of the current page', () => {
    render(<Pager result={page2} stale={false} />);
    expect(screen.getByText('Showing 101–200 of 250 · page 2')).toBeVisible();
  });

  it('says so while a page loads', () => {
    render(<Pager result={{ ...page2, loading: true }} stale={false} />);
    expect(screen.getByText('Loading page 2…')).toBeVisible();
  });

  it("says a failed page didn't load", () => {
    render(
      <Pager
        result={{
          ...page2,
          bundle: undefined,
          nextPage: undefined,
          error: { status: 503 },
          status: 503,
        }}
        stale={false}
      />,
    );
    expect(screen.getByText("Page 2 didn't load")).toBeVisible();
  });
});
