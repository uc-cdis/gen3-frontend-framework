import React, { useState } from 'react';
import { render } from '../../../utils/testing/index';
import userEvent from '@testing-library/user-event';
import { DiscoveryContext } from '../DiscoveryProvider';
import type { DiscoveryIndexConfig } from '../types';
import { AccessLevel } from '../../../utils';
import DataAccessFilterDropdown from './DataAccessFilterDropdown';

const TestComponent = ({
  initialSelected = [],
  onApply,
}: {
  initialSelected?: number[];
  onApply?: (levels: number[]) => void;
}) => {
  const [selectedAccessLevels, setSelectedAccessLevels] =
    useState<number[]>(initialSelected);

  return (
    <DiscoveryContext.Provider
      value={{
        discoveryConfig: {} as DiscoveryIndexConfig,
        selectedTags: {},
        setSelectedTags: () => {},
        selectedAccessLevels,
        setSelectedAccessLevels: (action) => {
          setSelectedAccessLevels((prev) => {
            const next = typeof action === 'function' ? action(prev) : action;
            onApply?.(next);
            return next;
          });
        },
      }}
    >
      <DataAccessFilterDropdown />
    </DiscoveryContext.Provider>
  );
};

describe('<DataAccessFilterDropdown />', () => {
  it('renders filter trigger button with accessible label', () => {
    const { getByRole } = render(<TestComponent />);
    const button = getByRole('button', { name: 'Filter by data access' });
    expect(button).toBeInTheDocument();
  });

  it('opens popover on click and reflects initial selected access levels', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <TestComponent initialSelected={[AccessLevel.ACCESSIBLE]} />,
    );

    const button = getByRole('button', { name: 'Filter by data access' });
    await user.click(button);

    const availableCheckbox = getByRole('checkbox', { name: /^Available$/i });
    const waitingCheckbox = getByRole('checkbox', { name: /^Waiting$/i });

    expect(availableCheckbox).toBeChecked();
    expect(waitingCheckbox).not.toBeChecked();
  });

  it('updates selection and applies changes when clicking OK', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    const { getByRole, queryByRole } = render(
      <TestComponent
        initialSelected={[AccessLevel.ACCESSIBLE]}
        onApply={onApply}
      />,
    );

    const button = getByRole('button', { name: 'Filter by data access' });
    await user.click(button);

    const waitingCheckbox = getByRole('checkbox', { name: /^Waiting$/i });
    await user.click(waitingCheckbox);
    expect(waitingCheckbox).toBeChecked();

    const okButton = getByRole('button', { name: 'OK' });
    await user.click(okButton);

    expect(onApply).toHaveBeenCalledWith([
      AccessLevel.ACCESSIBLE,
      AccessLevel.WAITING,
    ]);
    expect(
      queryByRole('checkbox', { name: /^Waiting$/i }),
    ).not.toBeInTheDocument();
  });

  it('clears all selections when clicking Reset', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    const { getByRole, queryByRole } = render(
      <TestComponent
        initialSelected={[AccessLevel.ACCESSIBLE]}
        onApply={onApply}
      />,
    );

    const button = getByRole('button', { name: 'Filter by data access' });
    await user.click(button);

    const resetButton = getByRole('button', { name: 'Reset' });
    await user.click(resetButton);

    expect(onApply).toHaveBeenCalledWith([]);
    expect(
      queryByRole('checkbox', { name: /^Available$/i }),
    ).not.toBeInTheDocument();
  });

  it('discards uncommitted draft changes when closing popover via trigger toggle', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();
    const { getByRole } = render(
      <TestComponent
        initialSelected={[AccessLevel.ACCESSIBLE]}
        onApply={onApply}
      />,
    );

    const button = getByRole('button', { name: 'Filter by data access' });
    await user.click(button);

    const waitingCheckbox = getByRole('checkbox', { name: /^Waiting$/i });
    await user.click(waitingCheckbox);
    expect(waitingCheckbox).toBeChecked();

    // Toggle close without clicking OK
    await user.click(button);
    expect(onApply).not.toHaveBeenCalled();

    // Reopen to verify draft reverted to committed selectedAccessLevels
    await user.click(button);
    expect(getByRole('checkbox', { name: /^Waiting$/i })).not.toBeChecked();
    expect(getByRole('checkbox', { name: /^Available$/i })).toBeChecked();
  });
});
